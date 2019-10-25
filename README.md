# Infinite lists!

The goal of this library is to let you create potentially infinite lists.

It's based on javascript's [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator), and it provides many different generation methods and modifiers.

# API

The API provides three different kind of methods: [Generators](#Generators), [Executions](#Executions) and [Modifiers](#Modifiers)

## Generators

Generators are the entry point for this library. They let you create lists in many different ways:

-   ### `Infinits.range`

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
export type rangeOptions = {
    start?: number; // defaults to 0
    end?: number; // defaults to Infinity if step > 0, -Infinity otherwise.
    step?: number; // defaults to 1
};
```

-   ### `Infinits.tabulate`

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

-   ### `Infinits.repeat`

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

-   ### `Infinits.from`

Lets you crate a list from any javascript [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) (array, string, etc...).

```typescript
import { Infinits } from 'infinits';

// [42, 42, 42, 42, 42]
const five42: Infinits<number> = Infinits.from([42, 42, 42, 42, 42]);

// ["i", "n", "f", "i", "n", "i", "t", "s"]
const spellMyName: Infinits<string> = Infinits.from('infinits');
```

## Executions

Executions are ways of consuming a list.

-   ### `exec`

Returns an Iterable from a List

```typescript
import { Infinits } from 'infinits';

const five42: Infinits<number> = Infinits.from([42, 42, 42, 42, 42]);

for (const element of five42.exec()) {
    console.log(`The answer is ${element}`);
}
```

-   ### `forEach`

Runs a callback on each element of the array (index is also available). _might never finish_ if the list is infinite!

```typescript
import { Infinits } from 'infinits';

Infinits.from([42, 42, 42, 42, 42]).forEach((element: number) => {
    console.log(`The answer is ${element}`);
});

// Also accepts and index
Infinits.repeat(0, 10).forEach((element: number, index: number) => {
    console.log(`The element at ${index} is ${element}`);
});
```

-   ### `toArray`

Returns a good old array. _might never finish_ if the list is infinite!

```typescript
import { Infinits } from 'infinits';

// [0, 0, 0, 0, 0]
const five42: number[] = Infinits.repeat(0, 5).toArray();
```

-   ### `reduce`

Basically the same as javascript's [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce). _might never finish_ if the list is infinite!

```typescript
import { Infinits } from 'infinits';

// 0 + 1 + 2 + 3 + 4
const sumFrom0to4: number = Infinits.range({ end: 5 }).reduce((sum, element) => sum + element, 0);
```

-   ### `count`

Returns the number of elements in a list. _might never finish_ if the list is infinite!

Optionally takes a predicate to determine which elements to count

```typescript
import { Infinits } from 'infinits';

// 5
const n: number = Infinits.repeat(0, 5).count();

// 5
const lessThan5Count: number = Infinits.range({ end: 10 }).count((element: number) => element < 5);
```

-   ### `nth`

Returns the nth element of the list. _might never finish_ if the list is infinite!

Optionally takes a predicate to determine which elements to count

```typescript
import { Infinits } from 'infinits';

// 5
const n: number = Infinits.repeat(0, 5).count();

// 5
const lessThan5Count: number = Infinits.range({ end: 10 }).count((element: number) => element < 5);
```

-   ### `every`

Returns true if a predicate is true for all elements in the list. _might never finish_ if the list is infinite!

```typescript
import { Infinits } from 'infinits';

// true
const allLessThan5: boolean = Infinits.repeat(0, 5).every((element: number) => element < 5);

// false
const lessThan5Count: boolean = Infinits.range({ end: 10 }).every((element: number) => element < 5);
```

-   ### `some`

Returns true if a predicate is true for at least one element in the list

```typescript
import { Infinits } from 'infinits';

// true
const someIsOne: boolean = Infinits.range({ end: 5 }).some((element: number) => element === 1);

// false
const someIsGtTen: boolean = Infinits.range({ end: 10 }).some((element: number) => element > 10);
```

-   ### `find`

Returns the first element that makes a predicate true, undefined if no element makes it. _might never finish_ if the list is infinite!

```typescript
import { Infinits } from 'infinits';

// 1001
const gtThan1000: number = Infinits.range().find((element: number) => element > 1000);

// undefined
const lessThan5Count: number = Infinits.range({ end: 10 }).find((element: number) => element > 10);
```
