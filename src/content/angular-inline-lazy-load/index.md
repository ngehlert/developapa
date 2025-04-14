---
title: 'Angular module inline lazy loading'
date: '2023-08-04T21:59:08.123Z'
description: 'Quick snippet how to do inline lazy loading in Angular'
tags: ['Angular', 'Snippet']
duration: Snack
---

What do I mean with inline lazy loading in Angular. There is _regular_ lazy loading for entire modules based on the route:
[Angular Docs - Lazy loading feature modules](https://angular.io/guide/lazy-loading-ngmodules). In most of the cases this is enough, as
the entire module and components are only loaded by the browser once the user navigates to the given route.  
However, in specific edge cases you might want to lazy load a component on the same page independent of a router navigation,
for example when it's hidden with an `*ngIf` or if it's the content of a dialog.

Let's say we have a component `MyBigComponent`

```typescript
@Component({
    selector: 'my-big-component',
    template: 'template content',
})
export class MyBigComponent {}
```

and it is registered in our module `MyBigModule`

```typescript
@NgModule({
    imports: [],
    exports: [MyBigComponent],
    declarations: [MyBigComponent],
})
export class MyBigModule {
    public getComponent() {
        return MyBigComponent;
    }
}
```

Note:

- usually you don't have any logic within module classes, but in this case we actually need the `getComponent` method.
- make sure that you do not load the module or the component in any of your regular `imports` declarations because then everything will already be added to the same bundle and not in a separate one

Now comes the fun part. In the place where you want the lazy loaded content to be visible include

```html
<ng-template #content></ng-template>
```

And now we just need a method to load the content into the `ng-template` element.

```typescript
class RandomPageComponent {
    @ViewChild('content', { read: ViewContainerRef }) public content!: ViewContainerRef;

    constructor(private injector: Injector) {}

    public async loadContent() {
        const { MyBigModule } = await import('./my-big.module');
        const moduleRef = createNgModule(MyBigModule, this.injector);
        const lazyComponent = moduleRef.instance.getComponent();

        this.content.clear();
        this.content.createComponent(lazyComponent, { ngModuleRef: moduleRef });
    }
}
```

If you now call the `loadContent` method, for example on a button click `(click)="loadContent()"` your component will be rendered in the browser.  
But the code for it will actually be in a separate chunk file. You can check this if you open the network tab in your dev tools before you click the button.  
This works similar if you want to have this working for a dialog. You can just create a `DialogContentComponent` and call the `loadContent` in your `OnInit` function.

## How does it work

### ng-template

The `<ng-template>` is an element that by default is not rendered in the browser and you need to specifically instruct Angular
to render it ([ng-template docs](https://angular.io/api/core/ng-template)).  
In our case we get the template element with `@ViewChild` and then call methods like `clear()` to remove every currently existing content
and then `createComponent` to fill it with the content we want.

### await import

This is probably the most crucial part to this entire snipped. Usually our imports are at the top. However, if we use it inline in a function, this
will tell the Angular CLI to not include the code right here, but to create a separate chunk JavaScript file and only have the reference in the
`loadContent` method. This will cause the chunk file only to be loaded by the browser once this reference is being called.

### createNgModule

The `createNgModule` create a module reference. This is needed if your component actually uses any service injections or other modules.
With the `Injector` service we get from the constructor we can pass it in as parent injector and make sure that the context stays
within our current scope.

### getComponent

This is the function we added earlier to the module, returning the class (not an instance!) of our component that we want to render.
Then we just need to stitch everything together, call the `createComponent` method from our `ng-template` and pass it the component class and the
module reference and an instance of our component will be created and rendered inside the `ng-template`.
