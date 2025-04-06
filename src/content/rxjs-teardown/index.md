---
title: 'Custom onDestroy / teardown rxjs pipe'
date: '2024-04-02T23:59:08.123Z'
description: 'A quick introduction into rxjs custom pipes with an example of a custom teardown pipe'
tags: ['TypeScript', 'JavaScript', 'Snippet', 'rxjs']
duration: Snack
---

In this post I want to give you a short introduction how you can write and use your custom rxjs pipe. And to demonstrate
this best we will write an onDestroy / teardown pipe. With this pipe, you can attach a callback to an observable, that gets
called if the observable completes or is unsubscribed.

You can find a [StackBlitz example here](https://stackblitz.com/edit/rxjs-destroy-pipe?file=src%2Fmain.ts)

### The code

```typescript
import { Observable, Subscriber, Subscription, timer } from 'rxjs';

function onDestroy(callback: () => void) {
    return function <T>(source: Observable<T>): Observable<T> {
        return new Observable((subscriber: Subscriber<T>) => {
            const subscription = source.subscribe({
                next(value: any) {
                    subscriber.next(value);
                },
                error(error: Error) {
                    subscriber.error(error);
                },
                complete() {
                    subscriber.complete();
                },
            });

            return () => {
                callback();
                subscription.unsubscribe();
            };
        });
    };
}
```

## How does a pipe work

A custom pipe may sound intimidating, but it actually is just a function that gets an observable as input and needs to return
an observable. In a very minimal version this looks like this

```typescript
function firstCustomPipe<T>(input: Observable<T>) {
    return input;
}
```

The `.pipe()` operator is looping over all provided pipe functions and each function gets invoked with the result from the previous
one.  
In terms of logic we now can extend our basic example from before and create a new Observable to have full control over it.

Last but not least, we need to understand what unsubscribing from an Observable is doing. It's **not** unsubscribing all pipes,
but just **the last one**. It's the responsibility of each pipe to `unsubscribe` the parent Observable. The new Observable needs to return
a function that gets called upon unsubscribing/completing, e.g. `return () => subscription.unsubscribe();`

## Our teardown pipe

Lets quickly look at the code from above. We create a new function `function onDestroy(callback: () => void) {}` and the callback
parameter is the one we want to call, as soon as the observable is unsubscribed.  
To match the expected input for the pipe interface we return a function `return function <T>(source: Observable<T>): Observable<T> {}`
that gets an Observable as input and returns an Observable (in our case from the same type).  
Inside our pipe function we create a `new Observable` object. Inside this Observable we link everything from our new Observable
to the parent source to avoid any modification to the data in the observable.  
And finally to achieve what we want to do in the first place, we are returning the previously mentioned function that gets
called on unsubscribing, but we extend it with our provided `callback` parameter.

Using this pipe looks just like using any other pipe, e.g.

```typescript
timer(0, 1000)
    .pipe(
        map(() => {}), // just an example, you can put any operator before or afterwards
        onDestroy(() => {
            console.log('My custom on destroy logic');
        }),
    )
    .subscribe();
```

## When is this useful

Honestly, just in very specific cases. Most of the time, if you manually `subscribe` and `unsusbscribe` from Observables you can
just add your teardown logic in the same place.  
However, this gets really handy if you create Observables and pass them on to different parts of the code, e.g. services or
view components. With this approach you can still control if something needs to happen on unsubscribing, for example clearing
a storage.
