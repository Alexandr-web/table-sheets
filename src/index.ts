import "@/styles/index.scss";

import Table from "@/classes/Table";
import Cell from "@/classes/Cell";
import Input from "@/classes/Input";
import ContextMenu from "@/classes/ContextMenu";

import { IContextMenuClass, IContextMenuData, IInputClass, ITableClass, ITableData } from "@/interfaces";
import { Colors } from "./enums";

window.addEventListener("DOMContentLoaded", () => {
    const localTableData: ITableData = JSON.parse(localStorage.getItem("table-data") || "{}");
    const localFormulasCells: Array<[string, string[]]> = JSON.parse(localStorage.getItem("formulas-cells") || "[]");
    const table: ITableClass = new Table().render(localFormulasCells, localTableData);
    const input: IInputClass = new Input(table).init();

    const colorsSublist = (id: string): Array<IContextMenuData> => Object
        .entries(Colors)
        .map(([_, val]) => ({
            id: `${id}-${val}`,
            option: true
        }));

    const contextMenuData: Array<IContextMenuData> = [
        { text: "Скопировать", id: "copy" },
        { text: "Вставить", id: "paste" },
        {
            text: "Цвет",
            id: "color",
            sublist: colorsSublist("color")
        },
        {
            text: "Задний фон",
            id: "background",
            sublist: colorsSublist("background")
        }
    ];
    const contextMenu: IContextMenuClass = new ContextMenu(contextMenuData, table).init();

    new Cell(table, input, contextMenu).init();
});