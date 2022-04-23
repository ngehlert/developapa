import React from 'react';
import { graphql } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import Seo from '../components/seo';
import { rhythm } from '../utils/typography';
import { ThemeProvider } from '@material-ui/styles';
import { navigate } from 'gatsby';
import Chip from '@material-ui/core/Chip';
import { StyledLink } from '../components/styled-link';
import 'array-flat-polyfill';
import styled from 'styled-components';
import PostCard from './post-card';
import { Theme } from '../theme';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    console.log(data);
    const siteTitle = data.site.siteMetadata.title;
    const siteLogo = data.logo;
    const posts = data.posts.edges;
    const pageContext = this.props.pageContext;
    const tags = data.tags.edges
      .map((edge) => edge.node.frontmatter.tags)
      .flat();
    const numPages = this.props.pageContext.numPages;
    const currentPage = this.props.pageContext.currentPage;

    const getLocationWithoutPage = () => {
      const parts = this.props.location.pathname.split('/');
      const lastItem = parts.pop();

      if (isNaN(lastItem)) {
        parts.push(lastItem);
      }
      return parts.join('/');
    };

    return (
      <ThemeProvider theme={Theme}>
        <Layout
          location={this.props.location}
          title={siteTitle}
          logo={siteLogo}
          tags={tags}
        >
          {pageContext.tag !== undefined ? (
            <Seo title={`Posts with ${pageContext.tag} Tag`} />
          ) : (
            <Seo title="All posts" />
          )}
          <div style={{ position: `relative`, marginBottom: '36px' }}>
            <Bio />
            {pageContext.tag !== undefined ? (
              <div
                style={{
                  display: `flex`,
                  alignItems: `center`,
                  height: rhythm(1.5),
                  position: `absolute`,
                  bottom: rhythm(-1),
                }}
              >
                <div style={{ marginRight: rhythm(0.3) }}>
                  Articles with tag:{' '}
                </div>
                <Chip
                  label={pageContext.tag}
                  onDelete={() => {
                    navigate('/');
                  }}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              </div>
            ) : null}
          </div>
          {posts.map(({ node }) => {
            return <PostCard node={node} key={node.fields.slug} />;
          })}

          {numPages > 1 ? (
            <PagerContainer>
              {currentPage > 1 ? (
                <StyledLink to={`/${currentPage === 2 ? '' : currentPage - 1}`}>
                  &lt;
                </StyledLink>
              ) : null}
              {Array.from({ length: numPages }).map((_, index) => {
                const pageNumber = index + 1;
                const link =
                  pageNumber === 1
                    ? '/'
                    : `${getLocationWithoutPage()}/${pageNumber}`;
                return (
                  <StyledLink
                    to={link}
                    key={pageNumber}
                    style={{ fontWeight: 900 }}
                    activeStyle={{
                      color: Theme.palette.secondary[500],
                      fontWeight: 300,
                    }}
                  >
                    {pageNumber}
                  </StyledLink>
                );
              })}
              {currentPage < numPages ? (
                <StyledLink to={`/${currentPage + 1}`}>&gt;</StyledLink>
              ) : null}
            </PagerContainer>
          ) : null}
        </Layout>
      </ThemeProvider>
    );
  }
}

const PagerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;

  & > * {
    margin: 0 10px;
  }
`;

export default BlogIndex;

export const pageQuery = graphql`
  query indexQuery($skip: Int!, $limit: Int!, $tag: [String]) {
    logo: file(absolutePath: { regex: "/logo.png/" }) {
      childImageSharp {
        fluid(maxWidth: 200, maxHeight: 200) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    site {
      siteMetadata {
        title
      }
    }
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/blog/.*/.*.md$/" }
        frontmatter: { tags: { in: $tag } }
      }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            tags
            duration
          }
        }
      }
    }
    tags: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/blog/.*/.*.md$/" } }
    ) {
      edges {
        node {
          frontmatter {
            tags
          }
        }
      }
    }
  }
`;
