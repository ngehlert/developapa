---
title: "How to create an Angular Singleton Service"
date: "2022-11-09T23:59:08.123Z"
description: "And why `providedIn: 'root'` is not (always) the solution"
tags: ["Angular"]
duration: Snack
---
I started out with AngularJS where services always were singletons - this stuck with me for Angular even if this is not true there anymore. 
I quickly discovered the `providedIn: 'root'` flag and started using this one on every service. But even if it is mentioned as the first solution 
to make a service a singleton on top of the 
[Angular documentation](https://angular.io/guide/singleton-services#providing-a-singleton-service) this is actually is **not true**!  
This only works if your application is not using lazy loaded modules/routes.

- [What is a singleton](#what-is-a-singleton)
- [Problem with lazy loaded modules](#problem-with-lazy-loaded-modules)
- [How to fix](#how-to-fix)
  - [forRoot pattern](#forroot-pattern)
  - [Import in main module](#import-in-main-module)
- [Safety nets](#safety-nets)

## What is a singleton
Singleton is a pattern where exactly one instance of a class is available for the entire application. This is useful 
if you want to ensure that the entire application uses the same context, for example a data storage. 

## Problem with lazy loaded modules

> Unlike providers of the modules loaded at launch, providers of lazy-loaded modules are module-scoped.
>
> When the Angular router lazy-loads a module, it creates a new execution context. That context has its own injector, which is a direct child of the application injector.
>
> The router adds the lazy module's providers and the providers of its imported NgModules to this child injector.

Taken from the [Angular documentation](https://angular.io/guide/ngmodule-faq#why-is-a-service-provided-in-a-lazy-loaded-module-visible-only-to-that-module).
To put in other words. If you have a service, lets call it `ExampleService` that is being declared in our `ExampleModule`
```typescript
@NgModule({
  providers: [ExampleService]
})
class ExampleModule {}
```
If this module is loaded in your Main module and also loaded in a lazy loaded route, you will actually get two instances of 
`ExampleService` - even if it has the `providedIn: 'root'` flag.

For data storage/state management services this can be very problematic, you have two different components with different
kind of data sources.

## How to fix

### forRoot pattern
If you are using the Angular router you might already be familiar with the `forRoot()` pattern without maybe even noticing it.
The idea is that you initialize your module once with a static method called `forRoot()`. This initialization is actually defining the
service and now makes sure that the entire application is actually using the same instance. All other places can then just regularly
import the Module (without the service definition) - or sometimes this is also be done with a `forChild()` method.  
It looks something like this
```typescript
import {ModuleWithProviders, NgModule} from '@angular/core';
import {ExampleService} from './example.service';

@NgModule({
})
class ExampleModule {

    public static forRoot(): ModuleWithProviders<ExampleModule> {
        return {
            ngModule: ExampleModule,
            providers: [
                ExampleService,
            ],
        };
    }
}

export {ExampleModule};
```
and in your `main.module.ts`
```typescript
@NgModule({
  imports: [ExampleModule.forRoot()],
})
class MainModule {}
```

### Import in main module
This way is definitely possible as well - personally I would always prefer the `forRoot` approach. 
You can also move the `providers: [ExampleService]` definition to your main module, and you will have a single 
instance for your entire application as well. *(Instead of doing this on a service basis you can also import the entire module)*  
But you need to make sure that you are not importing / declaring it in another lazy loaded child module.

If you want to use this approach I recommend extracting the loaded service into a separate module and import this in the main module. 
Then it is easier to manage the dependencies of the service, and you are not accidentally providing other components or modules on a main module level.

## Safety nets
There are a couple of different possibilities here to make sure you are not accidentally creating multiple instances of 
your singleton service.  
For the `forRoot` pattern you can do something like this
```typescript
@NgModule({
})
class ExampleAppDataModule {
    private static isInitialized: boolean = false;

    constructor() {
        if (!ExampleAppDataModule.isInitialized) {
            throw new Error('call forRoot first');
        }
    }

    public static forRoot(): ModuleWithProviders<ExampleAppDataModule> {
        if (this.isInitialized) {
            throw new Error('do not call forRoot multiple times');
        }
        this.isInitialized = true;

        return {
            ngModule: ExampleAppDataModule,
            providers: [
                CommonsAppDataService,
            ],
        };
    }
}
```
With those two checks on the `isInitialized` flag we ensure that 
- `forRoot()` can only be called once
- `forRoot()` needs to be called before you can import the regular module. This guarantees that you always have the service initialized

For the service itself there is also a possibility to prevent multiple declarations in the `providers` section
```typescript
@Injectable({
  providedIn: 'root',
})
class ExampleService {
  constructor(@Optional() @SkipSelf() exampleService?: ExampleService) {
    if (exampleService) {
      throw new Error('ExampleService is already loaded');
    }
  }
}
```
Explanation for the two annotations taken again from the [Angular documentation](https://angular.io/guide/singleton-services#prevent-reimport-of-the-greetingmodule)  
> The injection would be circular if Angular looked for GreetingModule in the current injector, but the @SkipSelf() decorator means "look for GreetingModule in an ancestor injector, above me in the injector hierarchy."

and 
> By default, the injector throws an error when it can't find a requested provider. The @Optional() decorator means not finding the service is OK

This approach works also very well with the [Import in main module](#import-in-main-module) approach I mentioned earlier. It ensures that you actually do not accidentally load a specific module multiple times. 