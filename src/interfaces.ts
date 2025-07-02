import { TCellPos } from "@/types";

export interface ITableClass {
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    data: ITableData;
    cellsLinkedToFormulas: Map<string, Set<string>>;
    _countNums: number;
    _startX: number|null;
    _currentRowWidth: number|null;
    _currentRow: HTMLDivElement|null;
    _currentRowElCells: NodeListOf<HTMLLIElement>|null;
    _startY: number|null;
    _currentColHeight: number|null;
    _currentCol: HTMLSpanElement|null;
    _currentColElCells: NodeListOf<HTMLLIElement>|null;

    _fillNums(): Array<number>;
    _fillCells(): Array<ICell>;
    _fillLetters(lettersArr?: Array<string>, iteration?: number): Array<string>;
    _getLengthEnglishAlphabet(): number;
    _getLetters(): Array<string>;
    _getNums(): Array<number>;
    _getCells(): Array<ICell>;
    _resizeHandler(): void;
    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void;
    _startResizeCol(e: MouseEvent, thin: HTMLSpanElement): void;
    _stopResizeCells(): void;
    _mouseResizeRow(e: MouseEvent): void;
    _mouseResizeColumn(e: MouseEvent): void;
    _initEventsToResizeRow(): void;
    _initEventsToResizeColumn(): void;
    _initEventsToResizeCells(): void;
    addCellToFormulasList(posLinkedCell: string, posFormulaCell: string, formula: string): void;
    editCellData(idx: number, key: keyof ICell, value: unknown): void;
    saveLocalData(data?: ITableData): void;
    saveCellsLinkedToFormulas(data?: Map<string, Set<string>>): void;
    renderCells(): void;
    renderNums(): void;
    clearNums(): void;
    render(formulasCells?: Array<[string, string[]]>, data?: ITableData): ITableClass;
}

export interface ICellClass {
    elCells: NodeListOf<HTMLLIElement>;
    elLetters: NodeListOf<HTMLDivElement>;
    activeClassName: string;
    table: ITableClass;

    _getElNums(): NodeListOf<HTMLLIElement>;
    _clearActive(): void;
    _setActive(cell: HTMLLIElement): void;
    _setContent(cell: HTMLLIElement): void;
    updateFormulaCells(cell: Set<string>): void;
    init(): void;
}

export interface ICellStyles<T> {
    color: string;
    background: string;
    width: T;
    height: T;
}

export interface ICell extends ICellStyles<number> {
    position: TCellPos;
    content: string;
    index: number;
}

export interface ITableData {
    letters: Array<string>;
    nums: Array<number>;
    cells: Array<ICell>;
}

export interface IFunctionName {
    idx: number;
    endIdx: number;
    fullName: string;
    name: string;
}