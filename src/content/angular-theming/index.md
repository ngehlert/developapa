---
title: 'Theming System with Angular and CSS Custom Properties'
date: '2021-03-14T14:19:08.123Z'
description: 'Quick tutorial on how to build a Theming System that can be used for example for dark mode with plain Angular and CSS Custom Properties'
tags: ['Angular', 'CSS', 'Tutorial']
duration: Lunch
---

In this quick tutorial we are going to build a theming system with Angular and CSS Custom Properties (Variables) and without any extra libraries. While we buid a Dark-/Light-Mode switch, the concept can be applied to any theming you wish.  
If you don't want to follow along, you can jump right ahead and check it out in the [Stackblitz](https://stackblitz.com/edit/angular-ivy-p3yzuk)

- [Interfaces](#interface--classes)
- [Directive](#directive)
- [Service](#service)
- [Adapt Styles](#adapt-styles)
- [Theme Switching](#theme-switching)
- [Extend functionality](#extend-functionality)
- [Conclusion](#conclusion)

## Interfaces & classes

Let's start of with our Interfaces, enums and classes.

```typescript
export enum AvailableProperties {
    Background = '--background',
    FontColor = '--font-color',
}

export enum Theme {
    Light = 'Light',
    Dark = 'Dark',
}

export interface IThemeOptions {
    name: Theme;
    customProperties: Record<AvailableProperties, string>;
}
```

The `IThemeOptions` will be used to create our classes that represent each available Theme later.  
`AvailableProperties` will contain all available custom properties and map them to a enum value, to be easier usable.  
The enum `Theme` is just a list that contains all available themes so we can reference them by enum value later.

Now we can create our theme classes.

```typescript
import { AvailableProperties, IThemeOptions, Theme } from './Theme';

export const lightTheme: IThemeOptions = {
    name: Theme.Light,
    customProperties: {
        [AvailableProperties.Background]: '#fefefe',
        [AvailableProperties.FontColor]: '#24292e',
    },
};

export const darkTheme: IThemeOptions = {
    name: Theme.Dark,
    customProperties: {
        [AvailableProperties.Background]: '#263238',
        [AvailableProperties.FontColor]: '#c9d1c9',
    },
};
```

## Directive

The directive is responsible to set the custom properties to the given element.

```typescript
import { Directive, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ThemeService } from './theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AvailableProperties, IThemeOptions } from './Theme';

@Directive({
    selector: '[appTheme]',
})
export class ThemeDirective implements OnInit, OnDestroy {
    private unsubscribe: Subject<boolean> = new Subject();

    constructor(
        private elementRef: ElementRef,
        private themeService: ThemeService,
    ) {}

    public ngOnInit(): void {
        const active: IThemeOptions = this.themeService.getActiveTheme();
        if (active) {
            this.updateTheme(active);
        }
        this.themeService.themeChange.pipe(takeUntil(this.unsubscribe)).subscribe((theme: IThemeOptions) => this.updateTheme(theme));
    }

    public ngOnDestroy(): void {
        this.unsubscribe.next();
    }

    public updateTheme(theme: IThemeOptions): void {
        Object.keys(theme.customProperties).forEach((key: string): void => {
            this.elementRef.nativeElement.style.setProperty(key, theme.customProperties[key as AvailableProperties]);
        });
    }
}
```

The most important part is the `updateTheme` method. It takes a given Theme, iterates through all customProperties and applies all values to the given `elementRef` of the directive.  
The `ngOnInit` sets the theme initially and also adds a listener if the theme is changed via our theme service (happens in the next step)

## Service

The `ThemeService` will be used to switch the Themes.

```typescript
import { Injectable, EventEmitter } from '@angular/core';
import { lightTheme } from './light-theme';
import { darkTheme } from './dark-theme';
import { IThemeOptions, Theme } from './Theme';

@Injectable()
export class ThemeService {
    public themeChange: EventEmitter<IThemeOptions> = new EventEmitter<IThemeOptions>();

    private themes: Array<IThemeOptions> = [lightTheme, darkTheme];
    private activeTheme: Theme = Theme.Light;

    public getActiveTheme(): IThemeOptions {
        const theme: IThemeOptions | undefined = this.themes.find((option: IThemeOptions) => option.name === this.activeTheme);
        if (!theme) {
            throw new Error(`Theme not found: '${this.activeTheme}'`);
        }

        return theme;
    }

    public setTheme(name: Theme): void {
        this.activeTheme = name;
        this.themeChange.emit(this.getActiveTheme());
    }
}
```

The main part of this service is the `themeChange` EventEmitter (which we listen to in our directive). The `setTheme` function is used to change the theme. It updates the internal variable and emits a new value in the EventEmitter. The initial value of the `activeTheme` variable is the theme that will be used initially.

Now add the `ThemeService` and the `ThemeDirective` to the respective angular.module and add it the service to the providers array and the directive to the declarations array.

## Apply styles

Now most technical stuff is done and we can start implementing our styles. For this just add a class and start using your properties right away, for example

```css
.content {
    background-color: var(--background);
    color: var(--font-color);
}
```

\*Even though this is technically not needed I always add all available custom-properties to the main css file on the root-element.

```css
:root {
    --background: #f6f7f9 --font-color: #24292e;
}
```

This helps your IDE to provide autocompletion if you reference the available custom properties later.

## Theme Switching

Now we need button to switch the themes around. In this example let's build a quick darkmode switch.

```html
<button
    matButton
    (click)="toggleTheme()"
>
    Toggle Theme
</button>
```

```typescript
  public isLightThemeActive: boolean = true;

  constructor(private themeService: ThemeService) {}

  public toggleTheme(): void {
    this.isLightThemeActive = !this.isLightThemeActive;
    if (this.isLightThemeActive) {
      this.themeService.setTheme(Theme.Light);
    } else {
      this.themeService.setTheme(Theme.Dark);
    }
  }
```

Now everything is complete and should work properly.

## Extend functionality

I'd suggest to add a small transition style, so the theme switching progress looks more smooth, for example something like this

```css
transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out;
```

If you need more properties just add the new value to the enum `AvailableProperties` and implement the respective values in the theme classes.

## Conclusion

With just one service, one directive and couple of classes/interface we now have a complete theming system. And while we build a dark-/light-mode switch in this tutorial, this can easily be adapted to green and blue theme or whatever you like - and is not limited to just having 2 themes. You can add as many classes as you like.

Feel free to play around with the [Stackblitz](https://stackblitz.com/edit/angular-ivy-p3yzuk) and let me know if this was helpful for you.
