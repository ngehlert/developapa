import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { BlogPostComponent } from './blog-post.component';
import { BlogService } from '../commons/blog.service';
import { Post } from '../commons/post';

const MOCK_POST: Post = {
    title: 'Test Post',
    date: '2025-06-15',
    description: 'A test post description',
    slug: 'test-post',
    tags: ['angular'],
    htmlContent: '<p>Hello <strong>world</strong></p>',
    comments: [
        { name: 'Alice', date: '2025-06-16', slug: 'test-post', htmlContent: '<p>Great post!</p>' },
        { name: 'Bob', date: '2025-06-17', slug: 'test-post', htmlContent: '<p>Thanks!</p>' },
    ],
};

async function setup(options?: { post?: Post | null; error?: boolean }) {
    const post = options?.post !== undefined ? options.post : MOCK_POST;
    const blogServiceSpy = {
        getPost: options?.error
            ? vi.fn().mockReturnValue(throwError(() => new Error('Not found')))
            : vi.fn().mockReturnValue(of(post)),
    };

    const activatedRoute = {
        snapshot: { paramMap: { get: vi.fn().mockReturnValue('test-post') } },
    };

    await TestBed.configureTestingModule({
        imports: [BlogPostComponent],
        providers: [
            provideRouter([]),
            provideZonelessChangeDetection(),
            { provide: BlogService, useValue: blogServiceSpy },
            { provide: ActivatedRoute, useValue: activatedRoute },
        ],
    }).compileComponents();

    return { blogServiceSpy, activatedRoute };
}

describe('BlogPostComponent', () => {
    it('should create the component', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should fetch the post using the slug from the route', async () => {
        const { blogServiceSpy } = await setup();
        TestBed.createComponent(BlogPostComponent);
        expect(blogServiceSpy.getPost).toHaveBeenCalledWith('test-post');
    });

    it('should set the document title with the post title', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const titleService = TestBed.inject(Title);
        expect(titleService.getTitle()).toBe('Test Post | Developapa');
    });

    it('should set the meta description', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const metaService = TestBed.inject(Meta);
        const tag = metaService.getTag('name="description"');
        expect(tag?.content).toBe('A test post description');
    });

    it('should render the post title', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('h1');
        expect(h1?.textContent).toContain('Test Post');
    });

    it('should render the post date', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const date = fixture.nativeElement.querySelector('.date');
        expect(date).toBeTruthy();
        expect(date.textContent).toBeTruthy();
    });

    it('should render the post HTML content', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const content = fixture.nativeElement.querySelector('[appPrismHighlight]') as HTMLElement;
        expect(content).toBeTruthy();
        expect(content.innerHTML).toContain('<p>Hello <strong>world</strong></p>');
    });

    it('should render a back link to the blog list', async () => {
        await setup();
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const backLink = fixture.nativeElement.querySelector('a[href="/blog"]') as HTMLAnchorElement;
        expect(backLink).toBeTruthy();
        expect(backLink.textContent).toContain('Back to Blog List');
    });

    it('should show error message when post fetch fails', async () => {
        await setup({ error: true });
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('could not be loaded or was not found');
    });

    it('should set error meta when post fetch fails', async () => {
        await setup({ error: true });
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const titleService = TestBed.inject(Title);
        expect(titleService.getTitle()).toBe('Post Not Found | Developapa');
    });

    it('should show error back link when post fetch fails', async () => {
        await setup({ error: true });
        const fixture = TestBed.createComponent(BlogPostComponent);
        fixture.detectChanges();
        const backLink = fixture.nativeElement.querySelector('a[href="/blog"]') as HTMLAnchorElement;
        expect(backLink).toBeTruthy();
    });

    describe('isPost', () => {
        it('should return true for a valid Post object', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            expect(fixture.componentInstance.isPost(MOCK_POST)).toBe(true);
        });

        it('should return false for HttpStatusCode.NotFound', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            expect(fixture.componentInstance.isPost(HttpStatusCode.NotFound)).toBe(false);
        });

        it('should return false for null', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            expect(fixture.componentInstance.isPost(null)).toBe(false);
        });

        it('should return false for undefined', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            expect(fixture.componentInstance.isPost(undefined)).toBe(false);
        });
    });

    describe('processLinks', () => {
        it('should not prevent default for external links with target _blank', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            const event = {
                target: { nodeName: 'A', getAttribute: (attr: string) => (attr === 'target' ? '_blank' : '/some-link') },
                preventDefault: vi.fn(),
            } as unknown as MouseEvent;

            fixture.componentInstance.processLinks(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('should prevent default and navigate for internal links', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            const event = {
                target: { nodeName: 'A', getAttribute: (attr: string) => (attr === 'href' ? '/blog/other#section' : '') },
                preventDefault: vi.fn(),
            } as unknown as MouseEvent;

            fixture.componentInstance.processLinks(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should not do anything for non-anchor elements', async () => {
            await setup();
            const fixture = TestBed.createComponent(BlogPostComponent);
            const event = {
                target: { nodeName: 'P', getAttribute: () => null },
                preventDefault: vi.fn(),
            } as unknown as MouseEvent;

            fixture.componentInstance.processLinks(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });
});
