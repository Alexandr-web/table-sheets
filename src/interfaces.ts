import { TCellPos } from "@/types";

export interface ITableClass {
    nums: Array<number>;
    letters: Array<string>;
    cells: Array<ICell>;
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    _countNums: number;
    _startX: number|null;
    _currentRowWidth: number|null;
    _currentRow: HTMLDivElement|null;
    _startY: number|null;
    _currentColHeight: number|null;
    _currentCol: HTMLSpanElement|null;
    _currentColCells: NodeListOf<HTMLLIElement>|null;

    _fillNums(): Array<number>;
    _fillCells(): Array<ICell>;
    _fillLetters(lettersArr?: Array<string>, iteration?: number): Array<string>;
    _getLengthEnglishAlphabet(): number;
    _resizeHandler(): void;
    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void;
    _startResizeCol(e: MouseEvent, thin: HTMLSpanElement): void;
    _stopResizeCells(): void;
    _mouseResizeRow(e: MouseEvent): void;
    _mouseResizeColumn(e: MouseEvent): void;
    _initEventsToResizeRow(): void;
    _initEventsToResizeColumn(): void;
    _initEventsToResizeCells(): void;
    renderCells(): void;
    renderNums(): void;
    clearNums(): void;
    render(): void;
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