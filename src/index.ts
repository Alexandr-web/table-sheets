import "@/styles/index.scss";

import Table from "@/classes/Table";
import Cell from "@/classes/Cell";
import Input from "@/classes/Input";

import { IInputClass, ITableClass, ITableData } from "@/interfaces";

window.addEventListener("DOMContentLoaded", () => {
    const localTableData: ITableData = JSON.parse(localStorage.getItem("table-data") || "{}");
    const localFormulasCells: Array<[string, string[]]> = JSON.parse(localStorage.getItem("formulas-cells") || "[]");
    const table: ITableClass = new Table().render(localFormulasCells, localTableData);
    const input: IInputClass = new Input(table);

    new Cell(table, input).init();
});