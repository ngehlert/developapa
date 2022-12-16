---
title: "Copy to clipboard with Angular"
date: "2022-04-16T14:14:08.123Z"
description: "Quick tutorial how to easy copy text to clipboard with native Angular API"
tags: ["Angular", "Tutorial"]
duration: Snack
sticky: true
---

**Since Angular 10.0** there is an official clipboard API in the `@angular/cdk` module ([Documentation](https://material.angular.io/cdk/clipboard/overview)). 

> The Component Dev Kit (CDK) is a set of behavior primitives for building UI components.

The `@angular/cdk` is a very powerful module and component library and directly supported and maintained by the Angular devs.  
I would always choose components from the official `cdk` over 3rd party libraries.

Let's have a look at the clipboard API.

- [Setup](#setup)
- [Usage](#usage)
- [Advanced usage](#advanced-usage)
- [Live exampe](#live-example)

## Setup
Add the `@angular/cdk` package to your project.
```
ng add @angular/cdk
```
or with NPM
```
npm install @angular/cdk
```

or with yarn
```
yarn add @angular/cdk
```

Make sure you have a version compatible with your regular `@angular/core` version (or just use the same version).

Import the `ClipboardModule` from `@angular/cdk/clipboard` and add it to your Angular module.
```typescript
import { NgModule } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';

@NgModule({
  imports: [ClipboardModule],
})
export class MaterialExampleModule {}
```

## Usage
The `cdkCopyToClipboard` can be used to add copy-on-click to every element. Passed in as parameter you have to specify the 
data that should be copied. For example
```html
<button 
  [cdkCopyToClipboard]="'This is the text that is being copied to your clipboard'"
>Copy to clipboard</button>
```

There is an output event called `cdkCopyToClipboardCopied` that can be used to track whether the copying was successful or not 
and start followup logic, for example showing a notification.
```html
<button 
  [cdkCopyToClipboard]="text" 
  (cdkCopyToClipboardCopied)="onClipboardCopy($event)"
>Copy to clipboard</button>
```
and in the typescript file
```typescript
  public onClipboardCopy(successful: boolean): void {
    console.log(successful);
  }
```

## Advanced usage
There is also a `Clipboard` service in the same module, that allows you to copy a string programmatically. The setup stays the same as above.
Just add the  
`private clipboard: Clipboard`  
service from  
`import { Clipboard } from '@angular/cdk/clipboard';`  
to your component.

There is a `copy(string)` method, that copies something into your clipboard and returns whether it was successful or not.

This is useful if you need to pass variables to the copied text or if you want to do this based on HTML elements, for example something 
like this
```html
<p #myText>You can also copy text from elements</p>
<button (click)="copyToClipboardWithParameter(myText)">
  Copy text from element to clipboard
</button>
```
and then in the component
```typescript
constructor(private clipboard: Clipboard) {}

public copyToClipboardWithParameter(value: HTMLElement): void {
    const text: string = value.textContent || '';
    console.log(text);
    const successful = this.clipboard.copy(text);
}
```

## Live Example
I put together a stackblitz page that copies a text and displays a snackbar notification with the status.  
You can find it here: [Stackblitz](https://stackblitz.com/edit/angular-peebw1-qqdj5u?file=src%2Fapp%2Fsnack-bar-overview-example.html)

I also put together a stackblitz page for the advanced usage, that uses the `Clipboard` service.  
You can find it here: [Stackblitz](https://stackblitz.com/edit/angular-peebw1-b9st9w?file=src%2Fapp%2Fsnack-bar-overview-example.ts)


