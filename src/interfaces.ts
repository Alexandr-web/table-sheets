import { TCellPos } from "@/types";

export interface ITableClass {
    nums: Array<number>;
    letters: Array<string>;
    cells: Array<ICell>;
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    _countNums: number;

    _fillNums(): Array<number>;
    _fillCells(): Array<ICell>;
    _fillLetters(lettersArr?: Array<string>, iteration?: number): Array<string>;
    _getLengthEnglishAlphabet(): number;
    _resize(): void;
    renderCells(): void;
    renderNums(): void;
    clearNums(): void;
    render(): void;
}

export interface ILetterClass {
    _elLetters: NodeListOf<HTMLDListElement>;
    _elCells: NodeListOf<HTMLLIElement>;
    _elLetterThins: NodeListOf<HTMLSpanElement>;
    _startX: number|null;
    _currentRowWidth: number|null;
    _currentRow: HTMLDivElement|null;

    _stopResizeRow(): void;
    _mouseResizeRow(e: MouseEvent): void;
    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void;
    init(): void;
}

export interface ICellClass {
    elCells: NodeListOf<HTMLLIElement>;
    elLetters: NodeListOf<HTMLDivElement>;
    activeClassName: string;

    _getElNums(): NodeListOf<HTMLLIElement>;
    _clearActive(): void;
    _setActive(cell: HTMLLIElement): void;
    init(): void;
}

export interface ICell {
    position: TCellPos;
    content: string;
    color: string;
    background: string;
}