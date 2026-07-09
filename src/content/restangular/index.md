---
title: "I'm bringing back RestAngular"
date: '2026-07-09T23:59:08.123Z'
description: 'A new / old way to deal with CRUD operations for REST Apis with Angular'
tags: ['TypeScript', 'Angular', 'signals', 'Tutorial']
duration: Dinner
---

Let's take a trip back to roughly 2013. AngularJS was the hottest thing on the
block, we all had strong opinions about `$scope`, and there was this little
library called [Restangular](https://github.com/mgonto/restangular) that made
talking to REST APIs feel like magic.

If you never used it, here's the pitch: you fetched a list of things, and the
things came back *enriched*. Every object carried its own CRUD methods:

```js
// AngularJS, once upon a time
Restangular.all('players').getList().then(function (players) {
  var alice = players[0];

  alice.score += 3;
  alice.put();      // saves alice
  alice.remove();   // deletes alice
});
```

No services to write, no URLs to concatenate, no boilerplate. The object *was*
the API. For a whole lot of everyday CRUD apps, this was genuinely great - you
stopped thinking about HTTP and started thinking about your domain.

And then Angular 2 happened, and the pattern quietly died.

- [Why it died (and why that was fair)](#why-it-died-and-why-that-was-fair)
- [The accidental rediscovery](#the-accidental-rediscovery)
- [Let's build it: players for a board game](#lets-build-it-players-for-a-board-game)
- [The one crucial difference](#the-one-crucial-difference)
- [Let's see this in action](#lets-see-this-in-action)
- [Should this be a library?](#should-this-be-a-library)

## Why it died (and why that was fair)

RestAngular's magic depended on something AngularJS was uniquely comfortable
with: **long-lived mutable objects**. Dirty checking didn't care *how* your
object changed, so an object that mutated itself and PUT itself to a server
was a perfectly good citizen.

Modern Angular is built on the opposite contract. `OnPush`, immutable updates,
and now signals - state changes by **replacement**, not mutation. An object
that carries its own `.put()` method breaks down immediately:

- the first `{ ...player }` spread silently drops the methods,
- a method that closes over the object points at a *stale snapshot* after the
  first update,
- and dev-mode state freezing throws the moment anything mutates itself.

So the ecosystem moved the methods off the data and into services and stores.
Correct, robust - and, let's be honest, a little less fun.

## The accidental rediscovery

Recently I was working through an [NgRx SignalStore](https://ngrx.io/guide/signals/signal-store)
lab and stumbled over a detail in the (experimental) `withResource` feature
from the [ngrx-toolkit](https://github.com/angular-architects/ngrx-toolkit):
when you register a *named* resource, its value doesn't just sit there as a
read-only signal - **it becomes regular store state that you can `patchState`**.

Loaded from the server, but locally writable…

That's when it clicked: I can't put methods *on* the data anymore - but I can
put them on a **handle around** the data. Same ergonomics, signal-compatible
mechanics. RestAngular is back, baby. Almost.

## Let's build it: players for a board game

Say we're building a companion app for board game nights. There's a backend
with a `/players` endpoint, and a player looks like this:

```ts
export interface Player {
  id: number;
  name: string;
  color: string;
  score: number;
}
```

A slim client using Angular's `httpResource` for reading and plain
`HttpClient` for writing:

```ts
@Injectable({ providedIn: 'root' })
export class PlayerClient {
  private http = inject(HttpClient);
  private baseUrl = '/api/players';

  findPlayersResource() {
    return httpResource<Player[]>(() => this.baseUrl, { defaultValue: [] });
  }

  create(player: Omit<Player, 'id'>): Observable<Player> {
    return this.http.post<Player>(this.baseUrl, player);
  }

  update(player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.baseUrl}/${player.id}`, player);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

Now the store. The named resource `players` gives us `playersValue`,
`playersIsLoading`, `playersError` - and, crucially, `playersValue` is
patchable state:

```ts
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
} from '@ngrx/signals';
// withResource is the experimental one from the ngrx-toolkit,
// not to be confused with @ngrx/signals itself
import { withResource } from '@angular-architects/ngrx-toolkit';
import { firstValueFrom } from 'rxjs';

import { Player } from './player';
import { PlayerClient } from './player-client';

export const PlayerStore = signalStore(
  { providedIn: 'root' },

  withProps(() => ({
    _client: inject(PlayerClient),
  })),

  withResource(
    (store) => ({
      players: store._client.findPlayersResource(),
    }),
    // on error, keep the last good list instead of undefined
    { errorHandling: 'previous value' },
  ),

  // ...and here comes the time machine 👇
);
```

By the way: notice what's *not* here. There's no `getPlayers()` method on the
client and no `loadPlayers()` on the store to fill it. The resource **is** the
loader - it fires the request when the store comes to life and delivers the
result straight into `playersValue` (plus `playersIsLoading` and
`playersError`, free of charge). Need a refresh after game night gets messy?
`withResource` also generates a `_playersReload()` method for exactly that.
If you catch yourself writing an imperative fetch-then-patch method right
next to a resource, one of the two is about to be redundant.

## The handle

Here's the whole trick. A *handle* wraps a player id - never the player data
itself - and combines a reactive view with entity-scoped operations:

```ts
withMethods((store) => {
  function playerHandle(id: number) {
    const value = computed(() =>
      store.playersValue().find((p) => p.id === id),
    );

    const update = (changes: Partial<Player>): void => {
      patchState(store, (state) => ({
        playersValue: state.playersValue.map((p) =>
          p.id === id ? { ...p, ...changes } : p,
        ),
      }));
    };

    const save = async (): Promise<void> => {
      const player = value();
      if (!player) return;
      const saved = await firstValueFrom(store._client.update(player));
      patchState(store, (state) => ({
        playersValue: state.playersValue.map((p) => (p.id === id ? saved : p)),
      }));
    };

    const remove = async (): Promise<void> => {
      await firstValueFrom(store._client.delete(id));
      patchState(store, (state) => ({
        playersValue: state.playersValue.filter((p) => p.id !== id),
      }));
    };

    return { value, update, save, remove };
  }

  return {
    player: playerHandle,

    async createPlayer(draft: Omit<Player, 'id'>) {
      const saved = await firstValueFrom(store._client.create(draft));
      patchState(store, (state) => ({
        playersValue: [...state.playersValue, saved],
      }));
      return playerHandle(saved.id);
    },
  };
}),
```

And now, with everything setup we can use it like this:

```ts
const store = inject(PlayerStore);

// game night begins
const alice = await store.createPlayer({
  name: 'Alice',
  color: 'teal',
  score: 0,
});

// Alice builds a settlement
alice.update({ score: alice.value()!.score + 2 });
await alice.save();

// Bob flips the table and leaves
const bob = store.player(2);
await bob.remove();
```

That's RestAngular ergonomics, thirteen years later, on top of signals.

## The one crucial difference

RestAngular enriched **the data**. The handle enriches **a reference to the
data**: it holds only an `id` and a `computed`. That's exactly why it works in
the signals world where the original pattern can't:

- `alice.value()` re-reads the store on every call, so the handle survives any
  number of immutable state replacements - it *cannot* go stale,
- all writes go through `patchState`, so immutability, `OnPush`, and the Redux
  DevTools timeline keep working (you actually see one tidy state transition
  per handle operation - try explaining *that* to your 2013 self),
- the data stays plain, serializable, and boring. The fun lives in the handle.

There's one asymmetry the old library had too, just hidden: **create can't be
a handle method**. Before the server responds there is no id, so there's
nothing to wrap. That's why `createPlayer` lives on the store - and returning
a fresh handle for the created player closes the loop nicely.

## Let's see this in action
You can find a running example at this [Stackblitz](https://stackblitz.com/edit/stackblitz-starters-nlbnexhi?file=src%2Fplayer-demo.ts).  
I don't have a /players endpoint and just mocked it with an interceptor. But you can also use this with local storages that are stored in a service 
or even on top of your existing Observable Service with `rxResource`.

## Should this be a library?

I know what you're thinking, and I thought it too - for about an hour. Then I
looked at the graveyard: ngx-restangular (last release many moons ago),
angular-restmod (archived), @ngrx/data (maintenance mode). This niche eats
libraries for breakfast.

The honest truth: the handle is ~40 lines, and most of those lines encode
*your* app's decisions - pessimistic vs. optimistic saves, what `save` sends,
how reloads interact with local edits. As a dependency it would be all
configuration; as a pattern it's a coffee break to implement.

So no, (unfortunately?) I'm not *shipping* RestAngular back. I'm bringing back the part worth
keeping: the feeling that your objects - fine, your *handles* - know how to
take care of themselves.

Let me know what you think :)
