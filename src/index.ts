import "@/styles/index.scss";

import Table from "@/classes/Table";
import Cell from "@/classes/Cell";

import { ITableData } from "./interfaces";

window.addEventListener("DOMContentLoaded", () => {
    const localTableData: ITableData = JSON.parse(localStorage.getItem("table-data") || "{}");

    new Table().render(localTableData);
    new Cell().init();
});