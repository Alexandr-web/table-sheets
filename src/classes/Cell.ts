import { ICellClass, ITableClass, ICell, IInputClass } from "@/interfaces";

import getValByFormula from "@/utils/getValByFormula";

export default class Cell implements ICellClass {
    elCells: NodeListOf<HTMLLIElement>;
    elLetters: NodeListOf<HTMLDivElement>;
    activeClassName: string;
    updatingClassName: string;
    table: ITableClass;
    input: IInputClass;

    constructor(table: ITableClass, input: IInputClass) {
        this.elCells = document.querySelectorAll(".wrapper__cells-list-item") as NodeListOf<HTMLLIElement>;
        this.elLetters = document.querySelectorAll(".wrapper__cells-letter") as NodeListOf<HTMLDivElement>;
        this.activeClassName = "active";
        this.updatingClassName = "updating";
        this.table = table;
        this.input = input;
    }

    // получение элементов чисел (получаем через метод, так как они могут обновляться после изменения размеров экрана)
    _getElNums(): NodeListOf<HTMLLIElement> {
        return document.querySelectorAll(".wrapper__nums-list-item") as NodeListOf<HTMLLIElement>;
    }

    // удаление активного класса у ячеек, чисел и букв
    _clearActive(): void {
        this.elCells.forEach((cell) => cell.classList.remove(this.activeClassName));
        this._getElNums().forEach((num) => num.classList.remove(this.activeClassName));
        this.elLetters.forEach((letter) => letter.classList.remove(this.activeClassName));
    }

    // добавление активного класса выбранной ячейке, букве и числу
    _setActive(cell: HTMLLIElement): void {
        const [activeLetter, activeNum] = JSON.parse(cell.dataset.pos as string);
        const index: number = parseInt(cell.dataset.index as string);
        const findCell: ICell = this.table.data.cells[index];
        const findActiveElLetter: HTMLDivElement = Array
            .from(this.elLetters)
            .find((el) => el.dataset.val === activeLetter) as HTMLDivElement;
        const findActiveElNum: HTMLLIElement = Array
            .from(this._getElNums())
            .find((el) => el.dataset.val === activeNum.toString()) as HTMLLIElement;

        this._clearActive();

        cell.classList.add(this.activeClassName);

        findActiveElLetter.classList.add(this.activeClassName);
        findActiveElNum.classList.add(this.activeClassName);

        // добавляем содержание ячейки в инпут
        this.input.setValue(findCell);
    }

    // определение содержимого ячейки
    _setContent(cell: HTMLLIElement): void {
        const index: number = parseInt(cell.dataset.index as string);
        const currentCell: ICell = this.table.data.cells[index] as ICell;
        const pos: string = JSON.stringify(currentCell.position);
        const prevVal: string = currentCell.content;

        // проверка на существование этой ячейки в связанном списке ячеек, что участвуют в формулах/функциях
        this.table.checkFormulaCellToLinked(pos, cell.innerText, prevVal);

        const currentVal: string = getValByFormula(cell.innerText, this.table, currentCell);
        const findCellInFormulas: Set<string>|undefined = this.table.cellsLinkedToFormulas.get(pos);

        if (prevVal !== currentVal) {
            // изменение содержимого ячейки
            this.table._editCellContent(cell, currentVal, index);

            if (findCellInFormulas) {
                this.table.updateFormulaCells(findCellInFormulas, "updating");
            }
        }
    }

    // инициализация работы ячеек
    init(): void {
        this.elCells.forEach((cell) => {
            cell.addEventListener("focus", this._setActive.bind(this, cell));
            cell.addEventListener("blur", this._setContent.bind(this, cell));
            cell.addEventListener("animationend", () => cell.classList.remove(this.updatingClassName));
        });
    }
}