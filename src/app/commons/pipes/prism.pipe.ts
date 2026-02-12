import { afterNextRender, Directive, ElementRef, inject } from '@angular/core';

import * as Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';

@Directive({
    selector: '[appPrismHighlight]',
})
export class PrismHighlightDirective {
    private el: ElementRef = inject(ElementRef);

    constructor() {
        afterNextRender(() => {
            Prism.highlightAllUnder(this.el.nativeElement);
        });
    }
}
