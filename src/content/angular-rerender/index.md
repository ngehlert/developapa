---
title: 'Force Angular to rerender '
date: '2022-05-11T23:59:08.123Z'
description: 'Example of how to use an Interceptor to track request times'
tags: ['Angular', 'Snippet']
duration: Snack
sticky: true
---

Sometimes the regular Angular change detection is just not enough and you need to rerender a specific component completely.

- [Easy way](#easy-way)
- [Do it manually](#do-it-manually)
- [What not to do](#what-not-to-do)

## Easy way

Since I was reaching for the same code snippets in couple of projects I extracted it into a npm-library
[ngx-rerender](https://github.com/ngehlert/ngx-rerender).  
After installing, you can just put the `*mcRerender` directive on any element and rerender it if you update the value in the binding.

```html
<stuff-to-rerender *mcRerender="trigger">Some Content</stuff-to-rerender>
```

```typescript
class MyComponent {
    public trigger: number = 0;

    public rerender(): void {
        this.trigger++;
    }
}
```

## Do it manually

[Stackblitz example](https://stackblitz.com/edit/angular-component-rerender-2e3yxx?file=src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fchild.component.ts)  
The very basic approach works by wrapping the element you want to rerender inside a `ng-template` element that gets rendered
into a `ng-container`. On rerender you can just clear the content of the `ng-container` and create a new component from the `ng-element`.

Your template looks something like this

```html
<div>
    <ng-container
        #outlet
        [ngTemplateOutlet]="content"
    >
    </ng-container>
</div>

<ng-template #content>
    <child-component></child-component>
</ng-template>
```

And in your TypeScript you can access the `content` and `outlet` element with `@ViewChild` for the rerender

```typescript
export class AppComponent {
    @ViewChild('outlet', { read: ViewContainerRef }) outletRef: ViewContainerRef;
    @ViewChild('content', { read: TemplateRef }) contentRef: TemplateRef<any>;

    public rerender() {
        this.outletRef.clear();
        this.outletRef.createEmbeddedView(this.contentRef);
    }
}
```

And my library is more or less a wrapper around this functionality, so you don't need to copy-paste this around in your project.
There's also a component included that lets you use boolean values which always looks so nice.
Check out the [documentation](https://github.com/ngehlert/ngx-rerender) ;)

## What not to do

I'm just quoting from my lib documentation in this place.

In this small section I will show some workarounds that I've seen in the past on StackOverflow or other projects and try to explain why they are not a good idea.

### The ngIf "Have you tried turning it off and on again?"

The idea is to completely remove the specific component from the DOM, manually trigger a change detection and then re-add it. A basic solution looks something like this

```typescript
import { ChangeDetectorRef } from '@angular/core';

class MyComponent {
    public isVisible: boolean = true;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    public rerender(): void {
        this.isVisible = false;
        this.changeDetectorRef.detectChanges();
        this.isVisible = true;
    }
}
```

```html
<stuff-to-rerender *ngIf="isVisible">Some Content</stuff-to-rerender>
```

This is a very "straight forward" and often suggested solution. However, it's not ideal for two reasons. First you will notice a "blink" in your page, because there is one entire lifecycle where your component is not visible.  
And secondly you trigger a change detection for the entire application. Every other binding and lifecycle hook gets also triggered. This can become an issue in big applications where the `ChangeDetectionStrategy.OnPush` is not being used.

### The ngFor "smart" workaround

The idea is to "trick" Angular into thinking my current element is actually a new one. For this we make use of `ngFor` which will initialize each entry from scratch once and then only update bindings based on the reference in the array.  
If we update the reference in the array it will effectively re-rerender the given code part.

```typescript
class MyComponent {
    public rerenderProps: Array<number> = [1];

    public rerender(): void {
        this.rerenderProps[0]++;
    }
}
```

```html
<div *ngFor="let i of rerenderProps">
    <stuff-to-rerender>Some Content</stuff-to-rerender>
</div>
```

While this solves the two issues of the `ngIf` workaround (content blink and app-wide change detection) this is still not a nice solution.  
It is very hard to understand for others looking at your code, and also you always need to implement additional logic like index checks `ngIf="index === 0"` in order to prevent accidentally showing the component multiple times.
