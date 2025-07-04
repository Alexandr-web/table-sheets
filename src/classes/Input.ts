import { ICell, IInputClass, ITableClass } from "@/interfaces";
import getValByFormula from "@/utils/getValByFormula";

export default class Input implements IInputClass {
    inputEl: HTMLInputElement;
    table: ITableClass;
    activeCell: ICell|null;

    constructor(table: ITableClass) {
        this.inputEl = document.querySelector(".wrapper__area-input") as HTMLInputElement;
        this.table = table;
        this.activeCell = null;

        this.inputEl.addEventListener("blur", this._blurHandler.bind(this));
    }

    // изменение значения инпута содержанием (если имеется, то формулой) активной ячейки
    setValue(cell: ICell): void {
        const pos: string = JSON.stringify(cell.position);
        const cellsArr: Array<[string, Set<string>]> = Array.from(this.table.cellsLinkedToFormulas);

        let findActiveCell: string|null = null;

        for (let i = 0; i < cellsArr.length; i++) {
            const [_, setArr] = cellsArr[i];
            const cellsFormulasPos: Array<string> = Array.from(setArr);
            const findIdxActiveCell: number = cellsFormulasPos.findIndex((str) => str.split("|")[0] === pos);

            if (findIdxActiveCell !== -1) {
                findActiveCell = cellsFormulasPos[findIdxActiveCell];

                break;
            }
        }

        if (findActiveCell) {
            const formula: string = findActiveCell.split("|")[1];

            this.inputEl.value = formula;
        } else {
            this.inputEl.value = cell.content;
        }

        this.activeCell = cell;
    }

    // получение значения инпута
    _getValue(): string {
        return this.inputEl.value.trim();
    }

    // изменение содержимого текущей ячейки
    _blurHandler(): void {
        if (!this.activeCell) {
            return;
        }

        const inputVal: string = this._getValue();
        const pos: string = JSON.stringify(this.activeCell.position);
        const index: number = this.activeCell.index;
        const elCell: HTMLLIElement = document.querySelector(`.wrapper__cells-list-item[data-index="${index}"]`) as HTMLLIElement;

        // проверка на существование текущей ячейки в связанном списке ячеек, что участвуют в формулах/функциях
        this.table.checkFormulaCellToLinked(pos, inputVal, this.activeCell.content);

        const newVal: string = getValByFormula(inputVal, this.table, this.activeCell);
        const findCellInFormulas: Set<string>|undefined = this.table.cellsLinkedToFormulas.get(pos);

        // изменение содержимого ячейки
        this.table._editCellContent(elCell, newVal, index);

        if (findCellInFormulas) {
            this.table.updateFormulaCells(findCellInFormulas, "updating");
        }
    }
}