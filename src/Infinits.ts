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
type ForEachFunction<T> = (elem: T, index?: number) => void;
type Predicate<T> = (elem: T) => boolean;
type MapFunction<A, B> = (elem?: A, index?: number) => B;
type GeneratorBuilder<T> = () => IterableIterator<T>;
type ReduceFunction<A, B> = (acc: A, curr: B, index?: number) => A;
type ScanFunction<A, B> = (state: A, curr: B) => A;

type HistoryEntry = {
    functionName: string;
    arguments: any[];
};

// Exposed class for infinite lists
export class Infinits<T> {
    private generator: GeneratorBuilder<T>;
    private history: HistoryEntry[];

    private constructor(gen: GeneratorBuilder<T>, history: HistoryEntry[] = []) {
        this.generator = gen;
        this.history = history;
    }

    /*
     *   GENERATORS
     */
    public static range = (options: rangeOptions = baseOptions): Infinits<number> => {
        // Default values if not available
        const { start = 0, step = 1 }: rangeOptions = options;
        const end = options.end !== undefined ? options.end : step > 0 ? Infinity : -Infinity;

        const newGen = function*(): IterableIterator<number> {
            if (step > 0) {
                for (let value = start; value < end; value += step) {
                    yield value;
                }
            } else {
                for (let value = start; value > end; value += step) {
                    yield value;
                }
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'range',
            arguments: [{ ...options }],
        };
        const newHistory: HistoryEntry[] = [newEntry];

        return new Infinits<number>(newGen, newHistory);
    };

    public static tabulate = <T>(fun: TabulateFun<T>, count: number = Infinity): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public static repeat = <T>(val: T, count: number = Infinity): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public static from = <T>(iterator: Iterable<T>): Infinits<T> => {
        const newGen = function*(): IterableIterator<T> {
            for (const value of iterator) {
                yield value;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'from',
            arguments: [iterator],
        };
        const newHistory: HistoryEntry[] = [newEntry];

        return new Infinits<T>(newGen, newHistory);
    };
    /*
     *   END GENERATORS
     */

    /*
     *   EXECUTIONS
     */
    public exec = (): IterableIterator<T> => {
        return this.generator();
    };

    public forEach = (fun: ForEachFunction<T>): void => {
        let iter: number = 0;
        for (const value of this.exec()) {
            fun(value, iter);
            iter++;
        }
    };

    public toArray = (): Array<T> => {
        return [...this.exec()];
    };

    public reduce = <S>(fun: ReduceFunction<S, T>, init: S) => {
        let reducedValue: S = init;
        let iter = 0;
        for (const value of this.exec()) {
            reducedValue = fun(reducedValue, value, iter);
            iter++;
        }

        return reducedValue;
    };

    public count = (countIf?: Predicate<T>): number => {
        const predicate = countIf || ((_elem: T): boolean => true);

        let count = 0;
        for (const value of this.exec()) {
            if (predicate(value)) {
                count++;
            }
        }

        return count;
    };

    public nth = (n: number): T => {
        let passed = 0;
        for (const value of this.exec()) {
            if (passed === n) {
                return value;
            }

            passed++;
        }

        // If we reach this point the list didn't have n elements, so we just return undefined.
        return undefined;
    };

    public every = (predicate: Predicate<T>): boolean => {
        for (const value of this.exec()) {
            if (!predicate(value)) {
                return false;
            }
        }

        return true;
    };

    public some = (predicate: Predicate<T>): boolean => {
        for (const value of this.exec()) {
            if (predicate(value)) {
                return true;
            }
        }

        return false;
    };

    public find = (predicate: Predicate<T>): T => {
        for (const value of this.exec()) {
            if (predicate(value)) {
                return value;
            }
        }

        // If no matches, return undefined
        return undefined;
    };
    /*
     *   END EXECUTIONS
     */

    /*
     *   MODIFIERS
     */
    public until = (limit: Predicate<T>): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public take = (n: number): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public drop = (n: number): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public map = <S>(fun: MapFunction<T, S>): Infinits<S> => {
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

        return new Infinits<S>(newGen, newHistory);
    };

    public filter = (fun: Predicate<T>): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public zipLong = <S>(list: Infinits<S>): Infinits<[T, S]> => {
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

        return new Infinits<[T, S]>(newGen, newHistory);
    };

    public zipShort = <S>(list: Infinits<S>): Infinits<[T, S]> => {
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

        return new Infinits<[T, S]>(newGen, newHistory);
    };

    public append = (list: Infinits<T>): Infinits<T> => {
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

        return new Infinits<T>(newGen, newHistory);
    };

    public enumerate = (): Infinits<[T, number]> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<[T, number]> {
            let iteration: number = 0;
            for (const value of execute()) {
                yield [value, iteration];
                iteration++;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'enumerate',
            arguments: [],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new Infinits<[T, number]>(newGen, newHistory);
    };

    public scan = <S>(fun: ScanFunction<S, T>, init: S): Infinits<S> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<S> {
            let reducedValue: S = init;

            for (const value of execute()) {
                reducedValue = fun(reducedValue, value);
                yield reducedValue;
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'scan',
            arguments: [fun, init],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new Infinits<S>(newGen, newHistory);
    };

    public inspect = (fun: ForEachFunction<T>): Infinits<T> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<T> {
            for (const value of execute()) {
                fun(value);
                yield value;
            }
        };

        // Don't clone inspections
        const newHistory: HistoryEntry[] = [...this.history];

        return new Infinits<T>(newGen, newHistory);
    };

    public loop = (): Infinits<T> => {
        const loopedList = this;

        const newGen = function*(): IterableIterator<T> {
            for (;;) {
                const currentIterator = loopedList.clone().exec();
                for (const value of currentIterator) {
                    yield value;
                }
            }
        };

        const newEntry: HistoryEntry = {
            functionName: 'loop',
            arguments: [],
        };
        const newHistory: HistoryEntry[] = [...this.history, newEntry];

        return new Infinits<T>(newGen, newHistory);
    };
    /*
     *   END MODIFIERS
     */

    // Clones generation, not actual values.
    public clone = (): Infinits<T> => {
        const history = this.history;

        const cloned = history.reduce((acc: Infinits<any>, entry: HistoryEntry) => {
            return acc[entry.functionName](...entry.arguments);
        }, Infinits) as Infinits<T>;

        return cloned;
    };
}
