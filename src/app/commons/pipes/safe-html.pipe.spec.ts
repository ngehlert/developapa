import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { SafeHtmlPipe } from './safe-html.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafeHtmlPipe', () => {
    let pipe: SafeHtmlPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SafeHtmlPipe, provideZonelessChangeDetection()],
        });
        pipe = TestBed.inject(SafeHtmlPipe);
    });

    it('should create the pipe', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return a SafeHtml value', () => {
        const result = pipe.transform('<p>hello</p>');
        // SafeHtml is an opaque wrapper; verify it's not a plain string
        expect(result).toBeTruthy();
        expect(typeof result).not.toBe('string');
    });

    it('should call bypassSecurityTrustHtml on the sanitizer', () => {
        const sanitizer = TestBed.inject(DomSanitizer);
        const spy = vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');
        pipe.transform('<div>test</div>');
        expect(spy).toHaveBeenCalledWith('<div>test</div>');
    });

    it('should handle empty string', () => {
        const result = pipe.transform('');
        expect(result).toBeTruthy();
    });

    it('should handle null input', () => {
        const result = pipe.transform(null);
        expect(result).toBeTruthy();
    });
});

// Integration tests: verify HTML is actually rendered in the DOM
@Component({
    template: `<div [innerHTML]="html | safeHtml"></div>`,
    imports: [SafeHtmlPipe],
})
class TestHostComponent {
    html = '';
}

describe('SafeHtmlPipe (DOM integration)', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [provideZonelessChangeDetection()],
        }).compileComponents();
    });

    function render(html: string): HTMLElement {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.componentInstance.html = html;
        fixture.detectChanges();
        return fixture.nativeElement.querySelector('div') as HTMLElement;
    }

    it('should render a simple paragraph', () => {
        const el = render('<p>Hello world</p>');
        const p = el.querySelector('p')!;
        expect(p).toBeTruthy();
        expect(p.textContent).toBe('Hello world');
    });

    it('should render nested elements', () => {
        const el = render('<ul><li>One</li><li>Two</li></ul>');
        const items = el.querySelectorAll('li');
        expect(items.length).toBe(2);
        expect(items[0].textContent).toBe('One');
        expect(items[1].textContent).toBe('Two');
    });

    it('should render inline styles', () => {
        const el = render('<span style="color: red;">Styled</span>');
        const span = el.querySelector('span')!;
        expect(span).toBeTruthy();
        expect(span.textContent).toBe('Styled');
        expect(span.style.color).toBe('red');
    });

    it('should render links with attributes', () => {
        const el = render('<a href="https://example.com" target="_blank">Link</a>');
        const a = el.querySelector('a')!;
        expect(a).toBeTruthy();
        expect(a.getAttribute('href')).toBe('https://example.com');
        expect(a.getAttribute('target')).toBe('_blank');
        expect(a.textContent).toBe('Link');
    });

    it('should render images', () => {
        const el = render('<img src="test.png" alt="Test image" />');
        const img = el.querySelector('img')!;
        expect(img).toBeTruthy();
        expect(img.getAttribute('alt')).toBe('Test image');
    });

    it('should render formatted code blocks', () => {
        const el = render('<pre><code class="language-ts">const x = 1;</code></pre>');
        const code = el.querySelector('code')!;
        expect(code).toBeTruthy();
        expect(code.classList).toContain('language-ts');
        expect(code.textContent).toBe('const x = 1;');
    });

    it('should render mixed inline formatting', () => {
        const el = render('<p><strong>Bold</strong> and <em>italic</em> and <code>code</code></p>');
        expect(el.querySelector('strong')!.textContent).toBe('Bold');
        expect(el.querySelector('em')!.textContent).toBe('italic');
        expect(el.querySelector('code')!.textContent).toBe('code');
    });

    it('should render empty string without errors', () => {
        const el = render('');
        expect(el.innerHTML).toBe('');
    });

    it('should render HTML entities', () => {
        const el = render('<p>&amp; &lt; &gt; &quot;</p>');
        const p = el.querySelector('p')!;
        expect(p.textContent).toBe('& < > "');
    });
});
