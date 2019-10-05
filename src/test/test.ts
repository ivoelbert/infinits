import { InfiniTs } from '../InfiniTs';

const test = (): void => {
    const evens = InfiniTs.range().map((n: number): number => n * 2);

    const odds = evens.clone().map((n: number): number => {
        return n + 1;
    });

    const zipped = evens
        .zipLong(odds)
        .take(20)

    const firstPart = zipped.clone().take(10);
    const secondPart = zipped.clone().drop(10);

    console.log("First part:")
    firstPart.forEach(console.log);
    console.log("Second part:")
    secondPart.forEach(console.log);
};

test();
