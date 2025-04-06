---
title: 'User Defined Type Guards'
date: '2021-02-28T12:14:08.123Z'
description: 'Quick tutorial on TypeScripts User-Defined Type Guards'
tags: ['TypeScript']
duration: Lunch
---

Type Guards in TypeScript help you narrow down the specific type of a variable. This is especially usefull if you have variables
that could potentially have multiple types. For example values could also be `null` or `undefined` to their regular type.
Or you don't even know the proper type, because it may be data from an api or user input.

- [Introduction](#introduction)
- [Default Type Guards](#default-type-guards)
    - [typeof](#typeof)
    - [type assertions](#type-assertions)
    - [instanceof](#instanceof)
    - [in operator](#in-operator)
- [User-Defined Type Guards](#user-defined-type-guards)
- [Conclusion](#conclusion)

## Introduction

What even is a Type Guard? A Type Guard is a way to narrow down the type of a given variable in order to use certain
properties or methods that may not be available on all possible types. And by default you are only able to access
members that are guaranteed to be available in every possible type. Quick example:

```typescript
class Car {
    public name: string;
    public drive(): void {}
}
class Tree {
    public name: string;
    public grow(): void {}
}
const myVariable: Tree | Car;
console.log(myVariable.name);
console.log(myVariable.drive()); // throws an error
console.log(myVariable.grow()); // throws an error
```

Now the `myVariable` can only use the property `name` and if you want to use one of the other members you have to narrow
down the type.

## Default Type Guards

TypeScript has a lot of default Type Guards already, and you probably already have used a couple without knowing how they
are called. Let's look at a couple of examples.

### typeof

```typescript
const userInput: unknown = 'this could be any value';
if (typeof userInput === 'string') {
    console.log(userInput.length);
}
```

### type assertions

We know those already from plain JavaScript, and they work also as Type Guards in TypeScript.

```typescript
const userInput: string | null = 'this could either be a string or null';
if (userInput !== null) {
    console.log(userInput.length);
}
```

### instanceof

This is a quite powerful one if you work a lot with proper classes instead of anonym objects.

```typescript
class Vehicle {
    public name: string;
}
class Car extends Vehicle {
    public openTrunk(): void {}
}
class Motorcycle extends Vehicle {
    public doWheelie(): void {}
}

const vehicle: Car | Motorcycle = getVehicleFromDataBase();
if (vehicle instanceof Car) {
    vehicle.openTrunk();
} else {
    vehicle.doWheelie();
}
```

### in operator

The `in` operator is lesser known, but still really really usefull. Let's use the same class setup like
in the previous example. You could also do the check the following way

```typescript
const vehicle: Car | Motorcycle = getVehicleFromDataBase();
if ('openTrunk' in vehicle) {
    vehicle.openTrunk();
}
```

As you can see this works just as fine. However this is usefull if you have multiple classes that implement the
same function. For example

```typescript
class Truck extends Vehicle {
    public openTrunk(): void {}
}
const vehicle: Truck | Car | Motorcycle = getVehicleFromDataBase();
if ('openTrunk' in vehicle) {
    vehicle.openTrunk();
}
```

This is actually easier than the `instanceof` operator

```typescript
if (vehicle instanceof Car || vehicle instanceof Truck) {
}
```

The `in` operator is also really usefull if you work **with objects/interfaces instead of classes**, because `instanceof` checks
won't work on those.

## User-Defined Type Guards

User-Defined Type Guards allow you to add custom Type Guards to TypeScript.  
Now you might wonder what use cases are not covered with all the default methods from above. Let's look at a couple of
real world examples and how User-Defined Type Guards work.

### Narrow down nullable types

It is a common use cases that you have an array of values, and those values can also be `null` or `undefined`.
But you want to have an array without all the `null` values.  
If you have no experience with User-Defined Type Guards you probably try something like this:

```typescript
const arrayWithNullableValues: Array<string | null> = getValuesFromADataBase();

const arrayWithOnlyStrings: Array<string> = arrayWithNullableValues.filter((value: string | null): boolean => {
    return value !== null;
});
```

And this actually _does not_ work, since the return value from the filter function is still type `Array<string | null>`.
This results in the following error:

> TS2322: Type '(string | null)[]' is not assignable to type 'string[]'.

However with one minor adjustment we can get this to work

```typescript
const arrayWithNullableValues: Array<string | null> = getValuesFromADataBase();

const arrayWithOnlyStrings: Array<string> = arrayWithNullableValues.filter((value: string | null): value is string => {
    return value !== null;
});
```

Notice the return type of the `.filter()` function changed. The syntax is straight forward. First comes the parameter
name from your function that you want to check, and the `is XXX` defines what type do you expect to return.  
This works for primitive types like `string` or `number` but also for classes from our previous example, e.g.
`value is Truck`.

```typescript
const arrayWithNullableValues: Array<Vehicle | null> = getValuesFromADataBase();

const arrayWithOnlyTrucks: Array<Truck> = arrayWithNullableValues.filter((value: Vehicle | null): value is Truck => {
    return value instanceof Truck;
});
```

For this to work, we also combined the check with one of the default Type Guards from typescript the [instanceof operator](#instanceof)

### Extract into separate function

Inside of `Array.filter()` functions this is really useful, but we can also use this standalone and have predefined functions for
it. Let me show you one of the Type Guards Angular is providing and a proper use case.

```typescript
/**
 * Use from: https://github.com/angular
 * https://github.com/angular/angular/blob/58408d6a60bd43b89cb1d9ad6f8812c8e696d42d/packages/compiler/src/util.ts#L225
 * Determine if the argument is shaped like a Promise
 */
function isPromise<T = any>(obj: any): obj is Promise<T> {
    // allow any Promise/A+ compliant thenable.
    // It's up to the caller to ensure that obj.then conforms to the spec
    return !!obj && typeof obj.then === 'function';
}
```

Same syntax we just learned earlier. The return type of the method defines whether our given param `obj` is an Promise
or not. And the function itself is implementing the check to reach that goal.  
**That check is not related to the return type, so TypeScript won't check whether those two matches.**

Now let's see it in action. _(Ignore the [Generic \<T\>](https://www.typescriptlang.org/docs/handbook/generics.html) param for now)_

```typescript
function resolveValue<T = any>(param: Promise<T> | Observable<T>): void {
    if (isPromise<T>(param)) {
        param.then((value: T) => {
            // application logic
        });
    } else {
        param.subscribe((value: T) => {
            // application logic
        });
    }
}
```

## Conclusion

User-Defined Type Guards are an awesome feature and from what I can tell not used enough. People will find the 'funniest'
workarounds like type assertions, lets look at one of our previous examples:

```typescript
const arrayWithNullableValues: Array<string | null> = getValuesFromADataBase();

const arrayWithOnlyStrings: Array<string> = arrayWithNullableValues.filter((value: string | null): boolean => {
    return value !== null;
}) as Array<string>;
```

Notice the `as Array<string>` which just cast a value to the given value, but without any checks. This approach is
really error prone, so I would recommend not to use this.

Let me know whether you already worked with User-Defined Type Guards or if you could solve everything with the
Type Guards provided by TypeScript.
