import { ITableClass, ITableData, ICell, ICellStyles } from "@/interfaces";
import { EnglishAlphabet, Colors, CombinationsLetters, CellSizes } from "@/enums";
import { TAccumulatorCells, TCellsLinkedToFormulas } from "@/types";
import pxToVw from "@/utils/pxToVw";

export default class Table implements ITableClass {
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    data: ITableData;
    cellsLinkedToFormulas: TCellsLinkedToFormulas;
    _countNums: number;
    _startX: number|null;
    _currentRowWidth: number|null;
    _currentRow: HTMLDivElement|null;
    _currentRowElCells: NodeListOf<HTMLLIElement>|null;
    _startY: number|null;
    _currentColHeight: number|null;
    _currentCol: HTMLSpanElement|null;
    _currentColElCells: NodeListOf<HTMLLIElement>|null;

    constructor(countNums: number = CombinationsLetters.MIN) {
        // список, содержащий ячейки, привязанные друг к другу с помощью формул/функций
        this.cellsLinkedToFormulas = new Map<string, Set<string>>();
        this.data = {
            letters: [],
            nums: [],
            cells: [],
        };

        this.elListNums = document.querySelector(".wrapper__nums-list") as HTMLUListElement;
        this.elWrapCells = document.querySelector(".wrapper__cells") as HTMLDivElement;

        // данные для ширины ряда
        this._startX = null;
        this._currentRow = null;
        this._currentRowWidth = null;
        this._currentRowElCells = null;

        // данные для высоты колонки
        this._startY = null;
        this._currentCol = null;
        this._currentColHeight = null;
        this._currentColElCells = null;

        if (countNums < CombinationsLetters.MIN) {
            this._countNums = CombinationsLetters.MIN;
        } else if (countNums > CombinationsLetters.MAX) {
            this._countNums = CombinationsLetters.MAX;
        } else {
            this._countNums = countNums;
        }
    }

    // длина английского алфавита
    _getLengthEnglishAlphabet(): number {
        return Object
            .keys(EnglishAlphabet)
            .filter((key) => isNaN(Number(key)))
            .length;
    }

    _getLetters(): Array<string> {
        return this.data.letters;
    }

    _getNums(): Array<number> {
        return this.data.nums;
    }

    _getCells(): Array<ICell> {
        return this.data.cells;
    }

    // получение чисел таблицы
    _fillNums(): Array<number> {
        const result: Array<number> = [];

        for (let i = 1; i <= this._countNums; i++) {
            result.push(i);
        }

        return result;
    }

    // получение букв таблицы
    _fillLetters(lettersArr?: Array<string>, iteration?: number): Array<string> {
        const result: Array<string> = lettersArr || [];

        // выход из рекурсии с выводом всех возможных комбинаций букв
        if (result.length >= this._countNums) {
            return result;
        }

        const lengthEnglishAlphabet: number = this._getLengthEnglishAlphabet();

        // заполнение массива буквами/комбинациями букв
        if (typeof iteration === "number" && this._countNums > lengthEnglishAlphabet) {
            // добавляем комбинацию букв, если количество чисел больше, чем длина английского алфавита
            const remainder: number = this._countNums - result.length;

            let count: number = remainder > lengthEnglishAlphabet ? CombinationsLetters.MIN : remainder;

            for (let i = 0; i < count; i++) {
                const str: string = EnglishAlphabet[iteration] + EnglishAlphabet[i];

                result.push(str);
            }
        } else {
            for (let i = 0; i < lengthEnglishAlphabet; i++) {
                const str: string = EnglishAlphabet[i];

                result.push(str);
            }
        }

        // на каждый вызов функции увеличиваем итерацию на 1 для последующей комбинации букв
        return this._fillLetters(result, (iteration === undefined ? -1 : iteration) + 1);
    }

    // получение ячеек таблицы
    _fillCells(): Array<ICell> {
        const result: Array<ICell> = [];
        
        let idxCell: number = -1;

        for (let i = 0; i < this._countNums; i++) {
            for (let j = 0; j < this._countNums; j++) {
                idxCell++;
                
                const cell: ICell = {
                    position: [this._getLetters()[i], this._getNums()[j]],
                    content: "",
                    index: idxCell,
                    color: Colors.BLACK,
                    background: Colors.WHITE,
                    width: CellSizes.DEFAULT_WIDTH,
                    height: CellSizes.DEFAULT_HEIGHT,
                };

                result.push(cell);
            }
        }

        return result;
    }

    // добавление ячейки, которая участвует в формуле/функции и ячейки, в которой данная формула/функция осуществляется
    addCellToFormulasList(posLinkedCell: string, posFormulaCell: string, formula: string): void {
        const findCell: Set<string>|undefined = this.cellsLinkedToFormulas.get(posLinkedCell);
        const valCell: string = `${posFormulaCell}|${formula}`;
        
        if (findCell && !findCell.has(valCell)) {
            findCell.add(valCell);

            this.cellsLinkedToFormulas.set(posLinkedCell, findCell);
        } else if (!findCell) {
            this.cellsLinkedToFormulas.set(posLinkedCell, new Set<string>([valCell]));
        }
    }

    // удаление ячейки, в которой осуществляется формула/функция
    removeCellFromFormulasList(posLinkedCell: string, valFormulaCell: string): void {
        const findLinkedCell: Set<string>|undefined = this.cellsLinkedToFormulas.get(posLinkedCell);

        if (findLinkedCell) {
            findLinkedCell.delete(valFormulaCell);

            // также удаяем ячейку, что участвует в формуле/функции
            if (!findLinkedCell.size) {
                this.cellsLinkedToFormulas.delete(posLinkedCell);
            }
        }
    }

    // добавление ячеек в таблицу
    renderCells(): void {
        const cells: Array<ICell> = this._getCells();
        const letters: Array<string> = this._getLetters();

        // сортировка массива всех ячеек в двумерный массив, где каждый массив содержит ячейки одной буквы
        const sortedCellsByLetter: TAccumulatorCells = cells.reduce<TAccumulatorCells>((acc, cell) => {
            const [letter] = cell.position;
            const findMatchLetterIdx: number = acc
                .findIndex((arr) => arr.find(({ position }) => position[0] === letter));

            if (findMatchLetterIdx !== -1) {
                acc[findMatchLetterIdx].push(cell);
            } else {
                acc.push([cell]);
            }

            return acc;
        }, []);

        // функции для получения HTML строк ячейки и буквы
        const cellHTML = (cell: ICell): string => {
            const pos: string = JSON.stringify(cell.position);
            const styles: ICellStyles<string> = {
                color: cell.color,
                background: cell.background,
                width: `${pxToVw(cell.width)}vw`,
                height: `${pxToVw(cell.height)}vw`,
            };
            const inlineStyles: string = Object
                .entries(styles)
                .map(([prop, val]) => `${prop}: ${val}`)
                .join(";");

            return `<li class="wrapper__cells-list-item" style="${inlineStyles}" data-index="${cell.index}" data-pos='${pos}' data-letter="${cell.position[0]}" data-num="${cell.position[1]}" contenteditable>${cell.content}</li>`;
        };
        const cellLetterHTML = (letter: string): string => 
            `<div class="wrapper__cells-letter" data-val="${letter}">
                <span>${letter}</span>
                <span class="wrapper__cells-letter-thin"></span>
            </div>`;

        // добавление ячеек и букв в формате строки HTML в элемент
        sortedCellsByLetter.forEach((list, idxList) => {
            const widthRow: number = list[0].width;

            // HTML строка ячейки
            const cellsHTML: string = list.map(cellHTML).join("\n");
            // HTML строка списка ячеек
            const listHTML: string = 
                `<ul class="wrapper__cells-list">${cellsHTML}</ul>`;

            // HTML строка контента колонки
            const rowContentHTML: string = [cellLetterHTML(letters[idxList]), listHTML].join("\n");
            // HTML строка ряда с буквой и списком ячеек
            const rowHTML = `<div class="wrapper__cells-row" style="width: ${pxToVw(widthRow)}vw">${rowContentHTML}</div>`;

            this.elWrapCells.innerHTML += rowHTML;
        });
    }

    // добавление чисел в таблицу
    renderNums(): void {
        const firstRow: HTMLDivElement = document.querySelector(".wrapper__cells-row") as HTMLDivElement;
        const firstCell: HTMLLIElement = firstRow.querySelector(".wrapper__cells-list-item") as HTMLLIElement;
        const top: number = firstCell.offsetTop;

        this.elListNums.style.marginTop = `${pxToVw(top)}vw`;

        this._getNums().forEach((num) => {
            const cellByNum: HTMLLIElement = document.querySelector(`.wrapper__cells-list-item[data-num="${num}"]`) as HTMLLIElement;
            const height: number = cellByNum.offsetHeight;
            const numHTML: string = `<li class="wrapper__nums-list-item" style="height: ${pxToVw(height)}vw" data-val="${num}">
                <span>${num}</span>
                <span class="wrapper__nums-list-item-thin"></span>
            </li>`;

            this.elListNums.innerHTML += numHTML;
        });
    }

    // очистка содержимого HTML у списка чисел
    clearNums(): void {
        this.elListNums.innerHTML = "";
    }

    // обновление данных во время изменения размеров экрана
    _resizeHandler(): void {
        this.clearNums();
        this.renderNums();

        this._initEventsToResizeColumn();
    }

    // фиксирование данных изменяемого ширину ряда
    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void {
        const parentRow: HTMLDivElement = thin.closest(".wrapper__cells-row") as HTMLDivElement;
        const parentLetter: HTMLDivElement = thin.closest(".wrapper__cells-letter") as HTMLDivElement;
        const letter: string = parentLetter.dataset.val as string;
        const cells: NodeListOf<HTMLLIElement> = document.querySelectorAll(`.wrapper__cells-list-item[data-letter="${letter}"]`) as NodeListOf<HTMLLIElement>;

        this._currentRowWidth = parentRow.offsetWidth;
        this._currentRow = parentRow;
        this._startX = e.pageX;
        this._currentRowElCells = cells;
    }

    // фиксирование данных изменяемой высоту колонки
    _startResizeCol(e: MouseEvent, thin: HTMLSpanElement): void {
        const parentCol: HTMLLIElement = thin.closest(".wrapper__nums-list-item") as HTMLLIElement;
        const num: string = parentCol.dataset.val as string;
        const cells: NodeListOf<HTMLLIElement> = document.querySelectorAll(`.wrapper__cells-list-item[data-num="${num}"]`) as NodeListOf<HTMLLIElement>;

        this._currentColHeight = parentCol.offsetHeight;
        this._currentCol = parentCol;
        this._startY = e.pageY;
        this._currentColElCells = cells;
    }

    // изменение ширины ряда
    _mouseResizeRow(e: MouseEvent): void {
        if (this._startX === null || this._currentRowWidth === null || this._currentRow === null || this._currentRowElCells === null) {
            return;
        }

        const currentX: number = e.pageX;
        const width: number = currentX - this._startX + this._currentRowWidth;
        const widthStr: string = `${pxToVw(width)}vw`;

        if (width >= CellSizes.MIN_WIDTH) {
            this._currentRow.style.width = widthStr;

            this._currentRowElCells.forEach((cell) => {
                const idx: number = parseInt(cell.dataset.index as string);

                cell.style.width = widthStr;

                this.editCellData(idx, "width", width);
            });
        }
    }

    // изменение высоты колонки ячеек
    _mouseResizeColumn(e: MouseEvent): void {
        if (this._startY === null || this._currentColHeight === null || this._currentCol === null || this._currentColElCells === null) {
            return;
        }

        const currentY: number = e.pageY;
        const height: number = currentY - this._startY + this._currentColHeight;
        const heightStr: string = `${pxToVw(height)}vw`;
        
        if (height >= CellSizes.MIN_HEIGHT) {
            this._currentCol.style.height = heightStr;

            this._currentColElCells.forEach((cell) => {
                const idx: number = parseInt(cell.dataset.index as string);

                cell.style.height = heightStr;

                this.editCellData(idx, "height", height);
            });
        }
    }

    // очистка данных для изменения ячеек
    _stopResizeCells(): void {
        this._currentRowWidth = null;
        this._currentRow = null;
        this._startX = null;
        this._currentRowElCells = null;

        this._startY = null;
        this._currentColHeight = null;
        this._currentCol = null;
        this._currentColElCells = null;

        this.saveLocalData();
    }

    // инициализация событий для изменения ширины ряда ячеек
    _initEventsToResizeRow(): void {
        const thins: NodeListOf<HTMLSpanElement> = document.querySelectorAll(".wrapper__cells-letter-thin") as NodeListOf<HTMLSpanElement>;

        thins.forEach((thin) => {
           thin.addEventListener("mousedown", (e) => this._startResizeRow(e, thin));
        });

        // избавляемся от прошлого события на высоту ячеек
        window.removeEventListener("mousemove", this._mouseResizeColumn.bind(this));
        // добавляем новое событие на изменение ширины ряда ячеек
        window.addEventListener("mousemove", this._mouseResizeRow.bind(this));
    }

    // инициализация событий для изменения высоты колонки ячеек
    _initEventsToResizeColumn(): void {
        const thins: NodeListOf<HTMLSpanElement> = document.querySelectorAll(".wrapper__nums-list-item-thin") as NodeListOf<HTMLSpanElement>;

        thins.forEach((thin) => {
           thin.addEventListener("mousedown", (e) => this._startResizeCol(e, thin)); 
        });

        // избавляемся от прошлого события на ширину ряда ячеек
        window.removeEventListener("mousemove", this._mouseResizeRow.bind(this));
        // добавляем новое событие на изменение высоты колонки ячеек
        window.addEventListener("mousemove", this._mouseResizeColumn.bind(this));
    }

    // инициализация событий для изменения размеров ячеек
    _initEventsToResizeCells(): void {
        // добавление событий для изменения ширины ряда ячеек
        this._initEventsToResizeRow();
        // добавление событий для изменения высоты колонки ячеек
        this._initEventsToResizeColumn();

        window.addEventListener("mouseup", this._stopResizeCells.bind(this));
    }

    // изменение данных ячейки по ее индексу
    editCellData(idx: number, key: keyof ICell, value: unknown): void {
        const findCell: ICell = this.data.cells[idx];

        this.data.cells.splice(idx, 1, { ...findCell, [key]: value, });
    }

    // сохранение данных таблицы в локальное хранилище
    saveLocalData(data?: ITableData): void {
        const tableData: ITableData = data ? data : this.data;

        localStorage.setItem("table-data", JSON.stringify(tableData));
    }

    // сохранение данных ячеек, что участвуют в формулах/функциях
    saveCellsLinkedToFormulas(data?: TCellsLinkedToFormulas): void {
        const tableData: TCellsLinkedToFormulas = data ? data : this.cellsLinkedToFormulas;
        const saveVal: Array<[string, string[]]> = [];

        tableData.forEach((arrStr, key) => saveVal.push([key, Array.from(arrStr)]));

        localStorage.setItem("formulas-cells", JSON.stringify(saveVal));
    }

    // отображение данных таблицы на странице
    render(formulasCells?: Array<[string, string[]]>, data?: ITableData): ITableClass {
        if (data !== undefined && Object.keys(data).length) {
            this.data = data;
        } else {
            this.data.letters = this._fillLetters();
            this.data.nums = this._fillNums();
            this.data.cells = this._fillCells();
        }

        if (formulasCells !== undefined && formulasCells.length) {
            formulasCells.forEach(([key, arrStr]) => {
                this.cellsLinkedToFormulas.set(key, new Set(arrStr));
            });
        }

        this.renderCells();
        this.renderNums();

        window.removeEventListener("resize", this._resizeHandler.bind(this));
        window.addEventListener("resize", this._resizeHandler.bind(this));

        // добавляем события для изменения размеров ячеек
        this._initEventsToResizeCells();
        // сохраняем все данные таблицы в локальное хранилище
        this.saveLocalData();

        return this;
    }
}