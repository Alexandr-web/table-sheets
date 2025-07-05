import { expect, describe, it, } from "@jest/globals";
import Formula from "../src/classes/Formula";
import Table from "../src/classes/Table";
import { ITableClass, ICell, IFormulaClass } from "../src/interfaces";
import { LogErrors, Formulas, } from "../src/enums";

const formula: IFormulaClass = new Formula();

// Mock данных для таблицы и ячеек
const mockTable: ITableClass = new Table();

mockTable.data.nums = mockTable._fillNums();
mockTable.data.letters = mockTable._fillLetters();
mockTable.data.cells = mockTable._fillCells();

mockTable.data.cells[0].content = "10";
mockTable.data.cells[26].content = "20";
mockTable.data.cells[52].content = `=${Formulas.INCREASE}(A1;B1)`;

const mockCurrentCell: ICell = mockTable.data.cells[52];

describe("Тест utils функции formula.getValueFromFormula", () => {
    it(`следует правильно рассчитать простую формулу с ${Formulas.INCREASE}`, () => {
        const result = formula.getValueFromFormula(`=${Formulas.INCREASE}(10;20)`, mockTable, mockCurrentCell);
        expect(result).toBe("30");
    });

    it("следует правильно рассчитать формулу со ссылками на другие ячейки", () => {
        const result = formula.getValueFromFormula(`=${Formulas.INCREASE}(A1;B1)`, mockTable, mockCurrentCell);
        expect(result).toBe("30");
    });

    it("должен возвращать сообщение об ошибке для недопустимых формул", () => {
        const result = formula.getValueFromFormula("=INVALID_FUNCTION(10;20)", mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать отсутствующие аргументы в формулах", () => {
        const result = formula.getValueFromFormula(`=${Formulas.INCREASE}(10;)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать неформулируемый контент", () => {
        const result = formula.getValueFromFormula("Plain text", mockTable, mockCurrentCell);
        expect(result).toBe("Plain text");
    });

    it("должен обрабатывать вложенные формулы", () => {
        const result = formula.getValueFromFormula(`=${Formulas.INCREASE}(${Formulas.MULTIPLY}(2;3);10)`, mockTable, mockCurrentCell);
        expect(result).toBe("16");
    });

    it("должен обрабатывать деление на ноль", () => {
        const result = formula.getValueFromFormula(`=${Formulas.DIVIDE}(10;0)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать отсутствующие ячейки ссылок", () => {
        const result = formula.getValueFromFormula(`=${Formulas.INCREASE}(A1;AD1)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });

    it("следует обрабатывать ссылающиеся сами на себя ячейки", () => {
        const result = formula.getValueFromFormula(`=${Formulas.INCREASE}(A1;C1)`, mockTable, mockCurrentCell);
        expect(result).toBe(LogErrors.ERROR_NAME);
    });
});