import { ICell, IContextMenuClass, IContextMenuData, IFormulaClass, ITableClass, IUtilsClass } from "@/interfaces";
import Utils from "@/classes/Utils";
import Formula from "@/classes/Formula";

const formula: IFormulaClass = new Formula();
const utils: IUtilsClass = new Utils();

export default class ContextMenu implements IContextMenuClass {
    elMenu: HTMLDivElement;
    data: Array<IContextMenuData>;
    activeCell: ICell|null;
    copyContent: string|null;
    table: ITableClass;

    constructor(data: Array<IContextMenuData>, table: ITableClass) {
        this.elMenu = document.querySelector(".context-menu") as HTMLDivElement;
        this.data = data;
        this.activeCell = null;
        this.copyContent = null;
        this.table = table;
    }

    _renderItems(list?: Array<IContextMenuData>): string {
        const items: Array<string> = [];
        const data: Array<IContextMenuData> = list ? list : this.data;

        data.forEach(({ text, id, sublist, }) => {
            const sublistStr: string = sublist ? this._renderItems(sublist) : "";
            const item: string = 
                `<li class="context-menu__item ${sublistStr ? "sublist-parent" : ""}" data-id="${id}"><span>${text}</span>${sublistStr}</li>`;

            items.push(item);
        });

        return `<ul class="context-menu__list ${list ? "sublist" : ""}">${items.join("\n")}</ul>`;
    }

    _hideByScreenClick(e: MouseEvent): void {
        const target: EventTarget|null = e.target;

        if (target instanceof Element && target.closest(".context-menu")) {
            return;
        }

        this.hide();
    }

    _clickByItem(e: MouseEvent): void {
        const item: EventTarget|null = e.currentTarget;

        // для обработки вложенных списков
        e.stopPropagation();

        if (!(item instanceof Element)) {
            return;
        }

        const id: string = ((item as HTMLLIElement).dataset.id as string);

        switch (id) {
            case "copy":
                return this.copyCellContent();
            case "paste":
                return this.pasteCellContent();
        }

        const idArr: Array<string> = id.split("-");

        switch (idArr[0]) {
            case "color":
                return this.setCellColor(idArr[1]);
            case "background":
                return this.setCellBackground(idArr[1]);
        }
    }

    copyCellContent(): void {
        if (!this.activeCell) {
            return;
        }

        const { position, content } = this.activeCell;
        const findFormula: string|undefined = utils.getFormulaCellByPos(JSON.stringify(position), this.table);

        this.copyContent = findFormula ? findFormula : content;

        this.hide();
    }

    pasteCellContent(): void {
        if (!this.activeCell || !this.copyContent) {
            return;
        }

        const index: number = this.activeCell.index;
        const elCell: HTMLLIElement = document.querySelector(`.wrapper__cells-list-item[data-index="${index}"]`) as HTMLLIElement;
        const newVal: string = formula.getValueFromFormula(this.copyContent, this.table, this.activeCell);
        
        this.table.editCellContent(elCell, newVal, index);

        this.hide();
    }

    setCellColor(color: string): void {
        if (!this.activeCell) {
            return;
        }

        this.table.editCellData(this.activeCell.index, "color", color, true);
    }

    setCellBackground(color: string): void {
        if (!this.activeCell) {
            return;
        }

        this.table.editCellData(this.activeCell.index, "background", color, true);
    }

    show(x: number, y: number, cell: ICell): void {
        this.elMenu.style.display = "block";
        this.elMenu.style.transform = `translate(${utils.pxToVw(x)}vw, ${utils.pxToVw(y)}vw)`;

        this.activeCell = cell;
    }

    hide(): void {
        this.elMenu.style.display = "none";
    }

    // инициализация работы контекстного меню
    init(): IContextMenuClass {
        this.elMenu.innerHTML += this._renderItems();

        const items: NodeListOf<HTMLLIElement> = document.querySelectorAll(".context-menu__item");

        items.forEach((item) => item.addEventListener("click", this._clickByItem.bind(this)));

        window.addEventListener("click", this._hideByScreenClick.bind(this));

        return this;
    }
}