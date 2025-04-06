const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // For frontmatter
const { marked } = require('marked'); // For Markdown parsing

const contentDir = path.join(__dirname, '..', 'src', 'content');
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'blog-data');
const postsListPath = path.join(outputDir, 'posts.json');
const postsContentDir = path.join(outputDir, 'posts');
const routesFilePath = path.join(__dirname, '..', 'routes.txt'); // For pre-rendering

console.log('Processing markdown files...');

// Ensure output directories exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(postsContentDir)) {
    fs.mkdirSync(postsContentDir, { recursive: true });
}

const postsMetadata = [];
const routesToPrerender = ['/blog']; // Start with the main blog list page

try {
    const files = getAllFiles(contentDir);
    console.log(files);

    files.forEach((file) => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const { data, content } = matter(fileContent); // Parse frontmatter and content

        // Basic validation
        if (!data.title || !data.date || !data.description || !data.tags) {
            console.warn(
                `WARN: Skipping ${file}. Missing required frontmatter (title, date, description, slug).`,
            );
            return;
        }

        const slug = data.slug || path.basename(path.dirname(file));
        // --- Store Metadata for the List ---
        const metadata = {
            title: data.title,
            date: data.date,
            description: data.description,
            slug,
        };
        postsMetadata.push(metadata);

        // --- Store Full Content for Individual Post Pages ---
        const postData = {
            ...metadata,
            markdownContent: content,
            htmlContent: marked(content, {renderer: getCustomRenderer()}),
        };

        const postOutputPath = path.join(
            postsContentDir,
            `${metadata.slug}.json`,
        );
        fs.writeFileSync(postOutputPath, JSON.stringify(postData, null, 2));
        console.log(`Generated content for: ${metadata.slug}.json`);

        // Add route to the list for pre-rendering
        routesToPrerender.push(`/blog/${metadata.slug}`);
    });

    // Sort posts by date (newest first)
    postsMetadata.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Write the list of posts metadata
    fs.writeFileSync(postsListPath, JSON.stringify(postsMetadata, null, 2));
    console.log(`Generated posts list: ${postsListPath}`);

    // Write the routes file for pre-rendering
    // currently doing this manually
    //  fs.writeFileSync(routesFilePath, routesToPrerender.join('\n'));
    // console.log(`Generated routes file for pre-rendering: ${routesFilePath}`);

    console.log('Markdown processing complete.');
} catch (error) {
    console.error('Error processing markdown files:', error);
    process.exit(1); // Exit with error code
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

function getCustomRenderer() {
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
