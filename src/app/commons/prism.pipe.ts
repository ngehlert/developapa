import { inject, Pipe, PLATFORM_ID } from '@angular/core';

import * as Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';
import { isPlatformBrowser } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'prismHighlight',
})
export class PrismHighlightPipe {
    private platformId = inject(PLATFORM_ID);

    transform(html: SafeHtml): SafeHtml {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                Prism.highlightAll();
            });
        }

        return html;
    }
}
