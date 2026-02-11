import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../commons/blog.service';
import { tap, catchError, of } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../commons/safe-html.pipe';
import { PrismHighlightPipe } from '../commons/prism.pipe';
import { Post } from '../commons/post';
import { CommentComponent } from '../commons/comment.component';
import { HttpStatusCode } from '@angular/common/http';
import { CommentFormComponent } from '../commons/comment-form.component';
import { TraceClass } from '@sentry/angular';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-blog-post',
    imports: [
        RouterLink,
        DatePipe,
        SafeHtmlPipe,
        PrismHighlightPipe,
        CommentComponent,
        CommentFormComponent,
    ],
    templateUrl: './blog-post.component.html',
    styleUrl: './blog-post.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@TraceClass()
export class BlogPostComponent {
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private titleService = inject(Title);
    private metaService = inject(Meta);

    private router = inject(Router);
    private viewportScroller = inject(ViewportScroller);

    post = toSignal(
        this.blogService.getPost(this.route.snapshot.paramMap.get('slug')!).pipe(
            tap((post) => this.updateMeta(post)),
            catchError((error) => {
                console.error('Error fetching post:', error);
                this.updateMeta(null);
                return of(HttpStatusCode.NotFound as Post | HttpStatusCode);
            }),
        ),
    );

    public processLinks(e: MouseEvent) {
        const element: HTMLElement | null = e.target as HTMLElement;
        if (element?.nodeName === 'A') {
            const link: string = element.getAttribute('href') || '';
            const target: string = element.getAttribute('target') || '';
            if (target === '_blank') {
                return;
            }
            e.preventDefault();
            const [baseUrl, fragment] = link.split('#');
            void this.router.navigate([baseUrl], { fragment });
            this.viewportScroller.scrollToAnchor(fragment);
        }
    }

    public isPost(post: Post | HttpStatusCode | null | undefined): post is Post {
        return post != null && post !== HttpStatusCode.NotFound;
    }

    private updateMeta(post: Post | null): void {
        if (post) {
            this.titleService.setTitle(`${post.title} | Developapa`);
            this.metaService.updateTag({
                name: 'description',
                content: post.description,
            });
        } else {
            this.titleService.setTitle('Post Not Found | Developapa');
            this.metaService.updateTag({
                name: 'description',
                content: 'The requested blog post could not be found.',
            });
        }
    }
}
