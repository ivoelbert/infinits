import { InfiniTs } from '../InfiniTs';

const clones = (): void => {
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

    /*
    *   As you see, you don't clone the entries of the infinite list.
    *   You clone the procedure to build it.
    *   If you want predictable clones avoid side effects!
    */
    const someEvens = evens.until((n: number) => {
        return Math.random() < 0.1;
    })

    const someMoreEvens = someEvens.clone();

    console.log("First random sample:");
    someEvens.forEach(console.log);
    console.log("Second random sample:");
    someMoreEvens.forEach(console.log);
};

clones();
