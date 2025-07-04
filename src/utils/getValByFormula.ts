import { ICell, IFunctionName, ITableClass } from "@/interfaces";
import { Formulas, LogErrors } from "@/enums";
import { TCellPos } from "@/types";

// список всех возможных функций
const possibleFunctions: Array<string> = Object.values(Formulas).filter((key) => isNaN(Number(key)));
// список названий функций, которые могут иметь 1 аргумент
const formulasWithOneArg: Array<string> = [Formulas.SUM];
// список названий функций, которые могут содержать диапазон ячеек
const formulasWithRangeArg: Array<string> = [Formulas.SUM];

// математические функции
// минус
const decrease = (args: Array<string|string[]>): string => {
    const [arg1, arg2] = args as Array<string>;
    const res = (parseFloat(arg1) - parseFloat(arg2)).toString();

    return res;
}
// разделить
const divide = (args: Array<string|string[]>): string|never => {
    const [arg1, arg2] = args as Array<string>;

    // деление на 0
    if (arg2 === "0") {
        throw new Error(LogErrors.IMPOSSIBLE_MATHEMATICAL_OPERATION);
    }

    const res: number = parseFloat(arg1) / parseFloat(arg2);

    return res.toString();
};
// плюс
const increase = (args: Array<string|string[]>): string => {
    const [arg1, arg2] = args as Array<string>;
    const res = (parseFloat(arg1) + parseFloat(arg2)).toString();

    return res;
}
// умножить
const multiply = (args: Array<string|string[]>): string => {
    const [arg1, arg2] = args as Array<string>
    const res = (parseFloat(arg1) * parseFloat(arg2)).toString();

    return res;
}
// сумма значений ячеек в заданном диапазоне
const sum = (args: Array<string|string[]>): string|never => {
    const [nums] = args as Array<string[]>;

    if (!nums.every((n) => parseInt(n))) {
        throw new Error(LogErrors.ALL_CELLS_IN_THE_RANGE_MUST_HAVE_A_NUMERIC_CONTENT_TYPE);
    }
    
    return nums.reduce<number>((total, num) => total += parseInt(num), 0).toString();
}

// получение названий функций, участвующих в ячейке
const getFunctionsNames = (str: string): Array<IFunctionName> => {
    const functions: Array<IFunctionName> = [];

    possibleFunctions.forEach((funcName) => {
        const findMatch: RegExpMatchArray|null = str.match(funcName);

        if (findMatch !== null) {
            const name: string = findMatch[0];
            const startIdx: number = findMatch.index as number;
            
            let endIdx: number = startIdx + name.length - 1;

            const findEndBracket: RegExpMatchArray|null = str.slice(endIdx).match(/\)/);

            // если функция написана правильно, то добавляем ее в общий список
            if (findEndBracket) {
                endIdx = (findEndBracket.index as number) + endIdx;
                
                const fullName: string = str.slice(startIdx, endIdx + 1);

                functions.push({ idx: startIdx, endIdx, name, fullName, });
            }
        }
    });

    return functions;
}

// получение значения ячейки по ее позиции из аргумента
const getValCellByPos = (pos: string, table: ITableClass, currentCell: ICell, formula: string): ICell|never => {
    const letter: string = (pos.match(/[A-Z]+/) as RegExpMatchArray)[0];
    const num: number = parseInt((pos.match(/\d+/) as RegExpMatchArray)[0]);
    const findPos: TCellPos = [letter, num];
    const findCell: ICell|undefined = table.data.cells.find(({ position }) => JSON.stringify(position) === JSON.stringify(findPos));

    if (!findCell) {
        throw new Error(LogErrors.NOT_FOUND_CELL_BY_POS);
    }

    // добавление найденных ячеек в общий список
    table.addCellToFormulasList(JSON.stringify(findPos), JSON.stringify(currentCell.position), formula);

    return findCell;
}

// получение списка значений из диапазона
const getRangeValCells = (range: string, table: ITableClass, currentCell: ICell, formula: string): Array<string>|never => {
    const rangeArgs: Array<string> = range.split(":");

    // всего можно использовать 2 аргумента для диапазона
    if (rangeArgs.length > 2) {
        throw new Error(LogErrors.INVALID_NUMBER_OF_RANGE_ARGUMENTS);
    }

    const [[firstLetter, firstNum], [secondLetter, secondNum]] = rangeArgs.map((pos) => pos.split(""));

    // буквы ячеек должны совпадать
    if (firstLetter !== secondLetter) {
        throw new Error(LogErrors.THE_RANGE_INCLUDES_VARIOUS_LETTERS);
    }

    const startNum: number = parseInt(firstNum);
    const endNum: number = parseInt(secondNum);

    // начальная ячейка должна наодиться раньше конечной
    if (startNum > endNum) {
        throw new Error(LogErrors.RANGE_ARGUMENTS_ARE_INCORRECTLY_PLACED);
    }

    const positions: Array<string> = [];

    for (let i = startNum; i <= endNum; i++) {
        positions.push(`${firstLetter}${i}`);
    }

    return positions.map((pos) => {
        return getValCellByPos(pos, table, currentCell, formula).content;
    });
}

// определение аргументов функции ячейки
const getFunctionArgs = (functionName: IFunctionName, table: ITableClass, currentCell: ICell, formula: string): Array<string|string[]>|never => {
    const argsFromBrackets: RegExpMatchArray|null = functionName.fullName.match(/(?<=\().*(?=\))/);

    if (argsFromBrackets === null) {
        return [];
    }

    const args: Array<string> = argsFromBrackets[0].split(";");
    const currentPosCell: string = `${currentCell.position[0]}${currentCell.position[1]}`;

    // если в аргументах указана текущая ячейка
    if (args.includes(currentPosCell)) {
        throw new Error(LogErrors.INVALID_FORMULA_ARGUMENT);
    }

    // если в аргументах содержится какое-нибудь пустое значение
    if (args.some((arg) => arg === "")) {
        throw new Error(LogErrors.NOT_FOUND_CELL_BY_POS);
    }

    // проверка на доступ к использованию диапазона значений для текущей функции
    if (args.some((arg) => arg.includes(":")) && !formulasWithRangeArg.includes(functionName.name)) {
        throw new Error(LogErrors.INVALID_FORMULA_ARGUMENT);
    }

    return args.map((arg) => {
        if (!/[A-Z]+\d+/.test(arg)) {
            return arg;
        }

        // обработка диапазона ячеек
        if (arg.includes(":")) {
            return getRangeValCells(arg, table, currentCell, formula);
        }

        return getValCellByPos(arg, table, currentCell, formula).content;
    });
}

// получение значения функции
const getFunctionVal = (name: string, argsFunc: Array<string|string[]>): string => {
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
            case Formulas.SUM:
                return sum(argsFunc);
        }
    }

    return "";
}

/**
 * получение значения всей формулы/функции, применяемой в ячейке
 * алгоритм действий:
 * 1. находим самую "нижнюю" (последнюю) функцию
 * 2. определяем ее аргументы
 * 3. определяем ее значение
 * 4. меняем, если требуется, ее на ее значение в общей строке
 */
const getValByFormula = (content: string, table: ITableClass, currentCell: ICell, currentStr?: string): string => {
    if (content[0] !== "=") {
        return content;
    }

    const str: string = currentStr || content;

    try {
        const functions: Array<IFunctionName> = getFunctionsNames(str);

        if (!functions.length) {
            throw new Error(LogErrors.NOT_FOUND_FORMULA);
        }
        
        const maxIdx: number = Math.max(...functions.map(({ idx }) => idx));
        const findLastFunc: IFunctionName = functions.find(({ idx }) => idx === maxIdx) as IFunctionName;
        const argsFunc: Array<string|string[]> = getFunctionArgs(findLastFunc, table, currentCell, content);

        if (argsFunc.length < 2 && !formulasWithOneArg.includes(findLastFunc.name)) {
            throw new Error(LogErrors.NOT_FOUND_FORMULA_ARGUMENTS);
        }

        const valFunc: string = getFunctionVal(findLastFunc.name, argsFunc);

        if (functions.length === 1) {
            return valFunc;
        }

        // замена функции на ее значение
        const newStr: string = str.replace(findLastFunc.fullName, valFunc);

        return getValByFormula(content, table, currentCell, newStr);
    } catch (err) {
        console.error(err);
        console.error(LogErrors.INVALID_FORMULA, content);

        return LogErrors.ERROR_NAME;
    }
}

export default getValByFormula;