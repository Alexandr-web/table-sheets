import { IContextMenuClass, IContextMenuData, IUtilsClass } from "@/interfaces";
import Utils from "@/classes/Utils";

const utils: IUtilsClass = new Utils();

export default class ContextMenu implements IContextMenuClass {
    elMenu: HTMLDivElement;
    data: Array<IContextMenuData>;

    constructor(data: Array<IContextMenuData>) {
        this.elMenu = document.querySelector(".context-menu") as HTMLDivElement;
        this.data = data;
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

    show(x: number, y: number): void {
        this.elMenu.style.display = "block";
        this.elMenu.style.transform = `translate(${utils.pxToVw(x)}vw, ${utils.pxToVw(y)}vw)`;
    }

    hide(): void {
        this.elMenu.style.display = "none";
    }

    // инициализация работы контекстного меню
    init(): IContextMenuClass {
        this.elMenu.innerHTML += this._renderItems();

        window.addEventListener("click", this._hideByScreenClick.bind(this));

        return this;
    }
}