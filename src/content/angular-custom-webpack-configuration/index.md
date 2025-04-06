---
title: 'Use a custom webpack configuration in your angular.json configuration file'
date: '2021-05-30T14:19:08.123Z'
description: 'And how to do AngularJs dependency injection annotations in such a setup properly'
tags: ['Angular', 'Tutorial']
duration: Lunch
sticky: true
---

There are still a couple of brave warriors (me included) out there wo work in Angular Hybrid Applications (AngularJs in the same application
with Angular). First of all shout out to all of you!  
For historical reasons a lot of those projects use webpack as their build system (or maybe even gulp/grunt/etc.), but I found myself
in the position to switch to the `angular-cli`.  
In this post I want to show how you can use a custom webpack configuration along to the regular `angular.json` configuration, so you can
migrate your possible custom steps already (that may not be covered by the regular `angular.json` configuration).
Secondly, I want to quickly show how I handled [AngularJs dependency injection annotations](https://docs.angularjs.org/guide/di),
because I had a lot of struggle with that in particular.

- [Requirements](#requirements)
- [Get the base setup running](#get-the-base-setup-running)
- [Custom webpack configuration](#custom-webpack-configuration)
- [Annotate AngularJs](#annotate-angularjs)
- [Conclusion](#conclusion)

## Requirements

- A basic understanding of how the `angular-cli` works and how the angular.json looks like
- A basic understand of webpack
- An angular project that should use the `angular-cli` (does not have to be a AngularJs Hybrid Application, also works fine for all straight
  Angular Apps)

## Get the base setup running

First of all we need to install the angular-builder with  
`npm install @angular-builders/custom-webpack --save-dev`.  
Now go into your angular.json and replace the builder in your build section (projects.YOUR_PROJECT.architect.build)  
`"builder": "@angular-devkit/build-angular:browser",` with  
`"builder": "@angular-builders/custom-webpack:browser",`.  
You can do (depending on your setup you need to) the same thing for all the other steps as well

- serve: `"builder": "@angular-devkit/build-angular:dev-server",` becomes `"builder": "@angular-builders/custom-webpack:dev-server",`
- extract-i18n (for localization): `"builder": "@angular-devkit/build-angular:extract-i18n",` becomes `"builder": "@angular-builders/custom-webpack:extract-i18n",`
- tests: `"builder": "@angular-devkit/build-angular:karma",` becomes `"builder": "@angular-builders/custom-webpack:karma",`

If your project worked previously with the `angular-cli` it now should still work. In the next section we cover how to setup a proper
custom webpack configuration

## Custom webpack configuration

Inside your step section in the `angular.json` where you just adapted the builder, there is an options object that now supports a property
called `customWebpackConfig`. Create a file `extra-webpack.config.ts` (works with JS files as well), and add the path to your configuration.
This could look something like this:

```json
"architect": {
    "build": {
        "builder": "@angular-builders/custom-webpack:browser",
        "options": {
            "customWebpackConfig": {
                "path": "./extra-webpack.config.ts"
            },

    // rest of the configuration
```

The base setup of the `extra-webpack.config.ts` looks like this

```typescript
import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';

export default (config: webpack.Configuration, options: CustomWebpackBrowserSchema, targetOptions: TargetOptions) => {
    // do your config modifications here

    return config;
};
```

For example if you want to provide a custom rule to the webpack configuration with a separate loader it can look something like this

```typescript
import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';

export default (config: webpack.Configuration, options: CustomWebpackBrowserSchema, targetOptions: TargetOptions) => {
    if (config.module && config.module.rules) {
        config.module.rules.push({
            test: /\.gif$/,
            loader: 'your-custom-loader',
            options: {
                yourOption: false,
            },
        });
    }

    // or if you need plugins
    if (config.plugins) {
        config.plugins.push(new AnyRegularWebpackPlugin());
    }

    return config;
};
```

From here on it is just like any other plain webpack configuration.

## Annotate AngularJs

#### Quick Introduction

If you worked with AngularJs you are familiar with the [dependency annotations](https://docs.angularjs.org/guide/di) (which are needed
for AngularJs applications to work after the JavaScript has been minified).
We are going to use the `angularjs-annotate` babel plugin to do those injections for us. Most of you probably use this already.
In the early days there was the [ng-annotate](https://github.com/olov/ng-annotate) package that did the same thing.  
The main idea is that you mark each function that you need the dependency injection for with a `/* @ngInject */` so for example

```javascript
/* @ngInject */
const myController = function ($scope) {};

someModule.controller('YourAngularController', myController);

// and after the annotation the last line becomes

myController.$inject = ['$scope'];
someModule.controller('YourAngularController', myController);
```

#### Setup

For this to work we need two more dependencies, get them with `npm install babel-loader babel-plugin-angularjs-annotate --save-dev`.
Now we can create a new loader in our `extra-webpack.config.ts`

```typescript
const babelLoader = {
    loader: 'babel-loader',
    options: {
        plugins: [['angularjs-annotate', { explicitOnly: true }]],
    },
};
```

From my experience it is really important to set the `explicitOnly` flag. Without the flag, the plugin tries to detect which are actually
AngularJs controllers and automatically annotates them. This may work for your application, but in my cases it did never work anymore as
soon as I turned on [IVY](https://angular.io/guide/ivy).  
Add the `/* @ngInject */` to all your AngularJs controllers, services, providers, directives, etc.

Register the loader to the configuration

```typescript
export default (
    config: webpack.Configuration,
    options: CustomWebpackBrowserSchema,
    targetOptions: TargetOptions
) => {
    const environment: string = targetOptions.configuration === 'production' ? 'production' : 'development';
    if (config.module && config.module.rules) {
        if (environment === 'production') {
            // @ts-ignore
            config.module.rules.forEach((rule: RuleSetRule) => {
                if (rule.test instanceof RegExp) {
                    /**
                     * Used for ng1 injects
                     */
                    if ('test-file.ts'.match(rule.test)) {
                        if (Array.isArray(rule.use)) {
                            rule.use.unshift(babelLoader);
                        }
                    }
                }
            })
        }
```

In my case I only want to add the step to production builds, because it slows down the serve time otherwise. And next we try to find the
rule from the regular angular.json that is doing the TypeScript loading and want to add our custom babelLoaded to it.

Pro Tip: Make use of the [ngStrictDi](https://docs.angularjs.org/api/ng/directive/ngApp) property in your AngularJs app and you immediately
get warnings if you missed the annotation on a specific case.

## Conclusion

It takes a little effort in the beginning to get everything up and running. But the main advantage is you can use the `angular-cli` in your
project, even if you have custom logic that usually is not covered by the `angular-cli`. And with the `angular-cli` there are a whole lot
of other advantages that are definitely worth the time you invested, like the creation of components and modules from the command line or
updating Angular/Library versions. But I might cover those stuff in another post in the future.
