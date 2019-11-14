export type TabulateFunction<T> = (idx: number) => T;
export const tabulate = <T>(n: number, f: TabulateFunction<T>): T[] => {
    return [...new Array(n)].map((_, idx: number): T => f(idx));
};
