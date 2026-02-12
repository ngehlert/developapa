export interface CommentMetaData {
    name: string;
    date: string;
    slug: string;
}

export interface Comment extends CommentMetaData {
    markdownContent?: string;
    htmlContent: string;
}
