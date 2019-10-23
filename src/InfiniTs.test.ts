import { InfiniTs } from './InfiniTs';

test('basic range', () => {
    const basicRange = InfiniTs.range({ start: 0, end: 5, step: 1 });

    expect(basicRange.toArray()).toEqual([0, 1, 2, 3, 4]);
});

test('basic tabulate', () => {
    const basicTabulate = InfiniTs.tabulate((idx: number) => idx * 2, 5);

    expect(basicTabulate.toArray()).toEqual([0, 2, 4, 6, 8]);
});

test('basic repeat', () => {
    const basicRepeat = InfiniTs.repeat(42, 5);

    expect(basicRepeat.toArray()).toEqual([42, 42, 42, 42, 42]);
});

test('enumerate', () => {
    const enumerated = InfiniTs.repeat(42, 5).enumerate();

    expect(enumerated.toArray()).toEqual([[42, 0], [42, 1], [42, 2], [42, 3], [42, 4]]);
});
