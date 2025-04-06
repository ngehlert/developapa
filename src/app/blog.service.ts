import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface PostMetadata {
    title: string;
    date: string; // Keep as string for simplicity, format in component
    description: string;
    slug: string;
}

export interface Post extends PostMetadata {
    markdownContent?: string; // Optional: if needed in component
    htmlContent: string;
}

@Injectable({
    providedIn: 'root',
})
export class BlogService {
    private http = inject(HttpClient);
    private postsMetaUrl = 'assets/blog-data/posts.json';
    private postsContentUrl = 'assets/blog-data/posts/'; // Base path

    getPostsMetadata(): Observable<PostMetadata[]> {
        // Fetch the pre-generated list of posts
        return this.http.get<PostMetadata[]>(this.postsMetaUrl);
        // Add error handling (e.g., using catchError) in a real app
    }

    getPost(slug: string): Observable<Post> {
        // Fetch the pre-generated content for a specific post
        const url = `${this.postsContentUrl}${slug}.json`;
        return this.http.get<Post>(url);
        // Add error handling (e.g., 404) in a real app
    }
}
