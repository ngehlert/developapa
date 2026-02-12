import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CommentComponent } from './comment.component';
import { Comment } from './comment';

const MOCK_COMMENT: Comment = {
    name: 'Alice',
    date: '2025-06-16',
    slug: 'test-post',
    htmlContent: '<p>Great post!</p>',
};

describe('CommentComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommentComponent],
            providers: [provideZonelessChangeDetection()],
        }).compileComponents();
    });

    function createComponent(comment: Comment = MOCK_COMMENT, index = 0) {
        const fixture = TestBed.createComponent(CommentComponent);
        fixture.componentRef.setInput('commentData', comment);
        fixture.componentRef.setInput('index', index);
        fixture.detectChanges();
        return fixture;
    }

    it('should create the component', () => {
        const fixture = createComponent();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render the comment author name', () => {
        const fixture = createComponent();
        const author = fixture.nativeElement.querySelector('.comment-author') as HTMLElement;
        expect(author.textContent).toContain('Alice');
    });

    it('should render the comment date', () => {
        const fixture = createComponent();
        const date = fixture.nativeElement.querySelector('.comment-date') as HTMLElement;
        expect(date).toBeTruthy();
        expect(date.textContent!.trim()).toBeTruthy();
    });

    it('should render the comment HTML content', () => {
        const fixture = createComponent();
        const message = fixture.nativeElement.querySelector('.comment-message') as HTMLElement;
        expect(message.innerHTML).toContain('<p>Great post!</p>');
    });

    it('should render rich HTML content via safeHtml pipe', () => {
        const comment: Comment = { ...MOCK_COMMENT, htmlContent: '<em>Italic</em> and <strong>bold</strong>' };
        const fixture = createComponent(comment);
        const message = fixture.nativeElement.querySelector('.comment-message') as HTMLElement;
        expect(message.querySelector('em')?.textContent).toBe('Italic');
        expect(message.querySelector('strong')?.textContent).toBe('bold');
    });

    describe('decoration logic based on index', () => {
        it('should show red pin at index 0 (index % 4 === 0)', () => {
            const fixture = createComponent(MOCK_COMMENT, 0);
            expect(fixture.componentInstance.applyRedPin()).toBe(true);
            expect(fixture.componentInstance.applyBluePin()).toBe(false);
            expect(fixture.componentInstance.applyScotchTape()).toBe(false);
            expect(fixture.nativeElement.querySelector('.red-pin')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.blue-pin')).toBeNull();
            expect(fixture.nativeElement.querySelector('.scotch-tape')).toBeNull();
        });

        it('should show scotch tape at index 1 (index % 4 === 1)', () => {
            const fixture = createComponent(MOCK_COMMENT, 1);
            expect(fixture.componentInstance.applyScotchTape()).toBe(true);
            expect(fixture.componentInstance.applyRedPin()).toBe(false);
            expect(fixture.componentInstance.applyBluePin()).toBe(false);
            expect(fixture.nativeElement.querySelector('.scotch-tape')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.red-pin')).toBeNull();
            expect(fixture.nativeElement.querySelector('.blue-pin')).toBeNull();
        });

        it('should show blue pin at index 2 (index % 4 === 2)', () => {
            const fixture = createComponent(MOCK_COMMENT, 2);
            expect(fixture.componentInstance.applyBluePin()).toBe(true);
            expect(fixture.componentInstance.applyRedPin()).toBe(false);
            expect(fixture.componentInstance.applyScotchTape()).toBe(false);
            expect(fixture.nativeElement.querySelector('.blue-pin')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.red-pin')).toBeNull();
            expect(fixture.nativeElement.querySelector('.scotch-tape')).toBeNull();
        });

        it('should show no decoration at index 3 (index % 4 === 3)', () => {
            const fixture = createComponent(MOCK_COMMENT, 3);
            expect(fixture.componentInstance.applyRedPin()).toBe(false);
            expect(fixture.componentInstance.applyBluePin()).toBe(false);
            expect(fixture.componentInstance.applyScotchTape()).toBe(false);
            expect(fixture.nativeElement.querySelector('.red-pin')).toBeNull();
            expect(fixture.nativeElement.querySelector('.blue-pin')).toBeNull();
            expect(fixture.nativeElement.querySelector('.scotch-tape')).toBeNull();
        });

        it('should cycle decorations: index 4 same as index 0', () => {
            const fixture = createComponent(MOCK_COMMENT, 4);
            expect(fixture.componentInstance.applyRedPin()).toBe(true);
            expect(fixture.nativeElement.querySelector('.red-pin')).toBeTruthy();
        });
    });

    describe('rotation degrees', () => {
        it('should return -1 for index 0', () => {
            const fixture = createComponent(MOCK_COMMENT, 0);
            expect(fixture.componentInstance.rotationDegrees()).toBe(-1);
        });

        it('should return 1 for index 1', () => {
            const fixture = createComponent(MOCK_COMMENT, 1);
            expect(fixture.componentInstance.rotationDegrees()).toBe(1);
        });

        it('should return -1 for index 2', () => {
            const fixture = createComponent(MOCK_COMMENT, 2);
            expect(fixture.componentInstance.rotationDegrees()).toBe(-1);
        });

        it('should return 0 for index 3', () => {
            const fixture = createComponent(MOCK_COMMENT, 3);
            expect(fixture.componentInstance.rotationDegrees()).toBe(0);
        });

        it('should cycle: index 5 same as index 1', () => {
            const fixture = createComponent(MOCK_COMMENT, 5);
            expect(fixture.componentInstance.rotationDegrees()).toBe(1);
        });

        it('should set host style --initial-rotate', () => {
            const fixture = createComponent(MOCK_COMMENT, 1);
            const hostStyle = (fixture.nativeElement as HTMLElement).style.getPropertyValue('--initial-rotate');
            expect(hostStyle).toContain('1');
        });
    });

    it('should default index to 0 when not provided', () => {
        const fixture = TestBed.createComponent(CommentComponent);
        fixture.componentRef.setInput('commentData', MOCK_COMMENT);
        fixture.detectChanges();
        expect(fixture.componentInstance.index()).toBe(0);
        expect(fixture.componentInstance.applyRedPin()).toBe(true);
        expect(fixture.componentInstance.rotationDegrees()).toBe(-1);
    });
});
