import { Infinits } from './Infinits';

test('basic range', () => {
    const basicRange = Infinits.range({ start: 0, end: 5, step: 1 });

    expect(basicRange.toArray()).toEqual([0, 1, 2, 3, 4]);
});

test('negative range', () => {
    const basicRange = Infinits.range({ end: -5, step: -1 });

    expect(basicRange.toArray()).toEqual([0, -1, -2, -3, -4]);
});

test('negative range and take', () => {
    const basicRange = Infinits.range({ step: -1 }).take(5);

    expect(basicRange.toArray()).toEqual([0, -1, -2, -3, -4]);
});

test('basic tabulate', () => {
    const basicTabulate = Infinits.tabulate((idx: number) => idx * 2, 5);

    expect(basicTabulate.toArray()).toEqual([0, 2, 4, 6, 8]);
});

test('basic repeat', () => {
    const basicRepeat = Infinits.repeat(42, 5);

    expect(basicRepeat.toArray()).toEqual([42, 42, 42, 42, 42]);
});

test('enumerate', () => {
    const enumerated = Infinits.repeat(42, 5).enumerate();

    expect(enumerated.toArray()).toEqual([[42, 0], [42, 1], [42, 2], [42, 3], [42, 4]]);
});

test('scan', () => {
    const scanned = Infinits.repeat(1, 5).scan((state: number, current: number) => {
        return state + current;
    }, 0);

    expect(scanned.toArray()).toEqual([1, 2, 3, 4, 5]);
});

test('from', () => {
    const fromArray = Infinits.from([1, 2, 3, 4]);

    expect(fromArray.toArray()).toEqual([1, 2, 3, 4]);
});

test('loop and take', () => {
    const looped = Infinits.tabulate((idx: number) => idx, 2)
        .loop()
        .take(6);

    expect(looped.toArray()).toEqual([0, 1, 0, 1, 0, 1]);
});

test('count', () => {
    const countLessThan5: number = Infinits.tabulate((idx: number) => idx, 10).count((elem: number) => elem < 5);

    expect(countLessThan5).toBe(5);
});

test('reduce [0..4] with sum', () => {
    const ten: number = Infinits.range({ end: 5 }).reduce((sum, element) => sum + element, 0);

    expect(ten).toBe(10);
});

test('count less than 5', () => {
    const lessThan5Count: number = Infinits.range({ end: 10 }).count((element: number) => element < 5);

    expect(lessThan5Count).toBe(5);
});
