import { ICell, IFormulaClass, IInputClass, ITableClass, IUtilsClass } from "@/interfaces";
import Formula from "@/classes/Formula";
import Utils from "@/classes/Utils";

const utils: IUtilsClass = new Utils();
const formula: IFormulaClass = new Formula();

export default class Input implements IInputClass {
    inputEl: HTMLInputElement;
    table: ITableClass;
    activeCell: ICell|null;

    constructor(table: ITableClass) {
        this.inputEl = document.querySelector(".wrapper__area-input") as HTMLInputElement;
        this.table = table;
        this.activeCell = null;
    }

    // изменение значения инпута содержанием (если имеется, то формулой) активной ячейки
    setValue(cell: ICell): void {
        const pos: string = JSON.stringify(cell.position);
        const findFormula: string|undefined = utils.getFormulaCellByPos(pos, this.table);

        this.inputEl.value = findFormula ? findFormula : cell.content;
        this.activeCell = cell;
    }

    // получение значения инпута
    _getValue(): string {
        return this.inputEl.value.trim();
    }

    // изменение содержимого текущей ячейки
    _blurHandler(): void {
        const inputVal: string = this._getValue();

        if (!this.activeCell || this.activeCell.content === inputVal) {
            return;
        }

        const pos: string = JSON.stringify(this.activeCell.position);
        const index: number = this.activeCell.index;
        const elCell: HTMLLIElement = document.querySelector(`.wrapper__cells-list-item[data-index="${index}"]`) as HTMLLIElement;

        // проверка на существование текущей ячейки в связанном списке ячеек, что участвуют в формулах/функциях
        this.table.checkFormulaCellToLinked(pos, inputVal, this.activeCell.content);

        const newVal: string = formula.getValueFromFormula(inputVal, this.table, this.activeCell);
        const findCellInFormulas: Set<string>|undefined = this.table.cellsLinkedToFormulas.get(pos);

        // изменение содержимого ячейки
        this.table.editCellContent(elCell, newVal, index);

        if (findCellInFormulas) {
            this.table.updateFormulaCells(findCellInFormulas, "updating");
        }
    }

    // инициализация работы инпута
    init(): IInputClass {
        this.inputEl.addEventListener("blur", this._blurHandler.bind(this));

        return this;
    }
}