import { Formulas, LogErrors } from "@/enums";
import { ICell, IFormulaClass, IFunctionName, ITableClass } from "@/interfaces";
import { TCellPos } from "@/types";

export default class Formula implements IFormulaClass {
    possibleFunctions: Array<string>;
    formulasWithOneArg: Array<string>;
    formulasWithRangeArg: Array<string>;

    constructor() {
        // список всех возможных функций
        this.possibleFunctions = Object.values(Formulas).filter((key) => isNaN(Number(key)));
        // список названий функций, которые могут иметь 1 аргумент
        this.formulasWithOneArg = [Formulas.SUM, Formulas.ABS, Formulas.ACOS, Formulas.ACOSH, Formulas.ASIN, Formulas.ASINH, Formulas.ATAN, Formulas.ATANH, Formulas.AVERAGE_VALUE, Formulas.CEILING];
        // список названий функций, которые могут содержать диапазон ячеек
        this.formulasWithRangeArg = [Formulas.SUM, Formulas.AVERAGE_VALUE];
    }

    // минус
    decrease(args: Array<string|string[]>): string {
        const [arg1, arg2] = args as Array<string>;
        const res = (parseFloat(arg1) - parseFloat(arg2)).toString();

        return res;
    }

    // разделить
    divide(args: Array<string|string[]>): string|never {
        const [arg1, arg2] = args as Array<string>;
    
        // деление на 0
        if (arg2 === "0") {
            throw new Error(LogErrors.IMPOSSIBLE_MATHEMATICAL_OPERATION);
        }
    
        const res: number = parseFloat(arg1) / parseFloat(arg2);
    
        return res.toString();
    }

    // плюс
    increase(args: Array<string|string[]>): string {
        const [arg1, arg2] = args as Array<string>;
        const res = (parseFloat(arg1) + parseFloat(arg2)).toString();

        return res;
    }

    // умножить
    multiply(args: Array<string|string[]>): string {
        const [arg1, arg2] = args as Array<string>
        const res = (parseFloat(arg1) * parseFloat(arg2)).toString();

        return res;
    }

    // сумма значений ячеек в заданном диапазоне
    sum(args: Array<string|string[]>): string {
        const [nums] = args as Array<string[]>;
        
        return nums.reduce<number>((total, num) => total += parseInt(num), 0).toString();
    }

    // абсолютное значение
    abs(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;
        
        return Math.abs(parseInt(num)).toString();
    }
 
    // возвращает арккосинус числа
    acos(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;
        
        return Math.acos(parseInt(num)).toString();
    }

    // возвращает гиперболический арккосинус числа
    acosh(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;
        
        return Math.acosh(parseInt(num)).toString();
    }

    // возвращает арксинус числа
    asin(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;
        
        return Math.asin(parseInt(num)).toString();
    }

    // возвращает гиперболический арксинус числа
    asinh(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;
        
        return Math.asinh(parseInt(num)).toString();
    }

    // возвращает арктангенс числа
    atan(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;
        
        return Math.atan(parseInt(num)).toString();
    }

    // возвращает арктангенс для заданных координат x и y
    atan2(args: Array<string|string[]>): string {
        const [arg1, arg2] = args as Array<string>;

        return Math.atan2(parseInt(arg1), parseInt(arg2)).toString();
    }

    // возвращает гиперболический арктангенс числа
    atanh(args: Array<string|string[]>): string {
        const [arg] = args as Array<string>;

        return Math.atanh(parseInt(arg)).toString();
    }

    // возвращает среднее значение из заданного диапазона
    averageVal(args: Array<string|string[]>): string {
        const [nums] = args as Array<string[]>;
        const sumNums: number = parseInt(this.sum(args));

        return (sumNums / nums.length).toString();
    }

    // округляет число до ближайшего целого или кратного
    ceiling(args: Array<string|string[]>): string {
        const [num] = args as Array<string>;

        return Math.ceil(parseInt(num)).toString();
    }

    // получение названий функций, участвующих в ячейке
    _getFunctionsNames(str: string): Array<IFunctionName> {
        const functions: Array<IFunctionName> = [];
    
        this.possibleFunctions.forEach((funcName) => {
            const findMatch: RegExpMatchArray|null = str.match(funcName);
    
            if (findMatch !== null) {
                const name: string = findMatch[0];
                const startIdx: number = findMatch.index as number;
    
                // проверка на случай совпадающих названий, например, ATAN и ATAN2
                if (functions.some(({ idx }) => idx === startIdx)) {
                    return;
                }
    
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
    _getValCellByPos(pos: string, table: ITableClass, currentCell: ICell, formula: string): ICell|never {
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
    _getRangeValCells(range: string, table: ITableClass, currentCell: ICell, formula: string): Array<string>|never {
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
            return this._getValCellByPos(pos, table, currentCell, formula).content;
        });
    }

    // определение аргументов функции ячейки
    _getFunctionArgs(functionName: IFunctionName, table: ITableClass, currentCell: ICell, formula: string): Array<string|string[]>|never {
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
        if (args.some((arg) => arg.includes(":")) && !this.formulasWithRangeArg.includes(functionName.name)) {
            throw new Error(LogErrors.INVALID_FORMULA_ARGUMENT);
        }
    
        return args.map((arg) => {
            if (!/[A-Z]+\d+/.test(arg)) {
                return arg;
            }
    
            // обработка диапазона ячеек
            if (arg.includes(":")) {
                return this._getRangeValCells(arg, table, currentCell, formula);
            }
    
            return this._getValCellByPos(arg, table, currentCell, formula).content;
        });
    }

    // получение значения функции
    _getFunctionVal(name: string, argsFunc: Array<string|string[]>): string {
        if (this.possibleFunctions.includes(name)) {
            switch (name) {
                case Formulas.MULTIPLY:
                    return this.multiply(argsFunc);
                case Formulas.INCREASE:
                    return this.increase(argsFunc);
                case Formulas.DIVIDE:
                    return this.divide(argsFunc);
                case Formulas.DECREASE:
                    return this.decrease(argsFunc);
                case Formulas.SUM:
                    return this.sum(argsFunc);
                case Formulas.ABS:
                    return this.abs(argsFunc);
                case Formulas.ACOS:
                    return this.acos(argsFunc);
                case Formulas.ACOSH:
                    return this.acosh(argsFunc);
                case Formulas.ASIN:
                    return this.asin(argsFunc);
                case Formulas.ASINH:
                    return this.asinh(argsFunc);
                case Formulas.ATAN:
                    return this.atan(argsFunc);
                case Formulas.ATAN2:
                    return this.atan2(argsFunc);
                case Formulas.ATANH:
                    return this.atanh(argsFunc);
                case Formulas.AVERAGE_VALUE:
                    return this.averageVal(argsFunc);
                case Formulas.CEILING:
                    return this.ceiling(argsFunc);
            }
        }
    
        return "";
    }

    getValueFromFormula(content: string, table: ITableClass, currentCell: ICell, currentStr?: string): string {
        if (content[0] !== "=") {
            return content;
        }

        const str: string = currentStr || content;

        try {
            const functions: Array<IFunctionName> = this._getFunctionsNames(str);

            if (!functions.length) {
                throw new Error(LogErrors.NOT_FOUND_FORMULA);
            }
            
            const maxIdx: number = Math.max(...functions.map(({ idx }) => idx));
            const findLastFunc: IFunctionName = functions.find(({ idx }) => idx === maxIdx) as IFunctionName;
            const argsFunc: Array<string|string[]> = this._getFunctionArgs(findLastFunc, table, currentCell, content);

            if (argsFunc.length < 2 && !this.formulasWithOneArg.includes(findLastFunc.name)) {
                throw new Error(LogErrors.NOT_FOUND_FORMULA_ARGUMENTS);
            }

            const valFunc: string = this._getFunctionVal(findLastFunc.name, argsFunc);

            if (functions.length === 1) {
                return valFunc;
            }

            // замена функции на ее значение
            const newStr: string = str.replace(findLastFunc.fullName, valFunc);

            return this.getValueFromFormula(content, table, currentCell, newStr);
        } catch (err) {
            console.error(err);
            console.error(LogErrors.INVALID_FORMULA, content);

            return LogErrors.ERROR_NAME;
        }
    }
}