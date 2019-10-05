import { InfiniTs } from '../InfiniTs';

const test = (): void => {
    InfiniTs.range()
        .map((n: number): number => n * 2)
        .drop(100)
        .take(10)
        .forEach(console.log);
};

test();
