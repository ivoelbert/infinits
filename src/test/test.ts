import { InfiniTs } from '../InfiniTs';

const test = (): void => {
    const evens = InfiniTs.range().map((n: number): number => n * 2);

    const odds = evens.clone().map((n: number): number => {
        return n + 1;
    });

    evens
        .zipLong(odds)
        .take(10)
        .forEach(console.log);
};

test();
