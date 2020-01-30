const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);
const slugify = require('@sindresorhus/slugify');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const confinGdprPage = path.resolve('./src/pages/gdpr-confin.js');
  const blogPost = path.resolve(`./src/templates/post-entry.js`);
  const indexPage = path.resolve(`./src/templates/post-list.js`);
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          filter: {fileAbsolutePath: {regex: "/blog\\\\/.*\\\\/.*\\\\.md$/"}}
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                tags
                date
              }
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  const tagsWithFrequency = new Map();
  const postsPerPage = 6;
  const numPages = Math.ceil(posts.length / postsPerPage);

  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? `/` : `/${i + 1}`,
      component: indexPage,
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
      },
    });
  });

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;
    post.node.frontmatter.tags.forEach((tag) => {
      tagsWithFrequency.set(
        tag.trim(),
        (tagsWithFrequency.get(tag.trim()) || 0) + 1
      );
    });

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });

  Array.from(tagsWithFrequency.keys()).forEach((tag) => {
    const numTagPages = Math.ceil(tagsWithFrequency.get(tag) / postsPerPage);
    const path = `/tag/${slugify(tag)}`;

    Array.from({ length: numTagPages }).forEach((_, i) => {
      createPage({
        path: i === 0 ? path : `${path}/${i + 1}`,
        component: indexPage,
        context: {
          tag,
          limit: postsPerPage,
          skip: i * postsPerPage,
          numPages: numTagPages,
          currentPage: i + 1,
        },
      });
    });
  });

  createPage({
    path: `/confin/gdpr`,
    component: confinGdprPage,
    context: {},
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    console.log(node, getNode);
    const slug = createFilePath({ node, getNode });
    const collection = getNode(node.parent).sourceInstanceName;
    createNodeField({
      name: `slug`,
      node,
      value: slug,
    });
    createNodeField({
      name: `collection`,
      node,
      value: collection,
    });
  }
};
