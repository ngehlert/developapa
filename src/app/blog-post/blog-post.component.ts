import {
    Component,
    inject,
} from '@angular/core';
import { CommonModule, DatePipe, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../commons/blog.service';
import { Observable, tap, catchError, of } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../commons/safe-html.pipe';
import { PrismHighlightPipe } from '../commons/prism.pipe';
import { Post } from '../commons/post';
import { CommentComponent } from '../commons/comment.component';
import { HttpStatusCode } from '@angular/common/http';
import { CommentFormComponent } from '../commons/comment-form.component';
import { TraceClass } from '@sentry/angular';

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        DatePipe,
        SafeHtmlPipe,
        PrismHighlightPipe,
        CommentComponent,
        CommentFormComponent,
    ],
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss'],
})
@TraceClass()
export class BlogPostComponent {
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private titleService = inject(Title);
    private metaService = inject(Meta);

    post$: Observable<Post | HttpStatusCode | null> | undefined;

    constructor(
        private router: Router,
        private viewportScroller: ViewportScroller,
    ) {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (slug) {
            this.post$ = this.blogService.getPost(slug).pipe(
                tap((post) => {
                    this.updateMeta(post);
                }),
                catchError((error) => {
                    console.error('Error fetching post:', error);
                    this.updateMeta(null);
                    return of(HttpStatusCode.NotFound);
                }),
            );
        }
    }

    public processLinks(e: any) {
        const element: HTMLElement | null = e.target;
        if (element?.nodeName === 'A') {
            e.preventDefault();
            const link: string = element.getAttribute('href') || '';
            const [baseUrl, fragment] = link.split('#');
            void this.router.navigate([baseUrl], {fragment});
            this.viewportScroller.scrollToAnchor(fragment);
        }
    }

    public isPost(post: Post | HttpStatusCode | null): post is Post {
        return post !== null && post !== HttpStatusCode.NotFound;
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
