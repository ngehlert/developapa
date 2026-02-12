import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { CommentFormComponent } from './comment-form.component';

describe('CommentFormComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommentFormComponent],
            providers: [provideRouter([]), provideZonelessChangeDetection()],
        }).compileComponents();
    });

    function createComponent() {
        const fixture = TestBed.createComponent(CommentFormComponent);
        fixture.detectChanges();
        return fixture;
    }

    it('should create the component', () => {
        const fixture = createComponent();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render a form element', () => {
        const fixture = createComponent();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form).toBeTruthy();
    });

    it('should have the form name set to comment-form', () => {
        const fixture = createComponent();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.getAttribute('name')).toBe('comment-form');
    });

    it('should have the form method set to post', () => {
        const fixture = createComponent();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.getAttribute('method')).toBe('post');
    });

    it('should have a netlify honeypot field', () => {
        const fixture = createComponent();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.getAttribute('data-netlify-honeypot')).toBe('bot-field');
    });

    it('should have the data-netlify attribute', () => {
        const fixture = createComponent();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.getAttribute('data-netlify')).toBe('true');
    });

    it('should have a hidden bot-field input', () => {
        const fixture = createComponent();
        const botField = fixture.nativeElement.querySelector('input[name="bot-field"]') as HTMLInputElement;
        expect(botField).toBeTruthy();
        expect(botField.style.display).toBe('none');
    });

    it('should have a hidden form-name input with value comment-form', () => {
        const fixture = createComponent();
        const formName = fixture.nativeElement.querySelector('input[name="form-name"]') as HTMLInputElement;
        expect(formName).toBeTruthy();
        expect(formName.type).toBe('hidden');
        expect(formName.value).toBe('comment-form');
    });

    it('should have a hidden slug input bound to the url', () => {
        const fixture = createComponent();
        const slug = fixture.nativeElement.querySelector('input[name="slug"]') as HTMLInputElement;
        expect(slug).toBeTruthy();
        expect(slug.type).toBe('hidden');
    });

    it('should render a name input with placeholder and required', () => {
        const fixture = createComponent();
        const nameInput = fixture.nativeElement.querySelector('input#name') as HTMLInputElement;
        expect(nameInput).toBeTruthy();
        expect(nameInput.placeholder).toBe('Your Name');
        expect(nameInput.required).toBe(true);
    });

    it('should render a comment textarea with placeholder and required', () => {
        const fixture = createComponent();
        const textarea = fixture.nativeElement.querySelector('textarea#comment') as HTMLTextAreaElement;
        expect(textarea).toBeTruthy();
        expect(textarea.placeholder).toBe('Write your comment here...');
        expect(textarea.required).toBe(true);
    });

    it('should render a GDPR checkbox that is required', () => {
        const fixture = createComponent();
        const checkbox = fixture.nativeElement.querySelector('input#gdpr') as HTMLInputElement;
        expect(checkbox).toBeTruthy();
        expect(checkbox.type).toBe('checkbox');
        expect(checkbox.required).toBe(true);
    });

    it('should render a GDPR consent label', () => {
        const fixture = createComponent();
        const label = fixture.nativeElement.querySelector('label[for="gdpr"]') as HTMLLabelElement;
        expect(label).toBeTruthy();
        expect(label.textContent).toContain('I agree that my name will be stored');
    });

    it('should render a submit button', () => {
        const fixture = createComponent();
        const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.textContent).toContain('Submit');
    });

    it('should extract the slug from the router url', () => {
        const router = TestBed.inject(Router);
        // Default router url is '/'
        const fixture = createComponent();
        // url strips '/blog/' prefix
        expect(fixture.componentInstance.url).toBe(router.url.replace('/blog/', ''));
    });

    it('should have autocomplete off on the form', () => {
        const fixture = createComponent();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.getAttribute('autocomplete')).toBe('off');
    });
});
