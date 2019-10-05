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
type ForEachFunction<T> = (elem: T) => void;
type LimitFunction<T> = (elem: T) => boolean;
type MapFunction<A, B> = (elem?: A, index?: number) => B;
type GeneratorBuilder<T> = () => IterableIterator<T>;
type FilterFunction<T> = (elem: T) => boolean;
type ReduceFunction<A, B> = (acc: A, curr: B) => A;

type HistoryEntry = {
    functionName: string,
    arguments: any[],
}

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

        return new InfiniTs<number>(newGen);
    };

    // EXECUTIONS
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

    // MODIFIERS
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

        return new InfiniTs<T>(newGen);
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

        return new InfiniTs<S>(newGen);
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

        return new InfiniTs<T>(newGen);
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

        return new InfiniTs<T>(newGen);
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

        return new InfiniTs<T>(newGen);
    };

    public zipLong = <S>(list: InfiniTs<S>): InfiniTs<[T, S]> => {
        const iterT: IterableIterator<T> = this.generator();
        const iterS: IterableIterator<S> = list.exec();

        const newGen = function*(): IterableIterator<[T, S]> {
            for (let iT = iterT.next(), iS = iterS.next(); !iT.done || !iS.done; iT = iterT.next(), iS = iterS.next()) {
                yield [iT.value, iS.value];
            }
        };

        return new InfiniTs<[T, S]>(newGen);
    };

    public zipShort = <S>(list: InfiniTs<S>): InfiniTs<[T, S]> => {
        const iterT: IterableIterator<T> = this.generator();
        const iterS: IterableIterator<S> = list.exec();

        const newGen = function*(): IterableIterator<[T, S]> {
            for (let iT = iterT.next(), iS = iterS.next(); !iT.done && !iS.done; iT = iterT.next(), iS = iterS.next()) {
                yield [iT.value, iS.value];
            }
        };

        return new InfiniTs<[T, S]>(newGen);
    };
}
