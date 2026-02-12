import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { BlogListComponent } from './blog-list.component';
import { BlogService } from '../commons/blog.service';
import { PostMetadata } from '../commons/post';

const MOCK_POSTS: PostMetadata[] = [
    { title: 'First Post', date: '2025-01-15', description: 'Desc 1', slug: 'first-post', tags: ['angular', 'testing'] },
    { title: 'Second Post', date: '2025-02-20', description: 'Desc 2', slug: 'second-post', tags: ['angular', 'rxjs'] },
    { title: 'Third Post', date: '2025-03-10', description: 'Desc 3', slug: 'third-post', tags: ['testing'] },
];

describe('BlogListComponent', () => {
    let blogServiceSpy: { getPostsMetadata: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        blogServiceSpy = {
            getPostsMetadata: vi.fn().mockReturnValue(of(MOCK_POSTS)),
        };

        await TestBed.configureTestingModule({
            imports: [BlogListComponent],
            providers: [
                provideRouter([]),
                provideZonelessChangeDetection(),
                { provide: BlogService, useValue: blogServiceSpy },
            ],
        }).compileComponents();
    });

    it('should create the component', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should set the document title to Developapa', () => {
        TestBed.createComponent(BlogListComponent);
        const titleService = TestBed.inject(Title);
        expect(titleService.getTitle()).toBe('Developapa');
    });

    it('should render all posts', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const articles = fixture.nativeElement.querySelectorAll('article');
        expect(articles.length).toBe(3);
    });

    it('should render post titles as links', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const links = fixture.nativeElement.querySelectorAll('article h2 a');
        expect(links[0].textContent).toContain('First Post');
        expect(links[0].getAttribute('href')).toBe('/blog/first-post');
        expect(links[1].textContent).toContain('Second Post');
        expect(links[2].textContent).toContain('Third Post');
    });

    it('should render post descriptions', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const descriptions = fixture.nativeElement.querySelectorAll('.post-description');
        expect(descriptions[0].textContent).toContain('Desc 1');
        expect(descriptions[1].textContent).toContain('Desc 2');
        expect(descriptions[2].textContent).toContain('Desc 3');
    });

    it('should render post dates', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const dates = fixture.nativeElement.querySelectorAll('.post-date');
        expect(dates.length).toBe(3);
        // DatePipe with 'longDate' format
        expect(dates[0].textContent).toBeTruthy();
    });

    it('should render "Read More" links for each post', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const readMoreLinks = fixture.nativeElement.querySelectorAll('.read-more-link');
        expect(readMoreLinks.length).toBe(3);
        expect(readMoreLinks[0].getAttribute('href')).toBe('/blog/first-post');
        expect(readMoreLinks[0].textContent).toContain('Read More');
    });

    it('should render the tag filter select component', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const select = fixture.nativeElement.querySelector('app-select');
        expect(select).toBeTruthy();
    });

    it('should compute tag options with counts, sorted by frequency', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const tagOptions = fixture.componentInstance.tagOptions();
        // angular appears in 2 posts, testing in 2 posts, rxjs in 1
        // Same count sorted alphabetically: angular before testing
        expect(tagOptions).toEqual(['angular (2)', 'testing (2)', 'rxjs (1)']);
    });

    it('should show all posts when no tag is selected', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        expect(fixture.componentInstance.filteredPosts().length).toBe(3);
    });

    it('should filter posts by selected tag', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        fixture.componentInstance.selectedTag.set('rxjs (1)');
        fixture.detectChanges();

        const filtered = fixture.componentInstance.filteredPosts();
        expect(filtered.length).toBe(1);
        expect(filtered[0].slug).toBe('second-post');
    });

    it('should filter posts by a tag that matches multiple posts', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        fixture.componentInstance.selectedTag.set('angular (2)');
        fixture.detectChanges();

        const filtered = fixture.componentInstance.filteredPosts();
        expect(filtered.length).toBe(2);
        expect(filtered.map((p) => p.slug)).toEqual(['first-post', 'second-post']);
    });

    it('should show no articles when filter matches nothing', () => {
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        fixture.componentInstance.selectedTag.set('nonexistent (0)');
        fixture.detectChanges();

        expect(fixture.componentInstance.filteredPosts().length).toBe(0);
        const articles = fixture.nativeElement.querySelectorAll('article');
        expect(articles.length).toBe(0);
    });

    it('should handle empty posts list', () => {
        blogServiceSpy.getPostsMetadata.mockReturnValue(of([]));
        const fixture = TestBed.createComponent(BlogListComponent);
        fixture.detectChanges();
        const articles = fixture.nativeElement.querySelectorAll('article');
        expect(articles.length).toBe(0);
        expect(fixture.componentInstance.tagOptions()).toEqual([]);
    });
});
