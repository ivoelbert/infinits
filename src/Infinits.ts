export type RangeOptions = {
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

/*
*   This makes me puke. Typescript doesn't fully support recursive types,
*   So we can't do something like
*
*   type BaseInfinits<T> = T extends Infinits<infer R> ? BaseInfinits<R> : T;
*
*   We have to settle for this "finite recursion" crap. Depth can't go over 10 :(
*/
type BaseInfinits<T> = T extends Infinits<infer R> ? BI1<R> : T;
type BI1<T> = T extends Infinits<infer R> ? BI2<R> : T;
type BI2<T> = T extends Infinits<infer R> ? BI3<R> : T;
type BI3<T> = T extends Infinits<infer R> ? BI4<R> : T;
type BI4<T> = T extends Infinits<infer R> ? BI5<R> : T;
type BI5<T> = T extends Infinits<infer R> ? BI6<R> : T;
type BI6<T> = T extends Infinits<infer R> ? BI7<R> : T;
type BI7<T> = T extends Infinits<infer R> ? BI8<R> : T;
type BI8<T> = T extends Infinits<infer R> ? BI9<R> : T;
type BI9<T> = T;

// Exposed class for infinite lists
export class Infinits<T> {
    private generator: GeneratorBuilder<T>;

    private constructor(gen: GeneratorBuilder<T>) {
        this.generator = gen;
    }

    /*
     *   GENERATORS
     */
    public static range = (options: RangeOptions = baseOptions): Infinits<number> => {
        // Default values if not available
        const { start = 0, step = 1 }: RangeOptions = options;
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

        return new Infinits<number>(newGen);
    };

    public static tabulate = <T>(fun: TabulateFun<T>, count: number = Infinity): Infinits<T> => {
        const newGen = function*(): IterableIterator<T> {
            for (let idx = 0; idx < count; idx++) {
                yield fun(idx);
            }
        };

        return new Infinits<T>(newGen);
    };

    public static repeat = <T>(val: T, count: number = Infinity): Infinits<T> => {
        const newGen = function*(): IterableIterator<T> {
            for (let idx = 0; idx < count; idx++) {
                yield val;
            }
        };

        return new Infinits<T>(newGen);
    };

    public static from = <T>(iterator: Iterable<T>): Infinits<T> => {
        const newGen = function*(): IterableIterator<T> {
            for (const value of iterator) {
                yield value;
            }
        };

        return new Infinits<T>(newGen);
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

    public findIndex = (predicate: Predicate<T>): number => {
        let idx: number = 0;
        for (const value of this.exec()) {
            if (predicate(value)) {
                return idx;
            } else {
                idx++;
            }
        }

        // If no matches, return -1
        return -1;
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

        return new Infinits<T>(newGen);
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

        return new Infinits<T>(newGen);
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

        return new Infinits<T>(newGen);
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

        return new Infinits<S>(newGen);
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

        return new Infinits<T>(newGen);
    };

    // YES! I know this type is weird AF, but typescript has a really poor support for variadic kinds.
    // This workaround seems good enough, inference works fine, errors are clear.
    static zipLong = <TS extends Infinits<any>[]>(...lists: TS): Infinits<{ [K in keyof TS]: TS[K] extends Infinits<infer R> ? R : never }> => {
        const iters: IterableIterator<any>[] = lists.map((list: Infinits<any>) => list.exec());

        const newGen = function*(): IterableIterator<any> {
            for (let values = iters.map(iter => iter.next()); values.some(val => !val.done); values = iters.map(iter => iter.next())) {
                yield values.map(val => val.value);
            }
        };

        return new Infinits<any>(newGen);
    };

    // YES! I know this type is weird AF, but typescript has a really poor support for variadic kinds.
    // This workaround seems good enough, inference works fine, errors are clear.
    static zipShort = <TS extends Infinits<any>[]>(...lists: TS): Infinits<{ [K in keyof TS]: TS[K] extends Infinits<infer R> ? R : never }> => {
        const iters: IterableIterator<any>[] = lists.map((list: Infinits<any>) => list.exec());

        const newGen = function*(): IterableIterator<any> {
            for (let values = iters.map(iter => iter.next()); values.every(val => !val.done); values = iters.map(iter => iter.next())) {
                yield values.map(val => val.value);
            }
        };

        return new Infinits<any>(newGen);
    };

    public flatten = (): Infinits<T extends Infinits<infer R> ? R : T> => {
        const execute = this.generator;

        const newGen = function*(): IterableIterator<any> {
            for (const value of execute()) {
                if (value instanceof Infinits) {
                    yield* value.exec();
                } else {
                    yield value;
                }
            }
        };

        return new Infinits<any>(newGen);
    };

    public deepFlatten = (): Infinits<BaseInfinits<T>> => {
        const execute = this.generator;

        const newGen = function*(): IterableIterator<any> {
            for (const value of execute()) {
                if (value instanceof Infinits) {
                    yield* value.deepFlatten().exec();
                } else {
                    yield value;
                }
            }
        };

        return new Infinits<any>(newGen);
    }

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

        return new Infinits<T>(newGen);
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

        return new Infinits<[T, number]>(newGen);
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

        return new Infinits<S>(newGen);
    };

    public inspect = (fun: ForEachFunction<T>): Infinits<T> => {
        const execute: GeneratorBuilder<T> = this.generator;

        const newGen = function*(): IterableIterator<T> {
            for (const value of execute()) {
                fun(value);
                yield value;
            }
        };

        return new Infinits<T>(newGen);
    };

    public loop = (): Infinits<T> => {
        const loopedList = this;

        const newGen = function*(): IterableIterator<T> {
            for (;;) {
                const currentIterator = loopedList.exec();
                for (const value of currentIterator) {
                    yield value;
                }
            }
        };

        return new Infinits<T>(newGen);
    };
    /*
     *   END MODIFIERS
     */
}
