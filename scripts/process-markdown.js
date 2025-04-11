const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const contentDir = path.join(__dirname, '..', 'src', 'content');
const commentDir = path.join(__dirname, '..', 'src', 'comments');
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'blog-data');
const postsListPath = path.join(outputDir, 'posts.json');
const postsContentDir = path.join(outputDir, 'posts');

console.log('Processing markdown files...');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(postsContentDir)) {
    fs.mkdirSync(postsContentDir, { recursive: true });
}

const postsMetadata = [];
const routesToPrerender = ['/blog'];

try {
    const files = getAllFiles(contentDir);

    files.forEach((file) => {
        const { data, content } = getFrontmatterContent(file);

        if (!data.title || !data.date || !data.description || !data.tags) {
            console.warn(`WARN: Skipping ${file}. Missing required frontmatter (title, date, description, slug).`);
            return;
        }

        const slug = data.slug || path.basename(path.dirname(file));
        const metadata = {
            title: data.title,
            date: data.date,
            description: data.description,
            tags: data.tags,
            slug,
            comments: getComments(slug),
        };
        postsMetadata.push(metadata);

        const postData = {
            ...metadata,
            markdownContent: content,
            htmlContent: marked(content, {renderer: getCustomRenderer(slug)}),
        };

        const postOutputPath = path.join(
            postsContentDir,
            `${metadata.slug}.json`,
        );
        fs.writeFileSync(postOutputPath, JSON.stringify(postData, null, 2));
        console.log(`Generated content for: ${metadata.slug}.json`);

        routesToPrerender.push(`/blog/${metadata.slug}`);
    });

    postsMetadata.sort(sortDateDescending);

    fs.writeFileSync(postsListPath, JSON.stringify(postsMetadata, null, 2));
    console.log(`Generated posts list: ${postsListPath}`);
    console.log('Markdown processing complete.');
} catch (error) {
    console.error('Error processing markdown files:', error);
    process.exit(1);
}

function getFrontmatterContent(file) {
    const fileContent = fs.readFileSync(file, 'utf8');
    return matter(fileContent);
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else if (file.endsWith('.md')) {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

function sortDateDescending(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function getComments(slug) {
    const postCommentDir = path.join(commentDir, slug);
    if (!fs.existsSync(postCommentDir)) {
        return [];
    }

    const commentFiles = getAllFiles(postCommentDir);

    const comments = [];
    commentFiles.forEach((file) => {
        const { data, content } = getFrontmatterContent(file);
        if (!data.name || !data.date || !data.slug) {
            console.warn(`WARN: Skipping ${file}. Missing required frontmatter (name, date, slug).`);
            return;
        }

        if (`/${slug}/` !== data.slug) {
            console.warn('comment is in the wrong directory', data.name);
            return;
        }

        const commentData = {
            name: data.name,
            date: data.date,
            markdownContent: content,
            htmlContent: marked(content),
        };
        comments.push(commentData);
    });

    return comments.sort(sortDateDescending);
}

function getCustomRenderer(slug) {
    const renderer = new marked.Renderer();
    const originalImageRenderer = renderer.image;

    renderer.image = ({ href, title, text }) => {
        // Check if the href is an absolute URL (starts with http, https, //)
        // Or if it's already an absolute path within the site (starts with /)
        if (/^(https?:)?\/\//.test(href) || href.startsWith('/')) {
            return originalImageRenderer.call(renderer, href, title, text);
        }

        const newHref = `/assets/content/${slug}/${href}`;

        // Construct the image tag with the new path
        return `<img src="${newHref}" alt="${text}"${title ? ` title="${title}"` : ''}>`;
    };

    return renderer;
}
