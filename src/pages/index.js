import React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { rhythm } from "../utils/typography";
import Chip from "../components/chip"
import slugify from '@sindresorhus/slugify';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const siteLogo = data.logo;
    const posts = data.allMarkdownRemark.edges;
    const pageContext = this.props.pageContext;

    return (
      <Layout location={this.props.location} title={siteTitle} logo={siteLogo}>
        {pageContext.tag !== undefined ? (
          <SEO title={`Posts with ${pageContext.tag} Tag`} />
          ): (
          <SEO title="All posts" />
        )}
        <div style={{position: `relative`, marginBottom: rhythm(2)}}>
          <Bio />
          {pageContext.tag !== undefined ? (
            <div style={{
              display: `flex`,
              alignItems: `center`,
              height: rhythm(1.5),
              position: `absolute`,
              bottom: rhythm(-1.5),
            }}>
              <div style={{marginRight: rhythm(0.3)}}>Articles with tag: </div><Chip>{pageContext.tag}</Chip>
            </div>
          ) : null}
        </div>
        {posts
          .filter(({node}) => {
            if (pageContext.tag === undefined) {
              return true;
            }
            return node.frontmatter.tags.split(',').includes(pageContext.tag);
          })
          .map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug;
          return (
            <div
              key={node.fields.slug}
              style={{
                boxShadow: `0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)`,
                padding: `12px`,
                marginBottom: rhythm(1),
                position: `relative`,
              }}
            >
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                  marginTop: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </h3>
              <div style={{
                position: `absolute`,
                top: rhythm(1 / 4),
                right: rhythm(1 / 4),
                fontSize: rhythm(0.5),
              }}>{node.frontmatter.date}</div>
              <div>
                {node.frontmatter.tags.split(',').map((tag, index) => {
                  return (<Chip key={index}><Link style={{ boxShadow: `none`, color: 'rgba(0,0,0,0.6)' }} to={`/tag/${slugify(tag)}`}>{tag}</Link></Chip>);
                })}
              </div>
              <hr style={{
                marginTop: rhythm(0.6),
                marginBottom: rhythm(0.6),
                width: `70%`,
              }}/>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </div>
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
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
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
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
  }
`;
