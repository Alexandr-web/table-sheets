import { expect, describe, it, } from "@jest/globals";
import getValByFormula from "../src/utils/getValByFormula";
import Table from "../src/classes/Table";
import { ITableClass, ICell } from "../src/interfaces";
import { LogErrors, Formulas, } from "../src/enums";

// Mock данных для таблицы и ячеек
const mockTable: ITableClass = new Table();

mockTable.data.nums = mockTable._fillNums();
mockTable.data.letters = mockTable._fillLetters();
mockTable.data.cells = mockTable._fillCells();

mockTable.data.cells[0].content = "10";
mockTable.data.cells[26].content = "20";
mockTable.data.cells[52].content = `=${Formulas.INCREASE}(A1;B1)`;

const mockCurrentCell: ICell = mockTable.data.cells[52];

describe("Тест utils функции getValByFormula", () => {
    it(`следует правильно рассчитать простую формулу с ${Formulas.INCREASE}`, () => {
        const result = getValByFormula(`=${Formulas.INCREASE}(10;20)`, mockTable, mockCurrentCell);
        expect(result).toBe("30");
    });

    it("следует правильно рассчитать формулу со ссылками на другие ячейки", () => {
        const result = getValByFormula(`=${Formulas.INCREASE}(A1;B1)`, mockTable, mockCurrentCell);
        expect(result).toBe("30");
    });

    it("должен возвращать сообщение об ошибке для недопустимых формул", () => {
        const result = getValByFormula("=INVALID_FUNCTION(10;20)", mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать отсутствующие аргументы в формулах", () => {
        const result = getValByFormula(`=${Formulas.INCREASE}(10;)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать неформулируемый контент", () => {
        const result = getValByFormula("Plain text", mockTable, mockCurrentCell);
        expect(result).toBe("Plain text");
    });

    it("должен обрабатывать вложенные формулы", () => {
        const result = getValByFormula(`=${Formulas.INCREASE}(${Formulas.MULTIPLY}(2;3);10)`, mockTable, mockCurrentCell);
        expect(result).toBe("16");
    });

    it("должен обрабатывать деление на ноль", () => {
        const result = getValByFormula(`=${Formulas.DIVIDE}(10;0)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать отсутствующие ячейки ссылок", () => {
        const result = getValByFormula(`=${Formulas.INCREASE}(A1;AD1)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать ссылающиеся сами на себя ячейки", () => {
        const result = getValByFormula(`=${Formulas.INCREASE}(A1;C1)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });
});