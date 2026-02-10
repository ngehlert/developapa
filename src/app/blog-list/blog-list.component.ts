import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal, Signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../commons/blog.service';
import { Title } from '@angular/platform-browser';
import { PostMetadata } from '../commons/post';
import { SelectComponent } from '../commons/select.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { TraceClass } from '@sentry/angular';

@Component({
    selector: 'app-blog-list',
    imports: [CommonModule, RouterModule, DatePipe, SelectComponent],
    templateUrl: './blog-list.component.html',
    styleUrl: './blog-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@TraceClass()
export class BlogListComponent {
    private blogService = inject(BlogService);

    selectedTag: WritableSignal<string | null> = signal(null);

    posts: Signal<PostMetadata[]> = toSignal(this.blogService.getPostsMetadata(), { initialValue: [] });
    filteredPosts: Signal<PostMetadata[]> = computed(() => {
        return this.posts().filter((post) => {
            const selectedTag = this.selectedTag();
            if (selectedTag === null) {
                return true;
            }

            return post.tags.includes(selectedTag.replace(/\s*\(\d+\)/, '').trimEnd());
        });
    });
    tagOptions: Signal<string[]> = computed(() => {
        const tagsWithCount: Map<string, number> = new Map();
        this.posts().forEach((post) => {
            post.tags.forEach((tag) => {
                if (tagsWithCount.has(tag)) {
                    tagsWithCount.set(tag, tagsWithCount.get(tag)! + 1);
                } else {
                    tagsWithCount.set(tag, 1);
                }
            });
        });
        const options = Array.from(tagsWithCount.entries())
            .sort((a: [string, number], b: [string, number]) => {
                if (a[1] === b[1]) {
                    return a[0].localeCompare(b[0]);
                }

                return b[1] - a[1];
            })
            .map((tag: [string, number]) => {
                return `${tag[0]} (${tag[1]})`;
            });

        return options;
    });

    constructor() {
        inject(Title).setTitle('Developapa');
    }
}
