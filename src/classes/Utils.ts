import { IUtilsClass } from "@/interfaces";

export default class Utils implements IUtilsClass {
    pxToVw(px: number, base?: number): string {
        const windowWidth: number = typeof base === "number" ? base : window.innerWidth;

        return ((px / windowWidth) * 100).toFixed(2);
    }
}