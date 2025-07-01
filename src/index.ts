import "@/styles/index.scss";

import Table from "@/classes/Table";
import Cell from "@/classes/Cell";

import { ITableClass, ITableData } from "./interfaces";

window.addEventListener("DOMContentLoaded", () => {
    const localTableData: ITableData = JSON.parse(localStorage.getItem("table-data") || "{}");
    const table: ITableClass = new Table().render(localTableData);

    new Cell(table).init();
});