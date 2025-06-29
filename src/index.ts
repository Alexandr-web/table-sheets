import "@/styles/index.scss";

import Table from "@/classes/Table";
import Cell from "@/classes/Cell";

window.addEventListener("DOMContentLoaded", () => {
    new Table().render();
    new Cell().init();
});