import { TLettersArr, TIterationLetters, TCellPos } from "@/types";

export interface ITableClass {
    nums: Array<number>;
    letters: Array<string>;
    cells: Array<ICell>;
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    _countNums: number;

    _fillNums(): Array<number>;
    _fillCells(): Array<ICell>;
    _fillLetters<T1 extends TLettersArr, T2 extends TIterationLetters>(lettersArr?: T1, iteration?: T2): TLettersArr;
    _getLengthEnglishAlphabet(): number;
    _resize(): void;
    renderCells(): void;
    renderNums(): void;
    clearNums(): void;
    render(): void;
}

export interface ICellClass {
    elCells: NodeListOf<HTMLLIElement>;
    elLetters: NodeListOf<HTMLDivElement>;
    elNums: NodeListOf<HTMLLIElement>;
    activeClassName: string;

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