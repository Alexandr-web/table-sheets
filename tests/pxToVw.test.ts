import { expect, test } from "@jest/globals";
import Utils from "../src/classes/Utils";

const utils = new Utils();

describe("Тест utils функции pxToVw", () => {
    test("передано 1920, 1920", () => {
        expect(utils.pxToVw(1920, 1920)).toBe("100.00");
    });

    test("передано 960, 1920", () => {
        expect(utils.pxToVw(960, 1920)).toBe("50.00");
    });

    test("передано 0, 1920", () => {
        expect(utils.pxToVw(0, 1920)).toBe("0.00");
    });

    test("передано 1000, 2000", () => {
        expect(utils.pxToVw(1000, 2000)).toBe("50.00");
    });
});