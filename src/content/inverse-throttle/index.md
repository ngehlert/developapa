---
title: 'RxJS inverse throttle operator'
date: '2026-01-10T13:17:08.123Z'
description: 'Or how to emit multiple Observable values from a single source observable emit.'
tags: ['TypeScript', 'rxjs', 'Snippet']
duration: Snack
---

The RxJS `throttle` operator is commonly used to limit the rate at which values are emitted from an observable.  
But let's switch this and emit multiple values with a given rate for on source observable emission.

The first question you might ask yourself is: "Why would I want to do that?" In my case, I wanted to simulate live data.
In regular intervals, poll new data from an HTTP endpoint but to bridge the gap between two polls, I wanted to emit intermediate values to give 
the user the impression of live data.

Two reasons why I want to share my implementation. Maybe you have a better way to do this. And secondly, it was just one of those cases where I
realized how much I like RxJS and how powerful a stream of data is with awesome operators.

As always you can find the example to play around with on [StackBlitz](https://stackblitz.com/edit/inverse-throttle?file=src%2Fmain.ts).

## Snippet

```typescript
import {Observable, delay, of, repeat, Subscriber, startWith, pairwise, filter, switchMap, concatMap, from, tap} from 'rxjs';
class App {
  private currentValue = 1;

  private intervalInMs = 1_000;
  private steps = 10;
  private stepDelay = Math.trunc((this.intervalInMs * 1.1) / this.steps);

  public observableValue: Observable<number> = this.getHttpData().pipe(
    repeat({ delay: this.intervalInMs }),
    tap((value) => console.log('request value', value)),
    startWith(0),
    pairwise(),
    switchMap(
      ([previousValue, currentValue]: [number, number]): Observable<number> => {
        return from(Array.from({ length: this.steps }, (_, i) => i)).pipe(
          concatMap((index): Observable<number> => {
            const newValue = Math.trunc(
              getCalculatedStepValue(
                previousValue,
                currentValue,
                this.steps,
                index + 1
              )
            );

            return index === 0
              ? of(newValue)
              : of(newValue).pipe(delay(this.stepDelay));
          })
        );
      }
    ),
    tap((value) => console.log('new emitted value', value))
  );

  private getHttpData(): Observable<number> {
    return new Observable((observer: Subscriber<number>) => {
      const bufferToUpperLimit = 100;
      const newValue = randomIntFromInterval(
        this.currentValue,
        this.currentValue + bufferToUpperLimit
      );
      this.currentValue = newValue;
      observer.next(newValue);
      observer.complete();
    }).pipe(delay(randomIntFromInterval(100, 300)));
  }
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getCalculatedStepValue(
  previousValue: number,
  currentValue: number,
  totalSteps: number,
  currentStep: number
): number {
  if (totalSteps <= 0) {
    throw new Error('Steps must be greater than 0');
  }

  if (totalSteps === 1) {
    return currentValue;
  }

  return (
    ((currentValue - previousValue) / totalSteps) * currentStep + previousValue
  );
}
```

## Explanation

Let's break down what's happening here.  
The `getHttpData()` and `randomIntFromInterval()` functions are just mock implementations to simulate HTTP request logic. 
In a real-world scenario, you would replace `getHttpData()` with a HTTP request or some other data observable input.

The magic happens in the `observableValue` pipe chain:

- **`repeat({ delay: this.intervalInMs })`** - Polls the data source at regular intervals (every second in this case). In production you might also want to add a timeout in case one request is stuck.
- **`startWith(0)`** - Kicks things off with an initial value so `pairwise` has something to work with. In most cases you probably do not want to start with 0, then you can start with null and treat the first resolved value as starting value
- **`pairwise()`** - Bundles each new value with its predecessor, giving us both the previous and current values
- **`switchMap()`** - The heart of the operation: takes our value pair and transforms it into multiple emissions. Needs to be a switchMap here to cancel any previous potentially still ongoing event emission if there is a new event from the source observable
- **`from(Array.from(...))`** - Creates an array of step indices and turns it into an observable stream
- **`concatMap()`** - Processes each step sequentially, calculating intermediate values between the previous and current value
- **`delay()`** - Spaces out the emissions so they arrive smoothly over time. The first one we want to emit immediately

The `getCalculatedStepValue()` function handles the linear distribution between two values.  
In this case for counting up numbers. But the same principle works with any data, even classes or complex objects. This would be the part to adapt the value for each emission.

And that's it! You now have an observable that emits multiple intermediate values between each source emission, creating a smooth transition effect.

## Alternatives

I know, I know, there are other ways to do this. Most straight forward potentially would be using `setInterval`. 
For pure numeric values I've also implemented a count up based on `requestAnimationFrame` which gives a very smooth result and depends on the browser animation calculation. 
In my case now this was not sufficient, as I needed to pass the emitted (complex object) values from the observable 
to a 3rd party charting library which I don't have control over. And previously I would have static data/static chart, and just adding
a couple of pipes suddenly converts it to a dynamic chart that looks like real time data.

Happy to hear if you find this useful, or if this can even be more simplified. How would you implement something similar?  
Maybe there is a neat way to do this now with signals?…
