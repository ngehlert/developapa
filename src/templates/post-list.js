import React from 'react';
import { graphql } from 'gatsby';
import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { rhythm } from '../utils/typography';
import slugify from '@sindresorhus/slugify';
import { createMuiTheme } from '@material-ui/core/styles';
import teal from '@material-ui/core/colors/teal';
import orange from '@material-ui/core/colors/orange';
import { ThemeProvider } from '@material-ui/styles';
import { navigate } from 'gatsby';
import Chip from '@material-ui/core/Chip';
import { StyledLink } from '../components/styled-link';
import 'array-flat-polyfill';
import styled from 'styled-components';

export const Theme = createMuiTheme({
  palette: {
    primary: teal,
    secondary: orange,
  },
});

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const siteLogo = data.logo;
    const posts = data.allMarkdownRemark.edges;
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
            <SEO title={`Posts with ${pageContext.tag} Tag`} />
          ) : (
            <SEO title="All posts" />
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
            const title = node.frontmatter.title || node.fields.slug;
            return (
              <div
                key={node.fields.slug}
                style={{
                  boxShadow: `0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)`,
                  padding: `12px`,
                  marginBottom: rhythm(1),
                  position: `relative`,
                  backgroundColor: '#ffffff',
                }}
              >
                <h3
                  style={{
                    marginBottom: rhythm(1 / 4),
                    marginTop: rhythm(1 / 4),
                  }}
                >
                  <StyledLink to={node.fields.slug}>{title}</StyledLink>
                </h3>
                <div
                  style={{
                    position: `absolute`,
                    top: rhythm(1 / 4),
                    right: rhythm(1 / 4),
                    fontSize: rhythm(0.5),
                  }}
                >
                  {node.frontmatter.date}
                </div>
                <div>
                  {node.frontmatter.tags.map((tag, index) => {
                    tag = tag.trim();
                    return (
                      <Chip
                        label={tag}
                        onClick={() => {
                          navigate(`/tag/${slugify(tag)}`);
                        }}
                        key={tag}
                        style={{ marginRight: '8px' }}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    );
                  })}
                </div>
                <hr
                  style={{
                    marginTop: rhythm(0.6),
                    marginBottom: rhythm(0.6),
                    width: `70%`,
                  }}
                />
                <p
                  dangerouslySetInnerHTML={{
                    __html: node.frontmatter.description || node.excerpt,
                  }}
                />
              </div>
            );
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
                    ? getLocationWithoutPage()
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
    allMarkdownRemark(
      filter: { frontmatter: { tags: { in: $tag } } }
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
    tags: allMarkdownRemark {
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
