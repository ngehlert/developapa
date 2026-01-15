---
title: 'Angular computedSignal with the previousValue'
date: '2025-05-20T13:17:08.123Z'
description: 'Sometimes you just want to have the previous value of a computed signal. I will show you how to do this.'
tags: ['TypeScript', 'Angular', 'Snippet', 'signals']
duration: Snack
---

Well let's start with the sad news if you are using Angular 18 and before this is not available out of the box.  
Angular 19 introduces something called `linkedSignal` that allows us to do this.  
`computedSignal` really should not do this. By design it is a pure function that means it should not take the previous state into
account. In this [GitHub Thread](https://github.com/angular/angular/issues/54339) you can see the discussion about this.

What would be a use case? In my case I have a signal that holds an array of items. And while I can use `computedSignal` or 
`effect` to keep track of the array in some cases I wanted to know *what* changed. Was an item added or removed? And maybe more important 
which item.

I found and used different approaches to solve this. I will show you some of them.

## Angular 19 - the right way
```typescript
import { linkedSignal } from '@angular/core';

const linkedValue = linkedSignal({
  source: sourceSignal,
  computation: (newValue, previousValue) => {
      if (previousValue.length > 2) {
          return previousValue;
      } else {
          return newValue;
      }
  },
});
```
Linked in the [official docs](https://angular.dev/guide/signals/linked-signal#accounting-for-previous-state) you can find all the 
details. It's very powerful and straight forward. The `computation` function gets two parameters. The first is the current value of the signal 
and the second is the previous value.

## Use rxjs
Pre Angular 19 this was my personal preference.
```typescript
toObservable(mySourceSignal).pipe(
    pairwise(),
    takeUntilDestroyed(this.destroyRef),
).subscribe({
    next: ([oldValue, newValue]) => {
        // do something with the old and new value
    },
});
```
With `toObservable` we are converting the source signal to an observable.  
Then we use `pairwise` to get the previous value. The `takeUntilDestroyed` is a helper function that will unsubscribe from the observable 
when the component is destroyed. This is important to avoid memory leaks.

## Use an outside variable to keep track of the previous value
This is theoretically possible. But you should almost always avoid mixing signals and plain values/variable. I don't like it at all and 
won't even bother you with an example.

## ngextension - extendedComputed
[ngextension/extendedComputed](https://ngxtension.netlify.app/utilities/signals/computed/) provides a funcion that has access to the 
previous value as a parameter. I never used it myself but I've seen other people using it.  
It maybe become deprecated in the future, now that Angular provides this out of the box itself.

