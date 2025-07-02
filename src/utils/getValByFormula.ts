import { ICell, IFunctionName } from "@/interfaces";
import { Formulas, LogErrors } from "@/enums";
import { TCellPos } from "@/types";

const decrease = (args: Array<string>): string => (parseFloat(args[0]) - parseFloat(args[1])).toString();
const divide = (args: Array<string>): string => (parseFloat(args[0]) / parseFloat(args[1])).toString();
const increase = (args: Array<string>): string => (parseFloat(args[0]) + parseFloat(args[1])).toString();
const multiply = (args: Array<string>): string => (parseFloat(args[0]) * parseFloat(args[1])).toString();

const possibleFunctions: Array<string> = Object.values(Formulas).filter((key) => isNaN(Number(key)));

const getFunctionsNames = (str: string): Array<IFunctionName> => {
    const functions: Array<IFunctionName> = [];

    possibleFunctions.forEach((funcName) => {
        const findMatch: RegExpMatchArray|null = str.match(funcName);

        if (findMatch !== null) {
            const name: string = findMatch[0];
            const startIdx: number = findMatch.index as number;
            
            let fullName: string = name;
            let endIdx: number = startIdx + name.length - 1;

            while (str[endIdx] !== ")") {
                endIdx++;
                fullName += str[endIdx];
            }

            functions.push({ idx: startIdx, endIdx, name, fullName, });
        }
    });

    return functions;
}

const getFunctionArgs = (functionName: IFunctionName, cells: Array<ICell>): Array<string> => {
    const argsFromBrackets: RegExpMatchArray|null = functionName.fullName.match(/(?<=\().*(?=\))/);

    if (argsFromBrackets === null) {
        return ["", ""];
    }

    const args: Array<string> = argsFromBrackets[0].split(";");

    return args.map((arg) => {
        if (!/[A-Z]+\d+/.test(arg)) {
            return arg;
        }

        const letter: string = (arg.match(/[A-Z]+/) as RegExpMatchArray)[0];
        const num: number = parseInt((arg.match(/\d+/) as RegExpMatchArray)[0]);
        const findPos: TCellPos = [letter, num];
        const findCell: ICell|undefined = cells.find(({ position }) => JSON.stringify(position) === JSON.stringify(findPos));

        if (!findCell) {
            console.error(LogErrors.NOT_FOUND_CELL_BY_POS, findPos);

            return arg;
        }

        return findCell.content;
    });
}

const getFunctionVal = (name: string, argsFunc: Array<string>): string => {
    if (possibleFunctions.includes(name)) {
        switch (name) {
            case Formulas.MULTIPLY:
                return multiply(argsFunc);
            case Formulas.INCREASE:
                return increase(argsFunc);
            case Formulas.DIVIDE:
                return divide(argsFunc);
            case Formulas.DECREASE:
                return decrease(argsFunc);
        }
    }

    return "";
}

const getNewStr = (funcName: IFunctionName, valFunc: string, str: string): string => {
    return str.replace(funcName.fullName, valFunc);
}

const getValByFormula = (content: string, cells: Array<ICell>, currentStr?: string): string => {
    if (content[0] !== "=") {
        return content;
    }

    const str: string = currentStr || content;
    const functions: Array<IFunctionName> = getFunctionsNames(str);
    const maxIdx: number = Math.max(...functions.map(({ idx }) => idx));
    const findLastFunc: IFunctionName = functions.find(({ idx }) => idx === maxIdx) as IFunctionName;
    const argsFunc: Array<string> = getFunctionArgs(findLastFunc, cells);
    const valFunc: string = getFunctionVal(findLastFunc.name, argsFunc);

    if (functions.length === 1) {
        return valFunc;
    }

    const newStr: string = getNewStr(findLastFunc, valFunc, str);

    return getValByFormula(content, cells, newStr);
}

export default getValByFormula;