import { inject, Pipe } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
    standalone: true,
})
export class SafeHtmlPipe {
    private sanitizer = inject(DomSanitizer);

    transform(html: any): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
