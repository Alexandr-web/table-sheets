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
    checkedOptionClassName: string;

    constructor(data: Array<IContextMenuData>, table: ITableClass) {
        this.elMenu = document.querySelector(".context-menu") as HTMLDivElement;
        this.data = data;
        this.activeCell = null;
        this.copyContent = null;
        this.table = table;
        this.checkedOptionClassName = "checked";
    }

    // создание HTML строки списков из элементов контекстного меню
    _renderItems(list?: Array<IContextMenuData>): string {
        const items: Array<string> = [];
        const data: Array<IContextMenuData> = list ? list : this.data;
        const isColors: boolean = data.every(({ id }) => id.includes("-") && ["color", "background"].includes(id.split("-")[0]));
        const additionalListClasses: Array<string> = [
            { name: "sublist", condition: Boolean(list), },
            { name: "colors", condition: Boolean(isColors) }
        ].filter(({ condition }) => condition).map(({ name }) => name);

        // добавление элементов (HTML строк) в массив
        data.forEach(({ text = "", id, sublist, option }) => {
            const sublistStr: string = sublist ? this._renderItems(sublist) : "";
            const iconCheck: string = `<img class="context-menu__item-icon" src="${require("../assets/icons/check.svg")}" />`;
            const colorBox: string = 
                isColors ? `<div class="context-menu__item-color" style="background-color: ${id.split("-")[1]}"></div>` : "";

            const textEl: string = `<div class="context-menu__item-text">${text}${colorBox}${option ? iconCheck : ""}</div>`
            const item: string = 
                `<li class="context-menu__item ${sublistStr ? "sublist-parent" : ""}" data-id="${id}">${textEl}${sublistStr}</li>`;

            items.push(item);
        });

        return `<ul class="context-menu__list ${additionalListClasses.join(" ")}">${items.join("\n")}</ul>`;
    }

    // скрытие контекстного меню при клике по экрану
    _hideByScreenClick(e: MouseEvent): void {
        const target: EventTarget|null = e.target;

        if (target instanceof Element && target.closest(".context-menu")) {
            return;
        }

        this.hide();
    }

    // применение работы элементов контекстного меню
    _clickByItem(e: MouseEvent): void {
        const item: EventTarget|null = e.currentTarget;

        // для обработки вложенных списков
        e.stopPropagation();

        if (!(item instanceof Element)) {
            return;
        }

        const id: string = ((item as HTMLLIElement).dataset.id as string);
        const idArr: Array<string> = id.split("-");

        switch (id) {
            case "copy":
                this.copyCellContent();
                break;
            case "paste":
                this.pasteCellContent();
                break;
        }

        switch (idArr[0]) {
            case "color":
                this.setCellColor(idArr[1]);
                break;
            case "background":
                this.setCellBackground(idArr[1]);
                break;
        }

        // устанавливаем на странице активный выбор пользователя
        this._setCheckedOptions(this.table.data.cells[(this.activeCell as ICell).index]);
    }

    // копирование содержимого/формулы ячейки
    copyCellContent(): void {
        if (!this.activeCell) {
            return;
        }

        const { position, content } = this.activeCell;
        const findFormula: string|undefined = utils.getFormulaCellByPos(JSON.stringify(position), this.table);

        this.copyContent = findFormula ? findFormula : content;

        this.hide();
    }

    // вставка скопированного содержимого/формулы
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

    // установка цвета текста ячейки
    setCellColor(color: string): void {
        if (!this.activeCell) {
            return;
        }

        this.table.editCellData(this.activeCell.index, "color", color, true);
    }

    // установка заднего фона ячейки
    setCellBackground(color: string): void {
        if (!this.activeCell) {
            return;
        }

        this.table.editCellData(this.activeCell.index, "background", color, true);
    }

    // отображение на странице активного выбора пользователя
    _setCheckedOptions(cell?: ICell): void {
        const activeCell: ICell = cell ? cell : (this.activeCell as ICell);
        const colorsCell: NodeListOf<HTMLLIElement> = document.querySelectorAll(".context-menu__item[data-id*=\"color-\"]");
        const backgroundsCell: NodeListOf<HTMLLIElement> = document.querySelectorAll(".context-menu__item[data-id*=\"background-\"]");
        const removeCheckedClass = (list: NodeListOf<HTMLLIElement>): void => list.forEach((item) => item.classList.remove(this.checkedOptionClassName));
        const setCheckedClassToChoosedOption = (list: NodeListOf<HTMLLIElement>, cellOption: keyof ICell): void => {
            removeCheckedClass(list);

            for (let i = 0; i < list.length; i++) {
                const el: HTMLLIElement = list[i];
                const val: string = (el.dataset.id as string).split("-")[1];

                if (val === (activeCell as ICell)[cellOption]) {
                    el.classList.add(this.checkedOptionClassName);

                    break;
                }
            }
        };

        setCheckedClassToChoosedOption(colorsCell, "color");
        setCheckedClassToChoosedOption(backgroundsCell, "background");
    }

    // появление контекстного меню
    show(x: number, y: number, cell: ICell): void {
        this.elMenu.style.display = "block";
        this.elMenu.style.transform = `translate(${utils.pxToVw(x)}vw, ${utils.pxToVw(y)}vw)`;

        this.activeCell = cell;

        this._setCheckedOptions();
    }

    // скрытие контекстного меню
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