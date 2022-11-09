---
title: "TypeScript decorator to log method durations"
date: "2022-10-03T13:49:08.123Z"
description: "Quick snipped to log duration of methods in TypeScript with zero effort"
tags: ["TypeScript", "Snippet"]
duration: Snack
---

Recently I wrote an article about [Log Request times with an Angular Interceptor](/angular-trace-request-time). And I'm 
still in the performance optimizing mindset ;)  
The snippet below allows you to add a TypeScript decorator to any class methods to log the duration of the method in the console.  
This can be very helpful if you try to narrow down performance problems in your application.

**(I know this is possible with browser tools like performance recorder as well - sometimes this is just easier to use and requires less overhead)**

You can find a [StackBlitz example here](https://stackblitz.com/edit/typescript-5ra22l?file=index.ts) (Make sure to open the 
browser console because the StackBlitz console is not showing `console.time` logs)

### Snippet
```typescript
function measureTime() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original: (...args: Array<unknown>) => unknown = descriptor.value;

    const timeLabel: string = `${target.constructor.name}.${propertyKey}`;
    descriptor.value = function (...args: Array<unknown>) {
      console.time(timeLabel);
      const value: unknown = original.apply(this, args);
      console.timeEnd(timeLabel);

      return value;
    };
  };
}
```

### Usage
```typescript
class MyClass {
  
  @measureTime()
  public run(): void {
    let current: number = 0;
    for (let i = 0; i < 100_000; i++) {
      current = i;
    }
  }
}

new MyClass().run();
```

## How does it work
Decorators allow you to attach functions to classes, methods, accessor properties or parameters 
([See TS docs for more information](https://www.typescriptlang.org/docs/handbook/decorators.html)).  
In our case we are getting the original method via the `descriptor.value` property.  
And then we just replace the method with our own, that logs the duration it takes to evaluate the original method and then return 
the result of the original method (to keep the functionality the same).

If you play around with the for loop in the example and increase the duration you can see in the console the different 
calculation times.

If you are interested in more Decorators possibilities just let me know.
