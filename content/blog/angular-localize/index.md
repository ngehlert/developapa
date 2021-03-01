---
title: "Translations in TypeScript with Angular $localize"
date: "2020-05-31T22:14:08.123Z"
description: ""
tags: ["Angular", "Tutorial"]
duration: Dinner
---

Managing translations in Angular has always been somewhat trouble some, and for the longest part a lot of people used 
3rd party libraries to do it. In this blog post I want to show you that **since Angular 9.0** you can use the `$localize` 
service and even do translations in TypeScript (translations in templates were possible before, 
[Angular Guide](https://angular.io/guide/i18n)).

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Defining strings in TypeScript](#defining-strings-in-typescript)
- [Extraction](#extraction)
- [Important notes](#important-notes)
- [Conclusion](#conclusion)

## Prerequisites

* Experience with Angular
* Already have translations in the template in use with Angulars `i18n` tags
* Extract translations tags from the template
* Use XLIF format for translation files (technically possible with other formats but requires additional steps, see below)
* Basic understanding of [Tagged Template Strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
 (helps understanding the syntax)

If any of those things are missing, I recommend doing a tutorial before starting with this one.  
I'm going to use the JIT compiler, but this should also be usable for the AOT compiler.

## Setup

If you haven't already, add the import for `$localize` to your lib imports.

```javascript
import '@angular/localize/init';
``` 

For `$localize` to work we need to load translations separately. They are not loaded with your regular i18n translations. 
For this there is a `loadTranslations(myTranslations)` method in the `@angular/localize` package available.  
They expect `Record<MessageIf, TargetMessage>` as type, which is basically just a plain object with key & values, where 
they keys are the translation id (! Important: not the translation key, [learn more](https://angular.io/guide/i18n#set-a-custom-id-for-persistence-and-maintenance)) 
and the value is the actual translation.  
This script converts your xliff file into said format. For it to work we need a library to convert the xliff format to 
JSON.

```
npm install xliff
```

```typescript
import { MessageId, TargetMessage } from '@angular/localize/src/utils';
import xliff from 'xliff';

export async function parseTranslationsForLocalize(translations: string): Promise<Record<MessageId, TargetMessage>> {
    const parserResult: any = await xliff.xliff12ToJs(translations);
    const xliffContent: any = parserResult.resources['ng2.template'];

    return Object.keys(xliffContent)
        .reduce((result: Record<MessageId, TargetMessage>, current: string) => {
            if (typeof xliffContent[current].target === 'string') {
                result[current] = xliffContent[current].target;
            } else {
                result[current] = xliffContent[current].target
                    .map((entry: string | {[key: string]: any}) => {
                        return typeof entry === 'string' ? entry : entry.Standalone['equiv-text'];
                    })
                    .map((entry: string) => {
                        return entry
                            .replace('{{', '{$')
                            .replace('}}', '}');
                    })
                    .join('');
            }

            return result;
        }, {});
}
```
If you don't use xliff but rather PO or JSON as your format, you might build your own conversion method.  
Now we can use the `parseTranslationsForLocalize` method in our app bootstrapping.
```typescript
import {
    StaticProvider,
    TRANSLATIONS,
    TRANSLATIONS_FORMAT,
} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { loadTranslations } from '@angular/localize';
import { MessageId, TargetMessage } from '@angular/localize/src/utils';

const translations: string = require(`xlf-translation-file.xlf`).default;

const bootstrapFn: any = async (extraProviders: Array<StaticProvider>): Promise<any> => {
    // Important part. Rest might be different depending on your setup
    const parsedTranslations: Record<MessageId, TargetMessage> = await parseTranslationsForLocalize(translations);
    loadTranslations(parsedTranslations);

    // For more information on the JIT compile check this documentation
    // https://v8.angular.io/guide/i18n#merge-with-the-jit-compiler
    return platformBrowserDynamic(extraProviders).bootstrapModule(AppModule, {
        providers: [
            // Loads translations for template
            {provide: TRANSLATIONS, useValue: translations},
            {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'},
        ],
    });
};
```

## Defining strings in TypeScript
`$localize` is a global tagged template function, you can use it everywhere in your TypeScript without importing.  
This looks something like this

```javascript
const text = $localize`:@@YOUR_UNIQUE_TRANSLATION_ID:the key of the translation`
```

Even translations with parameters are possible. The syntax looks like this

```javascript
$localize`:@@YOUR_UNIQUE_TRANSLATION_ID:Hi ${this.name}:name:, it's good to see you`
```
Inside the `${}` is the value you want to display in the translation. The `:name:` is the name of the parameter to use in 
your xlf file (without the : )

## Extraction

Currently Angular (v.9.1.9) does not support extraction of `$localize` strings. But it is likely to be available in a future 
version.  
Until then you can use this workaround. Create a `translation-extraction.component.ts` and add your keys from TypeScript there. 
As soon as Angular supports the extraction you can just remove this component. It can look something like this

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'translation-extraction',
    template: `
        <span i18n="@@YOUR_UNIQUE_TRANSLATION_ID">Hi {{name}}, it's good to see you</span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TranslationExtractionComponent {
    public name: any;
}
``` 

Make sure to give your variable the same names as in your `$localize` calls. 

## Important notes
* With `$localize` they don't support ICU-expressions, e.g. for plural handling *(its not clear if this will even be implemented 
in the future)*
* In my tests the `$localize` generated different IDs for the same key used in an `i18n` template tag. Therefore 
I highly recommend always using custom IDs instead of Angulars auto-generated ones

## Conclusion
Even though there is still some stuff missing like the extraction and a proper documentation, it is nice that Angular now 
finally supports translating content in TypeScript files. 

Let me know if this helped you or if you have any questions.
