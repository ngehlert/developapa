---
title: "A simple Angular state management system"
date: "2023-02-09T17:19:08.123Z"
description: "Sometimes you don't need one of the big libraries. I want to show you how you can build a very simple state 
management system by yourself with just a few lines of code"
tags: ["Angular", "Architecture", "Tutorial"]
duration: Lunch
---

State management is an interesting topic. You probably need it to some extend in most applications but the solutions
to implement are endless. From a very basic public static variable to complex ngrx setups there is everything out there.  
Very common libraries are for example:

- [ngrx](https://ngrx.io/): probably the most sophisticated and feature rich solution
- [Elf](https://ngneat.github.io/elf/): from the awesome guys who already did stuff like [spectator](https://github.com/ngneat/spectator), [until-destroy](https://github.com/ngneat/until-destroy) or [transloco](https://github.com/ngneat/transloco)
- [Akita](https://opensource.salesforce.com/akita/)
- [@rx-angular/state](https://www.rx-angular.io/docs/state): very lightweight in comparison to the others

Don't get me wrong, all those libraries are awesome and definitely have their place. I used most of them at some point in time.
However, sometimes they just feel too big with too much overhead.

In this post I will show you how you can implement a very basic state management system by yourself (and that you don't always
need a library).

- [Basic store setup](#basic-store-setup)
- [Store implementation](#store-implementation)
- [Use a store](#use-a-store)
- [Example and what comes next](#example-and-what-comes-next)

## Basic store setup

```typescript
import { BehaviorSubject, Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

export abstract class DataService<T> {
    protected subject: BehaviorSubject<T>;
    protected data: Observable<T>;

    protected constructor(initialValue: T) {
        this.subject = new BehaviorSubject<T>(initialValue);
        this.data = this.subject.pipe(scan((acc: T, curr: T) => ({ ...acc, ...curr }), initialValue));
    }

    public getData(): Observable<T> {
        return this.data;
    }

    public setData(data: T): void {
        this.subject.next(data);
    }
}
```

At the very core we have a `BehaviorSubject` because we want to have an initial value and we are only interested in the
latest value that will be stored in the state.  
And the second thing is our `Observable` that uses the [scan operator](https://www.learnrxjs.io/learn-rxjs/operators/transformation/scan)
in order to aggregate new values together with our previous value.

## Store implementation

Now we can just create a service that extends our abstract class. We only need to define the initial value and the interface
that defines the structure of the data that should be stored.

```typescript
@Injectable()
export class ApplicationDataService extends DataService<IAppData> {
    constructor() {
        // define your default values here
        super({ hasChildren: true });
    }
}

interface IAppData {
    timezone?: string;
    mood?: string;
    hasChildren?: boolean;
}
```

You can create as many services as you need. It probably makes sense to create separate services for different parts of the application.

## Use a store

We now can inject our service in the component we need and use the `getData` and `setData` methods to have access to our data.  
The intersting part here is that you don't need to update the entire object in your store. You can just update single values
that you need.  
And since we are dealing with observables here a little knowledge of rxjs is very handy here if you are only interested in a
specific property and not the entire data object.

```typescript
@Component({
    selector: 'my-component',
    template: '{{(myData | async)?.mood}}',
    providers: [ApplicationDataService],
})
class MyComponent {
    public myData: IAppData;
    constructor(private dataService: ApplicationDataService) {
        this.myData = this.dataService.getData();

        this.dataService.setData({
            mood: 'happy',
            timezone: 'europe',
        });
    }
}
```

## Example and what comes next

You can check all this in action in this [stackblitz](https://stackblitz.com/edit/angular-uox84m?file=src%2Fmain.ts).
This is just a very basic and simple data store that allows you to add and get data from your own data service. And it's very easy to extend
from this point on. for example you can add a `clear`/`reset` method to the `DataService` if you have a longer living service that is not
tied to a specific component. This could look something like

```typescript
public clear(): void {
    const data: T = this.subject.getValue();
    for (var member in data) {
        data[member] = undefined;
    }
    this.setData(data);
}
```

You can even add stuff to only modify single entries instead of entire objects or modify existing stores instead of just always updating
the entire thing. But at a certain point it might be easier to just use a library if your setup requires a complex state management ;)
