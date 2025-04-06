import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BlogService, PostMetadata } from '../blog.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-blog-list',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe], // Import DatePipe
    templateUrl: './blog-list.component.html',
    styleUrls: ['./blog-list.component.scss'],
})
export class BlogListComponent implements OnInit {
    private blogService = inject(BlogService);
    private titleService = inject(Title);

    posts$: Observable<PostMetadata[]> | undefined;

    ngOnInit(): void {
        this.titleService.setTitle('My Angular Blog'); // Set page title
        this.posts$ = this.blogService.getPostsMetadata();
    }
}
