import { expect, test } from "@jest/globals";

import Table from "../src/classes/Table";
import { ICell, ITableClass } from "../src/interfaces";
import { EnglishAlphabet, Colors } from "../src/enums";

describe("Тест класса Table", () => {
    test("создание экземпляра класса", () => {
        const table: ITableClass = new Table();

        expect(table).toBeTruthy();
    });

    test("проверка количества чисел (передано 123)", () => {
        const table: ITableClass = new Table(123);

        expect(table._countNums).toBe(123);
    });

    test("проверка количества чисел (передано 0)", () => {
        const table: ITableClass = new Table(26);

        expect(table._countNums).toBe(26);
    });

    test("проверка количества чисел (передано 1000)", () => {
        const table: ITableClass = new Table(1000);

        expect(table._countNums).toBe(702);
    });

    test("проверка длины английского алфавита", () => {
        const table: ITableClass = new Table();

        expect(table._getLengthEnglishAlphabet()).toBe(26);
    });

    test("проверка заполнения чисел таблицы (передано 26 чисел)", () => {
        const table: ITableClass = new Table();

        expect(table._fillNums().length).toBe(26);
    });

    test("проверка заполнения чисел таблицы (передано 45 чисел)", () => {
        const table: ITableClass = new Table(45);

        expect(table._fillNums().length).toBe(45);
    });

    test("проверка заполнения букв таблицы (передано 26 букв)", () => {
        const table: ITableClass = new Table();
        const res: Array<string> = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

        expect(JSON.stringify(table._fillLetters())).toBe(JSON.stringify(res));
    });

    test("проверка заполнения букв таблицы (передано 30 букв)", () => {
        const table: ITableClass = new Table(30);
        const res: Array<string> = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD"];

        expect(JSON.stringify(table._fillLetters())).toBe(JSON.stringify(res));
    });

    test("проверка заполнения ячеек таблицы (передано 26 чисел)", () => {
        const table: ITableClass = new Table();
        const res1: ICell = {
            position: [EnglishAlphabet[0], 1],
            content: "",
            color: Colors.BLACK,
            background: Colors.WHITE,
        };

        const res2: ICell = {
            position: [EnglishAlphabet[0], 26],
            content: "",
            color: Colors.BLACK,
            background: Colors.WHITE,
        };

        table.letters = table._fillLetters();
        table.nums = table._fillNums();

        const cells: Array<ICell> = table._fillCells();

        expect(JSON.stringify(cells[0])).toBe(JSON.stringify(res1));
        expect(JSON.stringify(cells[25])).toBe(JSON.stringify(res2));
    });
});