import {
    Component,
    OnInit,
    inject,
    OnDestroy,
    SecurityContext,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService, Post } from '../blog.service';
import { Observable, Subscription, switchMap, tap, catchError, of } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe],
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss'],
})
export class BlogPostComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private sanitizer = inject(DomSanitizer); // Inject DomSanitizer

    post$: Observable<Post | null> | undefined;
    postContent: SafeHtml | undefined; // Use SafeHtml type
    private postSubscription: Subscription | undefined;

    ngOnInit(): void {
        this.post$ = this.route.paramMap.pipe(
            switchMap((params) => {
                const slug = params.get('slug');
                if (!slug) {
                    // Handle error case - maybe navigate to a 'not found' page or show message
                    console.error('No slug provided!');
                    this.updateMeta(null); // Clear meta tags
                    return of(null); // Return observable of null
                }
                return this.blogService.getPost(slug).pipe(
                    tap((post) => {
                        this.updateMeta(post); // Update meta tags when data arrives
                        // Sanitize the HTML content before binding
                        this.postContent =
                            this.sanitizer.bypassSecurityTrustHtml(
                                post.htmlContent,
                            );
                    }),
                    catchError((error) => {
                        console.error('Error fetching post:', error);
                        this.updateMeta(null); // Clear meta tags on error
                        // Handle specific errors like 404
                        if (error.status === 404) {
                            // Optionally navigate to a 404 component
                            console.log(`Post with slug '${slug}' not found.`);
                        }
                        return of(null); // Return observable of null on error
                    }),
                );
            }),
        );
    }

    // Helper to update title and meta description
    private updateMeta(post: Post | null): void {
        if (post) {
            this.titleService.setTitle(`${post.title} | My Angular Blog`);
            this.metaService.updateTag({
                name: 'description',
                content: post.description,
            });
            // Add other meta tags if needed (e.g., Open Graph)
            // this.metaService.updateTag({ property: 'og:title', content: post.title });
        } else {
            // Set default title/description for error or not found cases
            this.titleService.setTitle('Post Not Found | My Angular Blog');
            this.metaService.updateTag({
                name: 'description',
                content: 'The requested blog post could not be found.',
            });
            this.postContent = undefined; // Clear content
        }
    }

    ngOnDestroy(): void {
        // Clean up subscription if necessary (though async pipe handles simple cases)
        this.postSubscription?.unsubscribe();

        // Optionally remove meta tags specific to this page if navigating away within SPA
        // this.metaService.removeTag("name='description'");
    }
}
