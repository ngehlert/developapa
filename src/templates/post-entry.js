import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { rhythm, scale } from '../utils/typography';
import { Theme } from './post-list';
import { ThemeProvider } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import Bio from '../components/bio';
import { StyledLink } from '../components/styled-link';
import CommentForm from './comment-form';
import CommentCard from './comment-card';

class BlogPostTemplate extends React.Component {
  render() {
    const comments = this.props.data.comments.edges;
    const post = this.props.data.post;
    const siteLogo = this.props.data.logo;
    const siteTitle = this.props.data.site.siteMetadata.title;
    const { previous, next } = this.props.pageContext;

    const divider = (
      <hr
        style={{
          marginBottom: rhythm(1),
        }}
      />
    );

    return (
      <ThemeProvider theme={Theme}>
        <Layout
          location={this.props.location}
          title={siteTitle}
          logo={siteLogo}
        >
          {divider}
          <SEO
            title={post.frontmatter.title}
            description={post.frontmatter.description || post.excerpt}
          />
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {post.frontmatter.date}
          </p>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          {divider}
          <Bio />
          <CommentForm pageContext={this.props.pageContext} />
          <h4>Comments</h4>

          {comments
            .sort((entryA, entryB) => {
              return new Date(entryA.node.frontmatter.date).valueOf() - new Date(entryB.node.frontmatter.date).valueOf();
            })
            .map(({ node }) => {
              return <CommentCard node={node} key={node.id} />;
            })
          }
          {comments.length === 0 ? (
            <Typography variant="body1" color="textSecondary" component="p">
              There are no comments available for this blog post yet
            </Typography>
          ) : null}

          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              padding: 0,
            }}
          >
            <li>
              {previous && (
                <StyledLink to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </StyledLink>
              )}
            </li>
            <li>
              {next && (
                <StyledLink to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </StyledLink>
              )}
            </li>
          </ul>
        </Layout>
      </ThemeProvider>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    logo: file(absolutePath: { regex: "/logo.png/" }) {
      childImageSharp {
        fixed(width: 200, height: 200) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        title
        author
      }
    }
    post: markdownRemark(
      fields: { slug: { eq: $slug }, collection: { eq: "blog" } }
    ) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tags
        duration
      }
    }
    comments: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "comments" } }
        frontmatter: { slug: { eq: $slug } }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            name
          }
        }
      }
    }
  }
`;
