export type rangeOptions = {
    start?: number;
    end?: number;
    step?: number;
};

const baseOptions = {
    start: 0,
    end: Infinity,
    step: 1,
};

// Callbacks type definitions
type TabulateFun<T> = (idx: number) => T;
type ForEachFunction<T> = (elem: T) => void;
type LimitFunction<T> = (elem: T) => boolean;
type MapFunction<A, B> = (elem?: A, index?: number) => B;
type GeneratorBuilder<T> = () => IterableIterator<T>;
type FilterFunction<T> = (elem: T) => boolean;
type ReduceFunction<A, B> = (acc: A, curr: B) => A;

type HistoryEntry = {
    functionName: string;
    arguments: any[];
};

// Exposed class for infinite lists
export class InfiniTs<T> {
    private generator: GeneratorBuilder<T>;
    private history: HistoryEntry[];

    private constructor(gen: GeneratorBuilder<T>, history: HistoryEntry[] = []) {
        this.generator = gen;
        this.history = history;
    }

    public static range = (options: rangeOptions = baseOptions): InfiniTs<number> => {
        // Default values if not available
        const { start = 0, end = Infinity, step = 1 }: rangeOptions = options;

        const newGen = function*(): IterableIterator<number> {
            for (let value = start; value < end; value += step) {
                yield value;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'range',
            arguments: [{ ...options }],
        };
        const newHistory: HistoryEntry[] = [newEntry];

        return new InfiniTs<number>(newGen, newHistory);
    };

    public static tabulate = <T>(fun: TabulateFun<T>, count: number = Infinity): InfiniTs<T> => {
        const newGen = function*(): IterableIterator<T> {
            for (let idx = 0; idx < count; idx++) {
                yield fun(idx);
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'tabulate',
            arguments: [fun, count],
        };
        const newHistory: HistoryEntry[] = [newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    };

    public static repeat = <T>(val: T, count: number = Infinity): InfiniTs<T> => {
        const newGen = function*(): IterableIterator<T> {
            for (let idx = 0; idx < count; idx++) {
                yield val;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'repeat',
            arguments: [val, count],
        };
        const newHistory: HistoryEntry[] = [newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    }

    /*
    *   EXECUTIONS
    */
    public exec = (): IterableIterator<T> => {
        return this.generator();
    };

    public forEach = (fun: ForEachFunction<T>): void => {
        for (const value of this.exec()) {
            fun(value);
        }
    };

    public toArray = (): Array<T> => {
        return [...this.exec()];
    };

    public reduce = <S>(fun: ReduceFunction<S, T>, init: S) => {
        let reducedValue: S = init;
        for (const value of this.exec()) {
            reducedValue = fun(reducedValue, value);
        }

        return reducedValue;
    };

    public count = (): number => {
        let count = 0;
        for (const _value of this.exec()) {
            count++;
        }

        return count;
    }

    public nth = (n: number): T => {
        let passed = 0;
        for (const value of this.exec()) {
            if(passed === n) {
                return value;
            }

            passed++;
        }

        // If we reach this point the list didn't have n elements, so we just return undefined.
        return undefined;
    }
    /*
    *   END EXECUTIONS
    */

    /*
    *   MODIFIERS
    */
    public until = (limit: LimitFunction<T>): InfiniTs<T> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<T> {
            for (const value of execute()) {
                if (limit(value)) {
                    break;
                }

                yield value;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'until',
            arguments: [limit],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    };

    public map = <S>(fun: MapFunction<T, S>): InfiniTs<S> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<S> {
            let iteration: number = 0;
            for (const value of execute()) {
                yield fun(value, iteration);
                iteration++;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'map',
            arguments: [fun],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<S>(newGen, newHistory);
    };

    public take = (n: number): InfiniTs<T> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<T> {
            let iteration: number = 0;
            for (const value of execute()) {
                if (iteration >= n) {
                    break;
                }

                yield value;
                iteration++;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'take',
            arguments: [n],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    };

    public drop = (n: number): InfiniTs<T> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<T> {
            let iteration: number = 0;
            for (const value of execute()) {
                iteration++;
                if (iteration <= n) {
                    continue;
                }

                yield value;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'drop',
            arguments: [n],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    };

    public filter = (fun: FilterFunction<T>): InfiniTs<T> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<T> {
            for (const value of execute()) {
                if (fun(value)) {
                    yield value;
                }
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'filter',
            arguments: [fun],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    };

    public zipLong = <S>(list: InfiniTs<S>): InfiniTs<[T, S]> => {
        const iterT: IterableIterator<T> = this.generator();
        const iterS: IterableIterator<S> = list.exec();

        const newGen = function*(): IterableIterator<[T, S]> {
            for (let iT = iterT.next(), iS = iterS.next(); !iT.done || !iS.done; iT = iterT.next(), iS = iterS.next()) {
                yield [iT.value, iS.value];
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'zipLong',
            arguments: [list.clone()],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<[T, S]>(newGen, newHistory);
    };

    public zipShort = <S>(list: InfiniTs<S>): InfiniTs<[T, S]> => {
        const iterT: IterableIterator<T> = this.generator();
        const iterS: IterableIterator<S> = list.exec();

        const newGen = function*(): IterableIterator<[T, S]> {
            for (let iT = iterT.next(), iS = iterS.next(); !iT.done && !iS.done; iT = iterT.next(), iS = iterS.next()) {
                yield [iT.value, iS.value];
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'zipShort',
            arguments: [list.clone()],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<[T, S]>(newGen, newHistory);
    };

    public append = (list: InfiniTs<T>): InfiniTs<T> => {
        const firstPart: IterableIterator<T> = this.generator();
        const secondPart: IterableIterator<T> = list.exec();

        const newGen = function*(): IterableIterator<T> {
            for (const valueFst of firstPart) {
                yield valueFst;
            }
            for (const valueSnd of secondPart) {
                yield valueSnd;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'append',
            arguments: [list.clone()],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new InfiniTs<T>(newGen, newHistory);
    }
    /*
    *   END MODIFIERS
    */

    // Clones generation, not actual values.
    public clone = (): InfiniTs<T> => {
        const history = this.history;

        const cloned = history.reduce((acc: InfiniTs<any>, entry: HistoryEntry) => {
            return acc[entry.functionName](...entry.arguments);
        }, InfiniTs) as InfiniTs<T>;

        return cloned;
    };
}
