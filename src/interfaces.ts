import { TCellPos } from "@/types";

export interface ITableClass {
    elListNums: HTMLUListElement;
    elWrapCells: HTMLDivElement;
    data: ITableData;
    cellsLinkedToFormulas: Map<string, Set<string>>;
    _countNums: number;
    _startX: number|null;
    _currentColWidth: number|null;
    _currentCol: HTMLDivElement|null;
    _currentColElCells: NodeListOf<HTMLLIElement>|null;
    _startY: number|null;
    _currentRowHeight: number|null;
    _currentRow: HTMLSpanElement|null;
    _currentRowElCells: NodeListOf<HTMLLIElement>|null;

    _fillNums(): Array<number>;
    _fillCells(): Array<ICell>;
    _fillLetters(lettersArr?: Array<string>, iteration?: number): Array<string>;
    _getLengthEnglishAlphabet(): number;
    _getLetters(): Array<string>;
    _getNums(): Array<number>;
    _getCells(getElements?: boolean): Array<ICell>|NodeListOf<HTMLLIElement>
    _resizeHandler(): void;
    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void;
    _startResizeCol(e: MouseEvent, thin: HTMLSpanElement): void;
    _stopResizeCells(): void;
    _mouseResizeRow(e: MouseEvent): void;
    _mouseResizeColumn(e: MouseEvent): void;
    _initEventsToResizeRow(): void;
    _initEventsToResizeColumn(): void;
    _initEventsToResizeCells(): void;
    _getCellStyles(cell: ICell): string;
    editCellContent(cell: HTMLLIElement, val: string, index: number): void;
    checkFormulaCellToLinked(pos: string, currentVal: string, prevVal: string): void;
    updateFormulaCells(cell: Set<string>, updatingClassName: string): void;
    addCellToFormulasList(posLinkedCell: string, posFormulaCell: string, formula: string): void;
    removeCellFromFormulasList(posLinkedCell: string, valFormulaCell: string): void;
    editCellData(idx: number, key: keyof ICell, value: unknown, updateStyles?: boolean): void;
    saveLocalData(data?: ITableData): void;
    saveCellsLinkedToFormulas(data?: Map<string, Set<string>>): void;
    renderCellsAndLetters(): void;
    renderNums(): void;
    clearNums(): void;
    render(formulasCells?: Array<[string, string[]]>, data?: ITableData): ITableClass;
}

export interface ICellClass {
    elCells: NodeListOf<HTMLLIElement>;
    elLetters: NodeListOf<HTMLDivElement>;
    activeClassName: string;
    updatingClassName: string;
    table: ITableClass;
    input: IInputClass;
    contextMenu: IContextMenuClass;

    _getElNums(): NodeListOf<HTMLLIElement>;
    _clearActive(): void;
    _setActive(cell: HTMLLIElement): void;
    _setContent(cell: HTMLLIElement): void;
    _setContextMenu(e: MouseEvent, cell: HTMLLIElement): void;
    init(): void;
}

export interface IInputClass {
    inputEl: HTMLInputElement;
    table: ITableClass;
    activeCell: ICell|null;

    _getValue(): string;
    _blurHandler(): void;
    setValue(cell: ICell): void;
    init(): IInputClass;
}

export interface IFormulaClass {
    possibleFunctions: Array<string>;
    formulasWithOneArg: Array<string>;
    formulasWithRangeArg: Array<string>;

    _getFunctionsNames(str: string): Array<IFunctionName>;
    _getValCellByPos(pos: string, table: ITableClass, currentCell: ICell, formula: string): ICell|never;
    _getRangeValCells(range: string, table: ITableClass, currentCell: ICell, formula: string): Array<string>|never;
    _getFunctionArgs(functionName: IFunctionName, table: ITableClass, currentCell: ICell, formula: string): Array<string|string[]>|never;
    _getFunctionVal(name: string, argsFunc: Array<string|string[]>): string;
    decrease(args: Array<string|string[]>): string;
    divide(args: Array<string|string[]>): string|never;
    increase(args: Array<string|string[]>): string;
    multiply(args: Array<string|string[]>): string;
    sum(args: Array<string|string[]>): string;
    abs(args: Array<string|string[]>): string;
    acos(args: Array<string|string[]>): string;
    acosh(args: Array<string|string[]>): string;
    asin(args: Array<string|string[]>): string;
    asinh(args: Array<string|string[]>): string;
    atan(args: Array<string|string[]>): string;
    atan2(args: Array<string|string[]>): string;
    atanh(args: Array<string|string[]>): string;
    averageVal(args: Array<string|string[]>): string;
    ceiling(args: Array<string|string[]>): string;
    getValueFromFormula(content: string, table: ITableClass, currentCell: ICell, currentStr?: string): string;
}

export interface IContextMenuClass {
    elMenu: HTMLDivElement;
    data: Array<IContextMenuData>;
    activeCell: ICell|null;
    copyContent: string|null;
    table: ITableClass;
    checkedOptionClassName: string;

    _renderItems(list?: Array<IContextMenuData>): string;
    _hideByScreenClick(e: MouseEvent): void;
    _setCheckedOptions(): void;
    copyCellContent(): void;
    pasteCellContent(): void;
    setCellColor(color: string): void;
    setCellBackground(color: string): void;
    show(x: number, y: number, cell: ICell): void;
    hide(): void;
    init(): IContextMenuClass;
}

export interface IUtilsClass {
    pxToVw(px: number, base?: number): string;
    getFormulaCellByPos(pos: string, table: ITableClass): string|undefined;
}

export interface ICellStyles<T> {
    color: string;
    background: string;
    width: T;
    height: T;
}

export interface IContextMenuData {
    text: string;
    id: string;
    option?: boolean;
    sublist?: Array<IContextMenuData>;
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