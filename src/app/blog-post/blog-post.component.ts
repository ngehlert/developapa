import {
    Component,
    OnInit,
    inject,
    WritableSignal,
    signal,
    effect,
    PLATFORM_ID,
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService, Post } from '../blog.service';
import { Observable, switchMap, tap, catchError, of } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


import * as Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe],
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss'],
})
export class BlogPostComponent implements OnInit {
    private platformId = inject(PLATFORM_ID);
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private sanitizer = inject(DomSanitizer);

    post$: Observable<Post | null> | undefined;
    postContent: WritableSignal<SafeHtml | undefined> = signal(undefined);

    constructor() {
        effect(() => {
            if (this.postContent() && isPlatformBrowser(this.platformId)) {
                setTimeout(() => {
                    Prism.highlightAll();
                })
            }
        })
    }

    ngOnInit(): void {
        this.post$ = this.route.paramMap.pipe(
            switchMap((params) => {
                const slug = params.get('slug');
                if (!slug) {
                    console.error('No slug provided!');
                    this.updateMeta(null);
                    return of(null);
                }
                return this.blogService.getPost(slug).pipe(
                    tap((post) => {
                        this.updateMeta(post);
                    }),
                    catchError((error) => {
                        console.error('Error fetching post:', error);
                        this.updateMeta(null);
                        if (error.status === 404) {
                            console.log(`Post with slug '${slug}' not found.`);
                        }
                        return of(null);
                    }),
                );
            }),
        );
    }

    private updateMeta(post: Post | null): void {
        if (post) {
            this.titleService.setTitle(`${post.title} | Developapa`);
            this.metaService.updateTag({
                name: 'description',
                content: post.description,
            });
            this.postContent.set(this.sanitizer.bypassSecurityTrustHtml(post.htmlContent));
        } else {
            this.titleService.setTitle('Post Not Found | Developapa');
            this.metaService.updateTag({
                name: 'description',
                content: 'The requested blog post could not be found.',
            });
            this.postContent.set(undefined); // Clear content
        }
    }
}
