import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, PostMetadata } from './post';

@Injectable({
    providedIn: 'root',
})
export class BlogService {
    private http = inject(HttpClient);
    private postsMetaUrl = 'assets/blog-data/posts.json';
    private postsContentUrl = 'assets/blog-data/posts/';

    getPostsMetadata(): Observable<PostMetadata[]> {
        return this.http.get<PostMetadata[]>(this.postsMetaUrl);
    }

    getPost(slug: string): Observable<Post> {
        const url = `${this.postsContentUrl}${slug}.json`;
        return this.http.get<Post>(url);
    }
}
