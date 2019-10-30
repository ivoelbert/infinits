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

test('run two reduces', () => {
    const oneToFour: Infinits<number> = Infinits.range({ end: 5 });
    const firstReduce: number = oneToFour.map(x => x + 1).reduce((sum, element) => sum + element, 0);
    const secondReduce: number = oneToFour.reduce((sum, element) => sum + element, 0);

    expect(firstReduce).toBe(15);
    expect(secondReduce).toBe(10);
});

test('infinite range 100th element', () => {
    const element100: number = Infinits.range().nth(100);

    expect(element100).toBe(100);
});

test('drop 5 elements', () => {
    const drop50: Infinits<number> = Infinits.range({ end: 10 }).drop(5);

    expect(drop50.toArray()).toEqual([5, 6, 7, 8, 9]);
});

test('append two short lists', () => {
    const zeros: Infinits<number> = Infinits.repeat(0, 5);
    const ones: Infinits<number> = Infinits.repeat(1, 5);

    const zerosAndOnes: Infinits<number> = zeros.append(ones);

    expect(zerosAndOnes.toArray()).toEqual([0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
});

test('enumerate equivalences', () => {
    const zeros: Infinits<[number, number]> = Infinits.repeat(0)
        .enumerate()
        .take(50);
    const zeros2: Infinits<[number, number]> = Infinits.repeat(0)
        .map((x: number, i: number): [number, number] => [x, i])
        .take(50);
    const zeros3: Infinits<[number, number]> = Infinits.zipShort(Infinits.repeat(0), Infinits.range()).take(50);

    expect(zeros.toArray()).toEqual(zeros2.toArray());
    expect(zeros.toArray()).toEqual(zeros3.toArray());
});

test('scan with sum', () => {
    const scanned: Infinits<number> = Infinits.range()
        .scan((sum, element) => sum + element, 0)
        .take(10);

    expect(scanned.toArray()).toEqual([0, 1, 3, 6, 10, 15, 21, 28, 36, 45]);
});

test('count evens from 0 to 9', () => {
    const evensCount: number = Infinits.range({ end: 10 }).count((n: number) => n % 2 === 0);

    expect(evensCount).toBe(5);
});

test('zipLong multiple zip', () => {
    const three0 = Infinits.range()
        .filter((n: number) => n % 3 === 0)
        .take(3);
    const three1 = Infinits.range()
        .filter((n: number) => n % 3 === 1)
        .take(3);
    const three2 = Infinits.range()
        .filter((n: number) => n % 3 === 2)
        .take(4);
    const someWords = Infinits.repeat('yes').take(4);

    const first3 = Infinits.zipLong(three0, three1, three2, someWords);

    expect(first3.toArray()).toEqual([[0, 1, 2, 'yes'], [3, 4, 5, 'yes'], [6, 7, 8, 'yes'], [undefined, undefined, 11, 'yes']]);
});

test('zipShort multiple zip', () => {
    const three0 = Infinits.range()
        .filter((n: number) => n % 3 === 0)
        .take(3);
    const three1 = Infinits.range()
        .filter((n: number) => n % 3 === 1)
        .take(3);
    const three2 = Infinits.range()
        .filter((n: number) => n % 3 === 2)
        .take(4);
    const someWords = Infinits.repeat('yes').take(4);

    const first3 = Infinits.zipShort(three0, three1, three2, someWords);

    expect(first3.toArray()).toEqual([[0, 1, 2, 'yes'], [3, 4, 5, 'yes'], [6, 7, 8, 'yes']]);
});

test('find element', () => {
    const pow2 = Infinits.tabulate((idx: number) => 2 ** idx);
    const gt1000 = pow2.find((n: number) => n > 1000);

    expect(gt1000).toBe(1024);
});

test('find index', () => {
    const pow2 = Infinits.tabulate((idx: number) => 2 ** idx);
    const gt1000idx = pow2.findIndex((n: number) => n > 1000);

    expect(gt1000idx).toBe(10);
});

test('list of lists', () => {
    const deepList = Infinits.repeat(Infinits.from([0, 1]), 5);
    expect(deepList.map(list => list.toArray()).toArray()).toEqual([[0, 1], [0, 1], [0, 1], [0, 1], [0, 1]]);
})

test('flatten deep list', () => {
    // Flatten a list of lists
    const deepList = Infinits.repeat(Infinits.from([0, 1]), 5);
    const flattened = deepList.flatten();
    expect(flattened.toArray()).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);

    // Flatten a shallow list (x => x)
    const shallowList = Infinits.range({ end: 5 });
    expect(shallowList.flatten().toArray()).toEqual([0, 1, 2, 3, 4]);
});
