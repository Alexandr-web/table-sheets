import { expect, test } from "@jest/globals";
import pxToVw from "../src/utils/pxToVw";

describe("Тест раздела Utils", () => {
    test("pxToVw (передано 1920, 1920)", () => {
        expect(pxToVw(1920, 1920)).toBe("100.00");
    });

    test("pxToVw (передано 960, 1920)", () => {
        expect(pxToVw(960, 1920)).toBe("50.00");
    });

    test("pxToVw (передано 0, 0)", () => {
        expect(pxToVw(0, 1920)).toBe("0.00");
    });

    test("pxToVw (передано 1000, 2000)", () => {
        expect(pxToVw(1000, 2000)).toBe("50.00");
    });
});