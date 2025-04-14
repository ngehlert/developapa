---
title: 'Get object reference IDs in JavaScript/TypeScript'
date: '2022-09-28T23:59:08.123Z'
description: 'Easy way to get unique object reference IDs in JavaScript/TypeScript'
tags: ['TypeScript', 'JavaScript', 'Snippet']
duration: Snack
---

Sometimes you want to get an object reference in JavaScript. While other languages like Java allow for the object reference
to be printed, in JS this is not possible.  
I want to show a quick & easy way how to get an id per object.

**Disclaimer: It's not possible to get the internal used object references, but this method rather assigns IDs to objects
and makes sure for the same object you will always get the same ID.**

You can find a [StackBlitz example here](https://stackblitz.com/edit/typescript-9lhmyz?file=index.ts)

### TypeScript

```typescript
let count: number = 1;
const idMap: WeakMap<Record<string, unknown> | Array<unknown>, number> = new WeakMap<Record<string, unknown> | Array<unknown>, number>();
function getObjectId(object: Record<string, unknown> | Array<unknown>): number {
    const objectId: number | undefined = idMap.get(object);
    if (objectId === undefined) {
        count += 1;
        idMap.set(object, count);

        return count;
    }

    return objectId;
}
```

### JavaScript

```javascript
let count = 1;
const idMap = new WeakMap();
function getObjectId(object) {
    const objectId = idMap.get(object);
    if (objectId === undefined) {
        count += 1;
        idMap.set(object, count);

        return count;
    }

    return objectId;
}
```

## How does it work

A WeakMap can only have objects as keys (regular Maps can have any data type). But the interesting part here actually is that
WeakMaps do not create strong references to the objects they are using. This means you don't need to worry about garbage
collection / memory leaks. Because once an object does no longer exist, it will automatically be removed from the WeakMap
as well. For more information see [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)  
As long as the object exists the WeakMap will keep the reference and the linked counter ID to it. And creating a similar object
will still result in a different ID because they have a different reference.

## Alternative IDs

This version is using a number to keep it simple. There are two other data types I used as well in the past.  
`uuid` are by design also always unique, so also a great fit here ([npm package](https://www.npmjs.com/package/uuid))

If you want to always get the same ID for the same object (with a counter) you can do a combination of `JSON.toString()` and
a basic string hash algorithm - result could then look something like `1-fbced512asd`. And if you try to get it with the same
object `2-fbced512asd` etc. (Keep in mind this requires some additional effort like proper & fast hashing algorithm and sorting
of the object properties)
