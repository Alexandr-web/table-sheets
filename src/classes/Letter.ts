import { ILetterClass } from "@/interfaces";
import pxToVw from "@/utils/pxToVw";

export default class Letter implements ILetterClass {
    _elLetters: NodeListOf<HTMLDListElement>;
    _elCells: NodeListOf<HTMLLIElement>;
    _elLetterThins: NodeListOf<HTMLSpanElement>;
    _startX: number|null;
    _currentRowWidth: number|null;
    _currentRow: HTMLDivElement|null;

    constructor() {
        this._elLetters = document.querySelectorAll(".wrapper__cells-letter") as NodeListOf<HTMLDListElement>;
        this._elCells = document.querySelectorAll(".wrapper__cells-list-item") as NodeListOf<HTMLLIElement>;
        this._elLetterThins = document.querySelectorAll(".wrapper__cells-letter-thin") as NodeListOf<HTMLSpanElement>;
        this._startX = null;
        this._currentRowWidth = null
        this._currentRow = null;
    }

    _startResizeRow(e: MouseEvent, thin: HTMLSpanElement): void {
        const parentRow: HTMLDivElement = thin.closest(".wrapper__cells-row") as HTMLDivElement;

        this._currentRowWidth = parentRow.offsetWidth;
        this._currentRow = parentRow;
        this._startX = e.pageX;
    }

    _stopResizeRow(): void {
        this._currentRowWidth = null;
        this._startX = null;
    }

    _mouseResizeRow(e: MouseEvent): void {
        if (this._startX === null || this._currentRowWidth === null || this._currentRow === null) {
            return;
        }

        const currentX: number = e.pageX;
        const width: number = currentX - this._startX + this._currentRowWidth;

        if (width >= 40) {
            this._currentRow.style.width = `${pxToVw(width)}vw`;
        }
    }

    init(): void {
        this._elLetterThins.forEach((thin) => {
           thin.addEventListener("mousedown", (e) => this._startResizeRow(e, thin)); 
        });

        window.addEventListener("mousemove", this._mouseResizeRow.bind(this));
        window.addEventListener("mouseup", this._stopResizeRow.bind(this));
    }
}