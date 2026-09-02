---
title: 'Two years of signals: how did my predictions hold up?'
date: '2026-08-30T23:59:08.123Z'
description: "Checking the five signals predictions from 2024. Most of them landed, which is the boring part. The interesting one is the toSignal rule I expected to get flamed for, where I now agree and disagree with myself at the same time"
tags: ['TypeScript', 'Angular', 'signals']
duration: Lunch
slug: signals-predictions-revisited
---

In September 2024 I wrote [Why Angular signals](/blog/signals) and closed it with a section called "Conclusion and prediction for the future". I hedged pretty hard back then: "Take everything with a grain of salt and as a bold prediction ;)". Two years is enough distance to go back and check what actually happened, so let's walk through the five predictions one by one and see how badly I embarrassed myself.

One warning before we start. Most of them landed, and that is a lot less impressive than it sounds. They all pointed in the direction the Angular team had been communicating anyway. I just read the release notes early.  
The part I really want to talk about is the one rule from that article I expected to get flamed for, and where I now agree and disagree with my past self at the same time. That one is at the end.

- [Zoneless applications by default](#zoneless-applications-by-default)
- [RxJS becomes optional](#rxjs-becomes-optional)
- [People recreating RxJS in signals](#people-recreating-rxjs-in-signals)
- [A signal based HttpClient](#a-signal-based-httpclient)
- [zone.js sticking around](#zonejs-sticking-around)
- [The toSignal rule, revisited](#the-tosignal-rule-revisited)
- [Conclusion](#conclusion)

## Zoneless applications by default

> Looking into the near future there definitely are zoneless Angular applications by default.

"By default" was the boldest word in that entire paragraph, and it is the one that came true.  
Getting there took a couple of releases though, and we should separate two milestones that a lot of people mix up:

| Version | What happened |
| --- | --- |
| v18 | Zoneless arrives as `provideExperimentalZonelessChangeDetection()`, explicitly [experimental](https://v18.angular.dev/guide/experimental/zoneless) |
| v19 | SSR support and a migration schematic |
| v20 | Developer preview, the API drops its `Experimental` prefix |
| v20.2 | ["As of Angular v20.2, Zoneless Angular is now stable"](https://angular.dev/roadmap) |
| v21 | ["Zoneless is the default in Angular v21+ so you do not need to do anything to enable it."](https://angular.dev/guide/zoneless) |

The prediction only really came true with v21, because **stable and default are not the same thing**.

There is a detail here that I got wrong while drafting this post. I assumed a freshly generated project would now ship with `provideZonelessChangeDetection()` in its `app.config.ts`. It does not.  
The provider never became mandatory. It just became unnecessary, because zoneless is simply what the framework does now.

While we are in the neighbourhood, one bonus that was not part of the predictions. The old article said that every Angular application should strive to use `OnPush` as much as possible. In v22 `OnPush` is the default strategy and the old `Default` got renamed to `Eager`. I'll take it.

## RxJS becomes optional

> RxJS will become optional and you can have Angular applications without it. And instead of it being a default, people will opt in if they need it.

Also correct, but "optional" turned out to mean something narrower than what I had in mind: nobody actually removed anything.

The dependency list makes that distinction visible. `@angular/core` still declares `rxjs` as a peer dependency, and it is not one of the ones flagged as optional. So RxJS never became optional in the packaging sense, it comes along when you install Angular either way. What became optional is your own use of it, because the framework stopped pushing Observables into the places you cannot avoid. For me that is the more useful kind of optional.

For simple applications the prediction lands cleanly. A handful of routes, a form, some data fetched and rendered, and with signals, `resource` and the current template syntax you can build the whole thing without ever writing a single `pipe`. Static sites are the extreme version of this, because almost nothing in them happens over time.

As soon as complexity grows though, you pull RxJS back in fast. Anything where values arrive over time instead of once still wants a stream: typeahead search with debouncing and cancellation, websockets, polling, retry with backoff, drag interactions, or any case where several sources have to be combined and the order they fire in matters. You can rebuild all of that with an `effect` and a few writable signals, and you usually end up with more code that is harder to read and quietly wrong at the edges.

So yes, you can build an Angular application without RxJS today, and for a good number of applications that is a real option now instead of a thought experiment. But for most applications the real question is just when you reach for RxJS, and that is a much better place to be than the years where every HTTP call dragged a stream along whether you wanted one or not.

## People recreating RxJS in signals

> I'm pretty sure people will try to recreate things from RxJS in signals because they feel like signals are replacing everything else. […] And in the end we have applications that are build less reactively instead of more.

This is the one where I have to walk something back. The effect is real, but I wrote it as a general rule and it is not.  
It shows up in some areas and not in others.

Where it still hurts: an `effect` plus a `WritableSignal` rebuilding what a `switchMap` did in three lines, or a chain of computed signals doing debounce work by hand. If the honest answer to your problem was a stream, replacing it with signals gets you a worse version of that stream and a lot more code.

But there is a whole category I did not see coming, and I walked right into it myself in the [RestAngular post](/blog/restangular). Building request handling on top of `httpResource` and `withResource` is, if you squint a little, exactly the "recreating RxJS things in signals" I warned about. And it works out really well there, because the resource owns the request, the loading flag and the error state, so there is nothing left to wire up by hand.

The warning was fine. The scope was too wide. It should have said "people will do this in places where a stream was the right answer" instead of sounding like a blanket rule.

## A signal based HttpClient

> Maybe Angular will provide multiple implementations for their services that support both signals or Observables, e.g. a HttpClient that is able to work with signals instead of Observables.

That is [`httpResource`](https://angular.dev/api/common/http/httpResource), pretty much to the letter. It arrived in 19.2, next to [`resource`](https://angular.dev/guide/signals/resource) in 19.0 and `rxResource` for the cases where you already hold an Observable and just want the resource semantics around it.

I already wrote a [whole post](/blog/restangular) about actually using this, so I'll keep it short here. The more embarrassing part is that this blog does not use any of it. It still fetches posts through `HttpClient` and converts them with `toSignal`, which is a very convenient way to get to the last section.

## zone.js sticking around

> I really hope they maintain it for a very very long time keeping it as a backwards compatibility dependency (if your application needs it).

Two years later there is still no end date, and that is not for a lack of looking. I went through the API reference, the roadmap and the release notes, and there is nothing in any of them that points at an official end for zone.js. No deprecation, no removal entry, no date. And since Angular keeps a deprecated API available for at least one more major version, that clock has not even started ticking.

The [zoneless guide](https://angular.dev/guide/zoneless) also goes out of its way to keep the old world alive. Existing `NgZone` calls do not have to be removed for code to be compatible with zoneless applications, and pulling them out can even cause performance regressions for libraries that are still used by zone based applications.

The wish came true, just distributed differently than I pictured it. Back then I was thinking about big applications that need years to migrate, and that part is exactly what happened: nothing forces them off zone.js, and there is no date on the calendar telling them to hurry up. What I did not picture is the other end. For a new application you do not need it at all anymore, and in a small one like this blog it quietly turned into dead weight. The entry has been sitting untouched in the `package.json` since I moved off Gatsby, doing absolutely nothing, and I only noticed while researching this post ;)

## The toSignal rule, revisited

Now the interesting part. The same 2024 article had a best practice section, and one entry in it came with a disclaimer:

> Avoid using toSignal from RxJS interop
>
> This one will get me flamed and I've been going back an forth on this one. In the beginning I had this in my clear list of do's but first hear me out before you write an angry comment.

Two years later, the honest report is: nobody flamed me.  
The rule still holds at its core, but I made it way too absolute. The same article also said that every value in the template should be a signal, and the two entries look like a contradiction sitting next to each other. They are not, so let me be precise about what the rule was aiming at.

### Where the rule absolutely still applies

The version that actually causes damage is this one: two Observables converted into signals so they can be combined in a `computed`.

```ts
@Component({ /* ... */ })
export class UserListComponent {
    private userService = inject(UserService);
    private filterService = inject(FilterService);

    users = toSignal(this.userService.getUsers(), { initialValue: [] });
    filter = toSignal(this.filterService.filter$, { initialValue: '' });

    visibleUsers = computed(() =>
        this.users().filter((user) => user.name.includes(this.filter())),
    );
}
```

This is the third prediction again, wearing an interop helper as a disguise. Combining is stream work, and it moved into signal land where the tools for it do not exist. No debouncing, no cancellation, and once the filter should trigger a new request instead of filtering a local array, there is no `switchMap` to reach for. That is when an `effect` writing into a `WritableSignal` shows up and the flow turns imperative.

The same thing kept in the stream, converted once at the very end:

```ts
visibleUsers = toSignal(
    combineLatest([this.userService.getUsers(), this.filterService.filter$]).pipe(
        map(([users, filter]) => users.filter((user) => user.name.includes(filter))),
    ),
    { initialValue: [] },
);
```

Same result, but `toSignal` now sits where the reactive work is finished instead of in the middle of it.

### Where it does not apply at all

And here is where my past self was too strict, because a single conversion at the boundary is exactly what the helper is for. This blog does exactly that: an HTTP request runs through a `catchError` and lands in a `toSignal` the template reads. The original article even left room for it: "If you know what you are doing (or the stakes of your application are not that high) the `toSignal` might be fine to use." I just buried that sentence at the bottom.

The [RestAngular post](/blog/restangular) is the larger version of the same idea: once a store sits between the request and the template, that crossing is the design rather than a smell.

### So what is the rule now

The problem was never the rule, just how absolute I made it. "Avoid" should have been "know why you are doing it", and the difference fits in one sentence: **convert at the edge, not in the middle.** One `toSignal` after the reactive work is done is fine. A `toSignal` that exists so the combining can happen in a `computed` means you converted too early.

Which also means the template was never the right criterion. The async pipe is not deprecated and does exactly what it always did, so `users$ | async` and `toSignal` plus `users()` are both fine. What matters is whether anything reactive still has to happen after the conversion.

`resource` and `httpResource` avoid the question at the root, because they own the request instead of catching it through an interop helper. Which is a good moment to remember that this blog uses neither.

## Conclusion

The five predictions mostly landed, and I would not read too much into that. They were directional bets on a roadmap that was already public, and the only genuinely bold word in the whole paragraph was "by default".

The sentences that turned out to be worth revisiting were not the predictions at all. They were the sharply phrased rules, because a rule is only as good as the cases it excludes, and two years of actually using something is what tells you where those edges are.  

So let me turn the feedback question into a concrete one: have you seen the two-signals-into-a-`computed` pattern in the wild too, or is that just my sample? And if you have a case where a single `toSignal` at the edge was still the wrong call, I would really like to hear about it in the comments.
