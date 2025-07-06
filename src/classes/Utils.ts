import { ITableClass, IUtilsClass } from "@/interfaces";

export default class Utils implements IUtilsClass {
    pxToVw(px: number, base?: number): string {
        const windowWidth: number = typeof base === "number" ? base : window.innerWidth;

        return ((px / windowWidth) * 100).toFixed(2);
    }

    // получение формулы ячейки по ее позиции
    getFormulaCellByPos(pos: string, table: ITableClass): string|undefined {
        const cellsArr: Array<[string, Set<string>]> = Array.from(table.cellsLinkedToFormulas);

        let findActiveCell: string|null = null;

        for (let i = 0; i < cellsArr.length; i++) {
            const [_, setArr] = cellsArr[i];
            const cellsFormulasPos: Array<string> = Array.from(setArr);
            const findIdxActiveCell: number = cellsFormulasPos.findIndex((str) => str.split("|")[0] === pos);

            if (findIdxActiveCell !== -1) {
                findActiveCell = cellsFormulasPos[findIdxActiveCell];

                break;
            }
        }

        return findActiveCell?.split("|")[1];
    }
}