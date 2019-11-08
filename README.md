# Infinite lists!

The goal of this library is to let you create potentially infinite lists in a memory efficient way.

It's based on javascript's [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator), and it provides many different generation methods and modifiers.

# API

The API provides three different kind of methods: [Generators](#generators), [Executions](#executions) and [Modifiers](#modifiers)

## Generators

Generators are the entry point for this library. They let you create lists in many different ways:

### `Infinits.range`

Lets you create a list from a range of numbers.

```typescript
import { Infinits } from 'infinits';

// [0, 1, 2, ...]
const allNonNegative: Infinits<number> = Infinits.range();

// [1, 2, 3, ...]
const allPositive: Infinits<number> = Infinits.range({ start: 1 });

// [0, ..., 9]
const digits: Infinits<number> = Infinits.range({ end: 10 });

// [0, -1, -2, -3, ...]
const allNonPositive: Infinits<number> = Infinits.range({ step: -1 });
```

As you see, range accepts this options (with their corresponding default)

```typescript
export type RangeOptions = {
    start?: number; // defaults to 0
    end?: number; // defaults to Infinity if step > 0, -Infinity otherwise.
    step?: number; // defaults to 1
};
```

### `Infinits.tabulate`

Lets you create a list from a function taking the item's index.

```typescript
import { Infinits } from 'infinits';

// [1, 2, 3, ...]
const allPositive: Infinits<number> = Infinits.tabulate(x => x + 1);

// [-1, -2, -3, ...]
const allNegative: Infinits<number> = Infinits.tabulate(x => -x - 1);

// [1, 2, 4, 8, 16, ...]
const pow2: Infinits<number> = Infinits.tabulate(x => 2 ** x);

// [0, ..., 9]
const digits: Infinits<number> = Infinits.tabulate(x => x, 10);

// ['right', 'left', 'right', 'left', ...]
const howToWalk: Infinits<string> = Infinits.tabulate(x => (x % 2 ? 'left' : 'right'));
```

It takes a function of type

```typescript
type TabulateFun<T> = (idx: number) => T;
```

and optionally a number to limit the elements count (Infinity by default).

### `Infinits.repeat`

Lets you crate a list by repeating a value

```typescript
import { Infinits } from 'infinits';

// [0, 0, 0, 0, ...]
const lotsOfZeros: Infinits<number> = Infinits.repeat(0);

// ['messi', 'messi', 'messi', ...]
const messi: Infinits<string> = Infinits.repeat('messi');

// [42, 42, 42, 42, 42]
const five42: Infinits<string> = Infinits.repeat(42, 5);
```

It takes a value of any type and optionally a number to limit the elements count (Infinity by default).

### `Infinits.from`

Lets you crate a list from any javascript [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (array, string, etc...).

```typescript
import { Infinits } from 'infinits';

// [42, 42, 42, 42, 42]
const five42: Infinits<number> = Infinits.from([42, 42, 42, 42, 42]);

// ["i", "n", "f", "i", "n", "i", "t", "s"]
const spellMyName: Infinits<string> = Infinits.from('infinits');
```

## Executions

Executions are ways of consuming a list. This might never end if a list is actually infinite, so be careful what you do!

### `exec`

Returns an Iterable from a List

```typescript
import { Infinits } from 'infinits';

const five42: Infinits<number> = Infinits.from([42, 42, 42, 42, 42]);

for (const element of five42.exec()) {
    console.log(`The answer is ${element}`);
}
```

### `forEach`

Runs a callback on each element of the array (index is also available).

```typescript
import { Infinits } from 'infinits';

Infinits.from([42, 42, 42, 42, 42]).forEach((element: number) => {
    console.log(`The answer is ${element}`);
});

// Also accepts an index
Infinits.repeat(0, 10).forEach((element: number, index: number) => {
    console.log(`The element at ${index} is ${element}`);
});
```

### `toArray`

Returns a good old array.

```typescript
import { Infinits } from 'infinits';

// [0, 0, 0, 0, 0]
const five42: number[] = Infinits.repeat(0, 5).toArray();
```

### `reduce`

Basically the same as javascript's [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).

```typescript
import { Infinits } from 'infinits';

// 0 + 1 + 2 + 3 + 4 = 10
const sumFrom0to4: number = Infinits.range({ end: 5 }).reduce((sum, element) => sum + element, 0);

// -1 / 12. LOL, YOU WISH! This never ends :(
const sumOfAllIntegers: number = Infinits.range().reduce((sum, element) => sum + element, 0);
```

### `count`

Returns the number of elements in a list.

Optionally takes a predicate to determine which elements to count

```typescript
import { Infinits } from 'infinits';

// 5
const n: number = Infinits.repeat(0, 5).count();

// 5
const lessThan5Count: number = Infinits.range({ end: 10 }).count((element: number) => element < 5);
```

### `nth`

Returns the nth element of the list.

Keep in mind this process is O(N)! We have to traverse the list to get to the nth element.

```typescript
import { Infinits } from 'infinits';

// 0
const n: number = Infinits.repeat(0).nth(10);

// 100
const lessThan5Count: number = Infinits.range().nth(100);
```

### `every`

Returns true if a predicate is true for all elements in the list.

```typescript
import { Infinits } from 'infinits';

// true
const allLessThan5: boolean = Infinits.repeat(0, 5).every((element: number) => element < 5);

// false
const lessThan5Count: boolean = Infinits.range({ end: 10 }).every((element: number) => element < 5);
```

### `some`

Returns true if a predicate is true for at least one element in the list

```typescript
import { Infinits } from 'infinits';

// true
const someIsOne: boolean = Infinits.range({ end: 5 }).some((element: number) => element === 1);

// false
const someIsGtTen: boolean = Infinits.range({ end: 10 }).some((element: number) => element > 10);
```

### `find`

Returns the first element that makes a predicate true, undefined if no element makes it.

```typescript
import { Infinits } from 'infinits';

// 1001
const gtThan1000: number = Infinits.range().find((element: number) => element > 1000);

// undefined
const lessThan5Count: number = Infinits.range({ end: 10 }).find((element: number) => element > 10);
```

### `findIndex`

Returns the index of the first element that makes a predicate true, -1 if no element makes it.

```typescript
import { Infinits } from 'infinits';

// 1001
const gtThan1000: number = Infinits.range().findIndex((element: number) => element > 1000);

// -1
const lessThan5Count: number = Infinits.range({ end: 10 }).findIndex((element: number) => element > 10);
```

## Modifiers

Modifiers provide a way of transforming lists in a [lazy](https://en.wikipedia.org/wiki/Lazy_evaluation) way.

All modifiers are chainable.

### `until`

remove all elements after the first one to make a predicate true.

```typescript
import { Infinits } from 'infinits';

// [0, ..., 1000]
const upTo1000: Infinits<number> = Infinits.range().until((element: number) => element > 1000);
```

### `take`

Limit a list to a specific length.

```typescript
import { Infinits } from 'infinits';

// [0, ..., 99]
const take100: Infinits<number> = Infinits.range().take(100);
```

### `drop`

Remove the first N elements from a list.

```typescript
import { Infinits } from 'infinits';

// [50, ..., 99]
const drop50: Infinits<number> = Infinits.range({ end: 100 }).drop(50);
```

### `map`

Basically the same as javascript's [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

```typescript
import { Infinits } from 'infinits';

// [0, 2, 4, 6, 8, 10]
const double: Infinits<number> = Infinits.range({ end: 5 }).map((x: number) => x * 2);

// [0, ..., 9]
const digits: Infinits<number> = Infinits.repeat(0, 10).map((x: number, index: number) => index);
```

### `filter`

Basically the same as javascript's [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

```typescript
import { Infinits } from 'infinits';

// [0, 2, 4, 6, ...]
const evens: Infinits<number> = Infinits.range().map((x: number) => x % 2 === 0);
```

### `Infinits.zipLong` (static)

Takes any number of lists and returns a list of tuples. Nth element in the new list is a tuple made from the Nth element of each list.

The resulting list's length will be that of the longest list. `undefined` will be used to fill the holes.

```typescript
import { Infinits } from 'infinits';

const evens: Infinits<number> = Infinits.range().filter((x: number) => x % 2 === 0);
const odds: Infinits<number> = Infinits.range().filter((x: number) => x % 2 === 1);

// [ [0, 1], [2, 3], [4, 5], ... ]
const zippedNumbers = Infinits.zipLong(evens, odds);

const to5: Infinits<number> = Infinits.range({ end: 5 });
const to3: Infinits<number> = Infinits.range({ end: 3 });

// [ [0, 0], [1, 1], [2, 2], [3, undefined], [4, undefined] ]
const zippedWithHoles = Infinits.zipLong(to5, to3);

const mult2: Infinits<number> = Infinits.range().filter((x: number) => x % 2 === 0);
const mult3: Infinits<number> = Infinits.range().filter((x: number) => x % 3 === 0);
const mult5: Infinits<number> = Infinits.range().filter((x: number) => x % 5 === 0);

// [ [0, 0, 0], [2, 3, 5], [4, 6, 10], [6, 9, 15], ...]
const multipleZip = Infinits.zipLong(mult2, mult3, mult5);
```

### `Infinits.zipShort` (static)

same as [zipLong](#zipLong) but the resulting list's length will be that of the shortest list. Won't produce any holes.

```typescript
import { Infinits } from 'infinits';

const evens: Infinits<number> = Infinits.range().filter((x: number) => x % 2 === 0);
const odds: Infinits<number> = Infinits.range().filter((x: number) => x % 2 === 1);

// [ [0, 1], [2, 3], [4, 5], ... ] Same as zipLong!
const zippedNumbers = Infinits.zipShort(evens, odds);

const to5: Infinits<number> = Infinits.range({ end: 5 });
const to3: Infinits<number> = Infinits.range({ end: 3 });

// [ [0, 0], [1, 1], [2, 2] ]
const zippedWithHoles = Infinits.zipShort(to5, to3);

const mult2: Infinits<number> = Infinits.range().filter((x: number) => x % 2 === 0);
const mult3: Infinits<number> = Infinits.range().filter((x: number) => x % 3 === 0);
const mult5: Infinits<number> = Infinits.range().filter((x: number) => x % 5 === 0);

// [ [0, 0, 0], [2, 3, 5], [4, 6, 10], [6, 9, 15], ...]
const multipleZip = Infinits.zipLong(mult2, mult3, mult5);
```

### `flatten`

Similar to javascript's [flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat), but only depth 1.

If the list isn't a list of lists, it does nothing.

```typescript
// [[0, 1], [0, 1], [0, 1], ...]
const deepList: Infinits<Infinits<number>> = Infinits.repeat(Infinits.from([0, 1]));

// [0, 1, 0, 1, 0, 1, ...]
const shallowList: Infinits<number> = deepList.flatten();

// [0, 1, 0, 1, 0, 1, ...]
const flattenAgain: Infinits<number> = shallowList.flatten();
```

### `deepFlatten`

Similar to javascript's [flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat), but Infinite depth.

Type inference only works until the 10th level cause Typescript doesn't support recursive types :(.

```typescript
// [[0, 1], [0, 1]]
const deepList = Infinits.repeat(Infinits.from([0, 1]), 2);

// [[[0, 1], [0, 1]], [[0, 1], [0, 1]]]
const deeperList = Infinits.repeat(deepList, 2);

// [[[[0, 1], [0, 1]], [[0, 1], [0, 1]]], [[[0, 1], [0, 1]], [[0, 1], [0, 1]]]]
const reallyDeepList = Infinits.repeat(deeperList, 2);

// [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
const shallowList: Infinits<number> = deepList.deepFlatten();

// ... After nesting more and more lists, more than 10 times ...
const deepestListEver = Infinits.repeat(absurdlyDeepList, 2);

// You'll have to use `as Infinits<YourBaseType>`
const badInferenceShallow: Infinits<number> = deepestListEver.deepFlatten() as Infinits<number>;
```

### `append`

appends a list to another one. Similar to javascript's [concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)

```typescript
import { Infinits } from 'infinits';

const zeros: Infinits<number> = Infinits.repeat(0, 5);
const ones: Infinits<number> = Infinits.repeat(1, 5);

// [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
const zerosAndOnes: Infinits<number> = zeros.append(ones);
```

### `enumerate`

Returns a list of pairs, first element of the pair is the original element, second is the index in the list.

```typescript
import { Infinits } from 'infinits';

// [ [0, 0], [0, 1], [0, 2], ...]
const zeros: Infinits<[number, number]> = Infinits.repeat(0).enumerate();

// Equivalent to
const zeros2: Infinits<[number, number]> = Infinits.repeat(0).map((x: number, i: number): [number, number] => [x, i]);

// And to
const zeros3: Infinits<[number, number]> = Infinits.zipShort(Infinits.repeat(0), Infinits.range());
```

### `scan`

Similar to [reduce](#reduce), but returns a list of every partial result and works lazily.

```typescript
import { Infinits } from 'infinits';

// All partial sums of [0, 1, 2, ...]
// [0, 1, 3, 6, 10, 15, 21, 28, ...]
const sumFrom0to4: Infinits<number> = Infinits.range().scan((sum, element) => sum + element, 0);
```

### `inspect`

Lazily runs a callback on every item. This means the callback will be executed once the value is consumed.

```typescript
import { Infinits } from 'infinits';

// Does nothing, yet...
const inspected: Infinits<number> = Infinits.range({ end: 3 })
    .inspect((x: number) => console.log(`inspected ${x}`))
    .map(x => x * 2);

// This logs a lot!
inspected.forEach((x: number) => console.log(`then logged ${x}`));

/*
 *   LOGS:
 *   inspected 0
 *   then logged 0
 *   inspected 1
 *   then logged 2
 *   inspected 2
 *   then logged 4
 */
```

### `loop`

Takes a list and make it circular. This means: when the list ends, start again from the begining.

```typescript
import { Infinits } from 'infinits';

// [0, 1, 0, 1, 0, 1, ...]
const onesAndZeros = Infinits.from([0, 1]).loop();
```

### `splitBy`

Takes a function that returns a key (string) for each element, returns an object that groups elements into multiple lists for each of those keys.

If you take a list from a non-existing key (a key that your function will never return) you won't get any errors, but executions of that list will run forever and not produce a single value :(. This happens cause you can't know in advance all possible keys produced by an infinite list, so we can't assume anything.

```typescript
import { Infinits } from 'infinits';

// [0, 1, 2, 3, ...]
const positiveInts: Infinits<number> = Infinits.range();

const evensAndOdds = positiveInts.splitBy((n: number) => n % 2 === 0 ? 'evens' : 'odds');

// [0, 2, 4, 6, 8]
const evenNumbers = evensAndOdds.evens.take(5);

// [1, 3, 5, 7, 9]
const oddNumbers = evensAndOdds.odds.take(5);
```

# TODO:

Improve test coverage, please :(
