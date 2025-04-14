---
title: 'Typescript decorator to call a method only once'
date: '2023-05-01T13:17:08.123Z'
description: 'TypeScript decorator function that allows you to call a setter only once'
tags: ['TypeScript', 'Snippet']
duration: Snack
---

Sometimes you want methods on a class just to be called once. Cases like this could be for example some initialization logic,
that does not fit into a constructor because the value is set at a later point in time but once it's set, it is not allowed
to be overwritten.

What I did in the past was just create a variable outside called `isInitialized` that defaults to false. And once the function
was called set it to true. Simplified this looked something like this:

```typescript
class MyTestClass {
    isInitialized: boolean = false;

    public init(): void {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;
        // do my init logic here
    }
}
```

With a TypeScript decorator this can be simplified and extracted in a decorator function.

```typescript
export function callFunctionOnlyOnce() {
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        const originalMethod: any = descriptor.value;
        let isInitialized: boolean = false;

        descriptor.value = function (...args: Array<unknown>): void {
            if (isInitialized || !originalMethod) {
                return;
            }
            isInitialized = true;

            originalMethod.apply(this, args);
        };
    };
}

class MyTestClass {
    @callFunctionOnlyOnce()
    public init(): void {
        //do init logic here
    }
}
```

If you want to use this on a setter function you need to replace the `descriptor.value` with a `descriptor.set`

```typescript
function callSetterOnlyOnce() {
    return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
        const originalMethod: any = descriptor.set;
        let isInitialized: boolean = false;

        descriptor.set = function (...args: Array<unknown>): void {
            if (isInitialized || !originalMethod) {
                return;
            }
            isInitialized = true;

            originalMethod.apply(this, args);
        };
    };
}

class MyTestClass {
    @callSetterOnlyOnce()
    set myValue(newValue: number): void {
        //do init logic here
    }
}
```

If you want to see this in action you can check out this [Stackblitz](https://stackblitz.com/edit/angular-btdgyf?file=src/main.ts)
