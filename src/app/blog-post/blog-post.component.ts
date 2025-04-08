import {
    Component,
    OnInit,
    inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService } from '../commons/blog.service';
import { Observable, switchMap, tap, catchError, of } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../commons/safe-html.pipe';
import { PrismHighlightPipe } from '../commons/prism.pipe';
import { Post } from '../commons/post';
import { CommentComponent } from '../commons/comment.component';

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe, SafeHtmlPipe, PrismHighlightPipe, CommentComponent],
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.scss'],
})
export class BlogPostComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private titleService = inject(Title);
    private metaService = inject(Meta);

    post$: Observable<Post | null> | undefined;

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
        } else {
            this.titleService.setTitle('Post Not Found | Developapa');
            this.metaService.updateTag({
                name: 'description',
                content: 'The requested blog post could not be found.',
            });
        }
    }
}
