import "@/styles/index.scss";

import Table from "@/classes/Table";
import Cell from "@/classes/Cell";
import Letter from "@/classes/Letter";

window.addEventListener("DOMContentLoaded", () => {
    new Table().render();
    
    new Cell().init();
    new Letter().init();
});