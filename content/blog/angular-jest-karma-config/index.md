---
title: "Angular provide a global Module for testing"
date: "2022-10-08T08:49:08.123Z"
description: "Quick snipped to add a global module for your testing environment"
tags: ["Angular", "Snippet"]
duration: Snack
---

Sometimes you just need some configuration or module that is loaded for all your Angular test. In my case this was an 
injection token I wanted to set for all tests (because they were using a library). But this works just as well for any 
module, service, etc. you might want to add to all tests - e.g. global mock for backend services, http clients, etc.

Here are the snippets for Jest and Karma how to add such a module / configuration.

## Jest

In your `jest.setup.ts/js`
```javascript
import 'jest-preset-angular';
defineGlobalsInjections({
    imports: [
      YourTestingModule,
    ],
    providers: [
        {provide: YOUR_TOKEN, useValue: 'yourValue'},
    ],
});

```

## Karma
In your `test.ts/js` where you call your setup with `initTestEnvironment`
```typescript

@NgModule({
    imports: [
      YourTestingModule,
    ],
    providers: [
        {provide: YOUR_TOKEN, useValue: 'yourValue'},
    ],
})
class GlobalTestingSetupModule {}

TestBed.resetTestEnvironment();
TestBed.initTestEnvironment(
    [
        BrowserDynamicTestingModule,
        GlobalTestingSetupModule,
    ],
    platformBrowserDynamicTesting(),
    {},
);
```