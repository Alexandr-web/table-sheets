import { ICellClass, ITableClass, ICell } from "@/interfaces";

import getValByFormula from "@/utils/getValByFormula";

export default class Cell implements ICellClass {
    elCells: NodeListOf<HTMLLIElement>;
    elLetters: NodeListOf<HTMLDivElement>;
    activeClassName: string;
    table: ITableClass;

    constructor(table: ITableClass) {
        this.elCells = document.querySelectorAll(".wrapper__cells-list-item") as NodeListOf<HTMLLIElement>;
        this.elLetters = document.querySelectorAll(".wrapper__cells-letter") as NodeListOf<HTMLDivElement>;
        this.activeClassName = "active";
        this.table = table;
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
        const [activeLetter, activeNum] = JSON.parse((cell.dataset.pos as string));
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
    }

    _editContent(cell: HTMLLIElement, val: string, index: number): void {
        this.table.editCellData(index, "content", val);
        this.table.saveLocalData();

        cell.innerText = val;
    }

    _setContent(cell: HTMLLIElement): void {
        const index: number = parseInt(cell.dataset.index as string);
        const currentCell: ICell = this.table.data.cells[index] as ICell;
        const pos: string = JSON.stringify(currentCell.position);
        const prevVal: string = currentCell.content;
        const currentVal: string = getValByFormula(cell.innerText, this.table, currentCell);
        const findCellInFormulas: Set<string>|undefined = this.table.cellsLinkedToFormulas.get(pos);

        if (prevVal !== currentVal) {
            this._editContent(cell, currentVal, index);

            if (findCellInFormulas) {
                this.updateFormulaCells(findCellInFormulas);
            }
        }
    }

    updateFormulaCells(cell: Set<string>): void {
        cell.forEach((str) => {
            const [pos, formula] = str.split("|");
            const findIdxCell: number = this.table.data.cells.findIndex(({ position }) => JSON.stringify(position) === pos);

            if (findIdxCell !== -1) {
                const newVal: string = getValByFormula(formula, this.table, this.table.data.cells[findIdxCell]);
                const findElCell: HTMLLIElement|undefined = Array.from(this.elCells).find((el) => el.dataset.pos === pos);

                if (findElCell) {
                    this._editContent(findElCell, newVal, findIdxCell);
                }
            }
        });
    }

    // инициализация работы ячеек
    init(): void {
        this.elCells.forEach((cell) => {
            cell.addEventListener("focus", this._setActive.bind(this, cell));
            cell.addEventListener("blur", this._setContent.bind(this, cell));
        });
    }
}