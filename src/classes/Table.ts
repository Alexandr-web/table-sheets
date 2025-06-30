import { ITableClass, ICell } from "@/interfaces";
import { EnglishAlphabet, Colors } from "@/enums";
import { TAccumulatorCells } from "@/types";
import pxToVw from "@/utils/pxToVw";

// минимальное количество комбинаций
const minCombinations: number = 26;
// максимально возможное количество комбинаций
const maxCombinations: number = 702;
// минимально возможная ширина ряда ячеек
const minRowWidth: number = 40;

export default class Table implements ITableClass {
    nums: Array<number>;
    letters: Array<string>;
    cells: Array<ICell>;
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    _countNums: number;
    _startX: number|null;
    _currentRowWidth: number|null;
    _currentRow: HTMLDivElement|null;

    constructor(countNums: number = minCombinations) {
        this.nums = [];
        this.letters = [];
        this.cells = [];
        this.elListNums = document.querySelector(".wrapper__nums-list") as HTMLUListElement;
        this.elWrapCells = document.querySelector(".wrapper__cells") as HTMLDivElement;

        this._startX = null;
        this._currentRow = null;
        this._currentRowWidth = null;

        if (countNums < minCombinations) {
            this._countNums = minCombinations;
        } else if (countNums > maxCombinations) {
            this._countNums = maxCombinations;
        } else {
            this._countNums = countNums;
        }
    }

    // длина английского алфавита
    _getLengthEnglishAlphabet(): number {
        return Object
            .keys(EnglishAlphabet)
            .filter(key => isNaN(Number(key)))
            .length;
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

            let count: number = remainder > lengthEnglishAlphabet ? minCombinations : remainder;

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

        for (let i = 0; i < this._countNums; i++) {
            for (let j = 0; j < this._countNums; j++) {
                const cell: ICell = {
                    position: [this.letters[i], this.nums[j]],
                    content: "",
                    color: Colors.BLACK,
                    background: Colors.WHITE,
                };

                result.push(cell);
            }
        }

        return result;
    }

    // добавление ячеек в таблицу
    renderCells(): void {
        // сортировка массива всех ячеек в двумерный массив, где каждый массив содержит ячейки одной буквы
        const sortedCellsByLetter: TAccumulatorCells = this.cells.reduce<TAccumulatorCells>((acc, cell) => {
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
        const cellHTML = (cell: ICell): string => 
            (`<li class="wrapper__cells-list-item" style="color: ${cell.color}; background: ${cell.background}" data-pos='${JSON.stringify(cell.position)}' contenteditable></li>`);
        const cellLetterHTML = (letter: string): string => 
            `<div class="wrapper__cells-letter" data-val="${letter}">
                <span>${letter}</span>
                <span class="wrapper__cells-letter-thin"></span>
            </div>`;

        // добавление ячеек и букв в формате строки HTML в элемент
        sortedCellsByLetter.forEach((list, idxList) => {
            // HTML строка ячейки
            const cellsHTML: string = list.map(cellHTML).join("\n");
            // HTML строка списка ячеек
            const listHTML: string = 
                `<ul class="wrapper__cells-list">${cellsHTML}</ul>`;

            // HTML строка контента колонки
            const rowContentHTML: string = [cellLetterHTML(this.letters[idxList]), listHTML]
                .join("\n");
            // HTML строка колонки с буквой и списком ячеек
            const rowHTML = `<div class="wrapper__cells-row">${rowContentHTML}</div>`;

            this.elWrapCells.innerHTML += rowHTML;
        });
    }

    // добавление чисел в таблицу
    renderNums(): void {
        const firstRow: HTMLDivElement = document.querySelector(".wrapper__cells-row:first-child") as HTMLDivElement;
        const firstCell: HTMLLIElement = firstRow.querySelector(".wrapper__cells-list-item") as HTMLLIElement;
        const height: number = firstCell.offsetHeight;
        const top: number = firstCell.offsetTop;

        this.elListNums.style.marginTop = `${pxToVw(top)}vw`;

        this.nums.forEach((num) => {
            const numHTML: string = `<li class="wrapper__nums-list-item" style="height: ${pxToVw(height)}vw" data-val="${num}">${num}</li>`;

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
    }

    // фиксирование данных изменяемого ширину ряда
    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void {
        const parentRow: HTMLDivElement = thin.closest(".wrapper__cells-row") as HTMLDivElement;

        this._currentRowWidth = parentRow.offsetWidth;
        this._currentRow = parentRow;
        this._startX = e.pageX;
    }

    // очистка данных изменяемого ширину ряда
    _stopResizeRow(): void {
        this._currentRowWidth = null;
        this._currentRow = null;
        this._startX = null;
    }

    // изменение ширины ряда
    _mouseResizeRow(e: MouseEvent): void {
        if (this._startX === null || this._currentRowWidth === null || this._currentRow === null) {
            return;
        }

        const currentX: number = e.pageX;
        const width: number = currentX - this._startX + this._currentRowWidth;

        if (width >= minRowWidth) {
            this._currentRow.style.width = `${pxToVw(width)}vw`;
        }
    }

    // инициализация событий для изменения ширины ряда ячеек
    _initEventsToResizeRow(): void {
        const thins: NodeListOf<HTMLSpanElement> = document.querySelectorAll(".wrapper__cells-letter-thin") as NodeListOf<HTMLSpanElement>;

        thins.forEach((thin) => {
           thin.addEventListener("mousedown", (e) => this._startResizeRow(e, thin)); 
        });

        window.addEventListener("mousemove", this._mouseResizeRow.bind(this));
        window.addEventListener("mouseup", this._stopResizeRow.bind(this));
    }

    // отображение данных таблицы на странице
    render(): void {
        this.letters = this._fillLetters();
        this.nums = this._fillNums();
        this.cells = this._fillCells();

        this.renderCells();
        this.renderNums();

        window.removeEventListener("resize", this._resizeHandler.bind(this));
        window.addEventListener("resize", this._resizeHandler.bind(this));

        // добавление событий для изменения ширины ряда ячеек
        this._initEventsToResizeRow();
    }
}