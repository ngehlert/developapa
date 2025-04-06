---
title: 'Why Angular signals'
date: '2024-09-01T23:59:08.123Z'
description: "Let's talk about the 'why'. What is the big picture behind signals. And we wrap it up with some best practices"
tags: ['TypeScript', 'JavaScript', 'Angular', 'signals']
duration: Lunch
sticky: true
---

In this post I try to sum up my thoughts regarding the purpose of signals in Angular. I have the feeling currently it's
quite well covered **how** they work but from my experience talking to people there is a big knowledge gap if we try to understand
why they are actually useful and why they are a **necessity**. And a quick look how they compare against RxJS Observables.
I assume you are familiar with the basics of `signals`, `computed signals` and `effects`. You don't really have to understand
how they work in the background - I might cover this at a later point if needed.  
And last but not least, I try to share a set of best practices that helped me so far in all the projects where signals were
involved.

- [Change detection evolution](#change-detection-evolution)
- [Signals vs RxJS](#signals-vs-rxjs)
- [Conclusion and prediction for the future](#conclusion-and-prediction-for-the-future)
- [Best practices](#best-practices)
    - [Do](#do)
    - [Avoid](#avoid)

## Change detection evolution

Angular (and all other similar frameworks) are dependent on some sort of change detection. The template wants to know when a
value has changed in order to check if it needs to update the DOM.  
Regardless of the Angular version (and even for AngularJS) the change detection always worked through the component tree.  
It would start at the root component and works its way through all child components and their child components etc.  
AngularJS introduced basically a timer based change detection, meaning it would constantly run and check every expression
if there have been any changes. Angular already made a big leap forward by introducing `zone.js` as a backbone for an event-based
change detection. Events will be triggered on browser events, like mouse move, click, scroll, etc. But also things like promise
resolves.  
Angular introduced another very big improvement with `ChangeDetectionStrategy.OnPush`. This tries to limit the paths of the component
tree that need a change detection. If you mark a component with this change detection strategy, the change detection would only run if:

- An `@Input` binding value changed
- An event was emitted from within the view of the component
- The component manually called `markForCheck()` on the `ChangeDetectorRef`

Every current Angular application should strive to use `OnPush` always or at least as much as possible.

This is a great step forward coming from the "old" change detection days. But two big problems still remain

- The change detection would still work from the root component to the leaf/child components and for big applications this eventually will always be a problem.
- It's still dependent on `zone.js`

And that's exactly where signals come into play. In the current Angular version 18 we are still at the beginning / or maybe
half way through to where we want to be. The goal is to have a change detection that works locally, meaning I don't need to
traverse down the entire component tree but can just refresh a specific components (and it's children if needed). And the second
goal is to make `zone.js` obsolete and Angular can detect itself (via the logic of signals) whether something has changed or not.

In other words, signals feel like the natural succession in the change detection (and for that matter performance) evolution.

## Signals vs RxJS

To be honest, I don't really understand why everyone compares signals against RxJS. Sure, both deal with 'reactivity' but
in completely different scenarios / areas. There was an entire discussion if Angular internally could just use RxJS for their desired
goals instead of inventing a new primitive data type. Besides the dependency to an external library (after all we are just trying
to get rid of `zone.js`, so replacing it with another lib feels not right) there are valid technical reasons why this does not make sense, e.g.

- Observables can really be asynchronous, which makes it difficult to use for template rendering due to their pending state - you can feel some of those problems with async pipes
- They definitely can have side effects
- And the entire problem with cold observables which would require additional overhead to prevent redundant operations in case of multiple subscriptions.

But with signals RxJS as a library eventually becomes opt-in rather than being mandatory. For simple and straight forward event handling signals are a nice new tool.
For everything more complex that require Observable pipes RxJS is still the way to go.  
They complement each other for different use cases and should not be seen as rivals.

## Conclusion and prediction for the future

My conclusion just comes from my understanding of signals and the communication of the Angular team. I don't have any further insights into
roadmap topics or similar things. Take everything with a grain of salt and as a bold prediction ;)  
Looking into the near future there definitely are zoneless Angular applications by default. With an improved change detection that is based
on signals you don't need anything else.  
Looking a little bit further into the future RxJS will become optional and you can have Angular applications without it. And instead of it
being a default, people will opt in if they need it. Not necessarily a big fan of this, because I'm pretty sure people will try to
recreate things from RxJS in signals because they feel like signals are replacing everything else. Creating pipes like `map`, `filter`,
`switchMap`, etc. are way more complex to do in signals because they are not build to cover streaming data manipulations.
And in the end we have applications that are build less reactively instead of more.  
Maybe Angular will provide multiple implementations for their services that support both signals or Observables, e.g. a HttpClient that
is able to work with signals instead of Observables.  
And regarding `zone.js`… I really hope they maintain it for a **very very long time** keeping it as a backwards compatibility
dependency (if your application needs it). Migrating entire enterprise applications to fully work with signals to a point where `zone.js`
can be dropped will take a while.

## Best practices

The following rules are **not** the result of year-long studies or surveys of 1.000 Angular devs. I worked on couple of projects where
signals have been involved and those rules have shown that they help preventing certain bugs or unintended side effects and help improving the
readability of the code.

### Do

All the recommendations are in the category 'always try to do this'.

#### Use input and output signals

Replace all `@Input` and `@Output` for components with their new respective counterparts `input()` and `output()`. This does not introduce any
breaking changes to places that use your component. You only need to adapt the usages internally to call the property to get the value.

#### Every value in the template should be a signal

This is one of the basics. Every value that is being rendered in your template should come from a Signal, not a public
class variable anymore.

#### Use model api for two way binding

Use the new `model` api instead of declaring both `@Input() myValue` and `@Output() myValueChange` in the traditional Angular way.  
Two way bindings should still be use with caution as a heavy use can make your code hard to follow. For certain components,
like form inputs, date pickers, etc. they can be useful.

#### Use effect instead of OnChanges

If you followed the previous advice and use signals for your input bindings, there is no need for `OnChanges` lifecycle function anymore. Instead use `effect()`

#### Define signal dependencies first

With better dev tools and proper view for your signal dependencies, I think declaring all signal dependencies for your effects and computed
signals first as variables makes sense. Otherwise, you'll end up with dynamically changing dependency graphs and they can be
very confusing to debug.  
Instead of doing this

```typescript
const computedSignal = computed(() => {
    if (firstSignal() > 5) {
        return true;
    }

    return otherSignal();
});
```

I'd much rather do this

```typescript
const computedSignal = computed(() => {
    const firstValue = firstSignal();
    const otherValue = otherSignal();
    if (firstValue > 5) {
        return true;
    }

    return otherValue;
});
```

#### Break complex computed signals / effects into smaller ones

This is not necessarily specific for signals and is a very general programming rule. Still, I've seen some very complex computed
signals. I think it's worth mentioning again.  
My rule of thumb for signals in this case is, if you have more than 3 dependencies you need to split it up into smaller ones.

### Avoid

All suggestions in this category are phrased as avoid instead of don't or never do this. For each rule there might be a specific
edge case where it still makes sense to break the rule.

#### Avoid heavy effect usage

Couple of lines above I made a suggestion to use `effect` instead of `OnChanges` and that's definitely a good thing. However,
use `effect` in general with caution. A **heavy** usage might indicate a problem with your general data flow and can be a code smell.
It's also very hard to debug and track what's going on in your application.

#### Avoid using class properties in computed signals / effects

Don't use class properties with primitive values in your function body for computed signals or effects. Only use other signal values.  
Quick code example

```typescript
const toggleSignalValue = true;
const signalOne = signal(1);
const signalTwo = signal(2);

const computedSignal = computed(() => {
    return toggleSignalValue ? signalOne : signalTwo;
});
```

Changing the value of the `toggleSignalValue` here is not resulting in a change of the value of the computed signal. It will display the value
of `signalOne` until `toggleSignalValue` is set to false **and** a new value for `signalOne` has been pushed.  
(The [Define signal dependencies first](#define-signal-dependencies-first) kind of improves this problem to a certain degree, but there
are still cases where it is not enough)

#### Avoid using WritableSignal as function parameter

This one goes without saying. A function should not modify a parameter that has been passed into. And this is true for signals
as well. We can safeguard against this by using the type `Signal` instead of `WritableSignal` for our parameters.

```typescript
function myCalculation(value: Signal): void {
    // value can't be changed here
}
```

This will just make sure that we don't accidentally call the `set` or `update` method of the signal in our function, but theoretically
they are still there if you pass a `WritableSignal` value.  
If you want to double down and make sure from the outside that a function is not tampering with your signals (this can be
useful for library usages) you can call `.asReadonly()` on any `WritableSignal` and converting it to a `Signal` type that is readonly.

```typescript
const myValue: WritableSignal<boolean> = signal(false);
const readonlyValue: Signal<boolean> = myValue.asReadonly();
```

#### Avoid using toObservable from RxJS interop

Let's look at this quick code snippet

```typescript
const subject = new BehaviorSubject(0);
const signalValue = signal(0);
const signalAsObservable = toObservable(signalValue);

subject.subscribe((e) => console.log(`Subject emits: ${e}`));
signalAsObservable.subscribe((e) => console.log(`Observable emits: ${e}`));

function updateSubject() {
    subject.next(subject.value + 1);
    subject.next(subject.value + 1);
    subject.next(subject.value + 1);
    subject.next(subject.value + 1);
}

function updateSignalObservable() {
    signalValue.update((value) => value + 1);
    signalValue.update((value) => value + 1);
    signalValue.update((value) => value + 1);
    signalValue.update((value) => value + 1);
}
```

You'd assume that both subscriptions, in this case the console.logs, are being called the same amount. But the `toObservable` is
using an `effect` under the hood to keep track of the value and the dependency. If you run this code snippet you'll see that for the
observable that is depending on the Signal value the console.log is just called once.  
In most cases the conversion this way around is not needed. If you need a signal value you can directly use it in a pipe instead
of creating a RxJS listener for the value.  
If the listener for the value is really needed - have not had this happen yet - I still would manually create the `effect` and update
my own Subject that then is used in my Observable. This way it's actually more clear what is happening and way easier to spot
those nasty bugs if you wonder why your observable is not called the 'right' amount of times.

#### Avoid using toSignal from RxJS interop

This one will get me flamed and I've been going back an forth on this one. In the beginning I had this in my clear list of do's but first hear me
out before you write an angry comment.  
Internally the `toSignal` method directly subscribes to the observable to update the Signal value. This subscription happens directly
when you call the `toSignal` method. And this already is a problem for every cold observable, e.g. HttpRequests. The request happens
immediately, and you are no longer in control of it (e.g. canceling / unsubscribing it).  
The better approach would be, to manually subscribe and update a signal value. This way you better can keep track of the
subscription and the destroying of it. Also this allows you to keep track of the completed state which is gone for the `toSignal` version.

For me this isn't a hard `don't do this ever` but rather a leaning in one direction. If you know what you are doing (or the stakes
of your application are not that high) the `toSignal` might be fine to use.
