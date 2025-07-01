import { ICellClass, ITableClass } from "@/interfaces";

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

    _setContent(cell: HTMLLIElement): void {
        const index: number = parseInt(cell.dataset.index as string);
        const prevVal: string = this.table.data.cells[index].content;
        const currentVal: string = cell.innerText;

        if (prevVal !== currentVal) {
            this.table.editCellData(index, "content", cell.innerText);
            this.table.saveLocalData();
        }
    }

    // инициализация работы ячеек
    init(): void {
        this.elCells.forEach((cell) => {
            cell.addEventListener("focus", this._setActive.bind(this, cell));
            cell.addEventListener("blur", this._setContent.bind(this, cell));
        });
    }
}