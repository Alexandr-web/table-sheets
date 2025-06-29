import { ITable, ICell } from "@/interfaces";
import { EnglishAlphabet, Colors } from "@/enums";
import { TLettersArr, TIterationLetters, TAccumulatorCells } from "@/types";

export default class Table implements ITable {
    nums: Array<number>;
    letters: Array<string>;
    cells: Array<ICell>;
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    _maxCombinations: number;
    _countNums: number;

    constructor(countNums: number = 26) {
        this.nums = [];
        this.letters = [];
        this.cells = [];
        this.elListNums = document.querySelector(".wrapper__nums-list") as HTMLUListElement;
        this.elWrapCells = document.querySelector(".wrapper__cells") as HTMLDivElement;

        // максимально возможное количество комбинаций = 702
        this._maxCombinations = 702;

        if (countNums < 26) {
            this._countNums = 26;
        } else if (countNums > this._maxCombinations) {
            this._countNums = this._maxCombinations;
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
    _fillLetters<T1 extends TLettersArr, T2 extends TIterationLetters>(lettersArr?: T1, iteration?: T2): TLettersArr {
        const result: TLettersArr = lettersArr || [];

        // выход из рекурсии с выводом всех возможных комбинаций букв
        if (result.length >= this._countNums) {
            return result;
        }

        const lengthEnglishAlphabet: number = this._getLengthEnglishAlphabet();

        // заполнение массива буквами/комбинациями букв
        if (typeof iteration === "number" && this._countNums > lengthEnglishAlphabet) {
            // добавляем комбинацию букв, если количество чисел больше, чем длина английского алфавита
            const remainder: number = this._countNums - result.length;

            let count: number = remainder > lengthEnglishAlphabet ? 26 : remainder;

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

        // на каждый вызов функции прибавляем итерацию на 1 для последующей комбинации букв
        return this._fillLetters<TLettersArr, TIterationLetters>(result, (iteration === undefined ? -1 : iteration) + 1);
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

        // функции для получения HTML строк ячейки, числа и буквы
        const cellHTML = (cell: ICell): string => 
            (`<li class="wrapper__cells-list-item" data-pos='${JSON.stringify(cell.position)}' contenteditable></li>`);
        const cellNumHTML = (num: number): string => 
            (`<li class="wrapper__cells-num" data-val="${num}">${num}</li>`);
        const cellLetterHTML = (letter: string): string => 
            (`<div class="wrapper__cells-letter" data-val="${letter}">${letter}</div>`);

        // добавление ячеек, букв и чисел в формате строки HTML в элемент
        sortedCellsByLetter.forEach((list, idxList) => {
            // HTML строка ячейки (может быть вместе с числом, если список первый)
            const cellsHTML: string = list.map((cell, idxCell) => {
                const cellHTMLStr: string = cellHTML(cell);

                // добавляем HTML строку числа, если это первый список
                if (idxList === 0) {
                    return cellNumHTML(this.nums[idxCell]) + cellHTMLStr;
                }

                return cellHTMLStr;
            }).join("\n");
            // HTML строка списка ячеек
            const listHTML: string = 
                `<ul class="wrapper__cells-list ${idxList === 0 ? 'nums-list' : ''}">${cellsHTML}</ul>`;

            // HTML строка контента колонки
            const rowContentHTML: string = [cellLetterHTML(this.letters[idxList]), listHTML]
                .join("\n");
            // HTML строка колонки с буквой и списком ячеек
            const rowHTML = `<div class="wrapper__cells-row">${rowContentHTML}</div>`;

            this.elWrapCells.innerHTML += rowHTML;
        });
    }

    // отображение данных таблицы на странице
    render(): void {
        this.letters = this._fillLetters();
        this.nums = this._fillNums();
        this.cells = this._fillCells();

        this.renderCells();
    }
}