import { ICell, IFunctionName, ITableClass } from "@/interfaces";
import { Formulas, LogErrors } from "@/enums";
import { TCellPos } from "@/types";

// математические функции
// минус
const decrease = (args: Array<string>): string => (parseFloat(args[0]) - parseFloat(args[1])).toString();
// разделить
const divide = (args: Array<string>): string => (parseFloat(args[0]) / parseFloat(args[1])).toString();
// плюс
const increase = (args: Array<string>): string => (parseFloat(args[0]) + parseFloat(args[1])).toString();
// умножить
const multiply = (args: Array<string>): string => (parseFloat(args[0]) * parseFloat(args[1])).toString();

// список всех возможных функций
const possibleFunctions: Array<string> = Object.values(Formulas).filter((key) => isNaN(Number(key)));

// получение названий функций, участвующих в ячейке
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

// определение аргументов функции ячейки
const getFunctionArgs = (functionName: IFunctionName, table: ITableClass, currentCell: ICell, formula: string): Array<string> => {
    const argsFromBrackets: RegExpMatchArray|null = functionName.fullName.match(/(?<=\().*(?=\))/);

    if (argsFromBrackets === null) {
        return ["", ""];
    }

    const args: Array<string> = argsFromBrackets[0].split(";");

    return args.map((arg) => {
        if (!/[A-Z]+\d+/.test(arg)) {
            return arg;
        }

        // проверка на ссылки на другие ячейки
        const letter: string = (arg.match(/[A-Z]+/) as RegExpMatchArray)[0];
        const num: number = parseInt((arg.match(/\d+/) as RegExpMatchArray)[0]);
        const findPos: TCellPos = [letter, num];
        const findCell: ICell|undefined = table.data.cells.find(({ position }) => JSON.stringify(position) === JSON.stringify(findPos));

        if (!findCell) {
            console.error(LogErrors.NOT_FOUND_CELL_BY_POS, findPos);

            return arg;
        }

        // добавление найденных ячеек в общий список
        table.addCellToFormulasList(JSON.stringify(findPos), JSON.stringify(currentCell.position), formula);

        return findCell.content;
    });
}

// получение значения функции
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

// замена функции на ее значение в общей строке
const getNewStr = (funcName: IFunctionName, valFunc: string, str: string): string => {
    return str.replace(funcName.fullName, valFunc);
}

// получение значения всей формулы/функции, применяемой в ячейке
const getValByFormula = (content: string, table: ITableClass, currentCell: ICell, currentStr?: string): string => {
    try {
        if (content[0] !== "=") {
            return content;
        }

        // 1. находим самую "нижнюю" (последнюю) функцию
        // 2. определяем ее аргументы
        // 3. определяем ее значение
        // 4. меняем, если требуется, ее на ее значение в общей строке

        const str: string = currentStr || content;
        const functions: Array<IFunctionName> = getFunctionsNames(str);
        const maxIdx: number = Math.max(...functions.map(({ idx }) => idx));
        const findLastFunc: IFunctionName = functions.find(({ idx }) => idx === maxIdx) as IFunctionName;
        const argsFunc: Array<string> = getFunctionArgs(findLastFunc, table, currentCell, content);
        const valFunc: string = getFunctionVal(findLastFunc.name, argsFunc);

        if (functions.length === 1) {
            return valFunc;
        }

        const newStr: string = getNewStr(findLastFunc, valFunc, str);

        return getValByFormula(content, table, currentCell, newStr);
    } catch (err) {
        console.error(err);
        console.error(LogErrors.INVALID_FORMULA, content);

        return LogErrors.ERROR_NAME;
    }
}

export default getValByFormula;