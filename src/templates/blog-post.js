import React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { rhythm, scale } from "../utils/typography";
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button"
import { Theme } from "../pages"
import { ThemeProvider } from '@material-ui/styles';
import * as axios from "axios"

class BlogPostTemplate extends React.Component {

  state = {
    commentName: '',
    commentMessage: '',
  };
  render() {
    console.log(this.props.data)
    const post = this.props.data.markdownRemark;
    const siteLogo = this.props.data.logo;
    const siteTitle = this.props.data.site.siteMetadata.title;
    const { previous, next } = this.props.pageContext;

    const divider = (<hr
      style={{
        marginBottom: rhythm(1),
      }}
    />);

    return (
      <ThemeProvider theme={Theme}>
        <Layout location={this.props.location} title={siteTitle} logo={siteLogo}>
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

          <h3>Add a comment</h3>
          <form
            autoComplete="off"
          >
            <TextField
              id="name"
              label="Name"
              value={this.state.commentName}
              onChange={(event) => {
                this.setState({
                  commentName: event.target.value,
                })
              }}
              margin="normal"
              variant="outlined"
              style={{width: rhythm(15)}}
            />
            <TextField
              id="comment"
              label="Comment"
              multiline
              rows="8"
              value={this.state.commentMessage}
              onChange={(event) => {
                this.setState({
                  commentMessage: event.target.value,
                })
              }}
              fullWidth
              margin="normal"
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={() => {
              this.saveComment();
            }}>
              Submit
            </Button>
          </form>

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
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
        </Layout>
      </ThemeProvider>
    );
  }

  async saveComment() {
    await axios.default.post(
      'https://dev.staticman.net/v3/entry/github/ngehlert/developapa/master/comments',
      {
        fields: {
          name: this.state.commentName,
          message: this.state.commentMessage,
          page: this.props.pageContext.slug.replace(/\//g, ''),
        },
      });
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!, $yamlSlug: String!) {
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
    markdownRemark(fields: { slug: { eq: $slug } }) {
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
    allYaml(filter: { page: { eq: $yamlSlug } }) {
      edges {
        node {
          id
          name
          message
          date
        }
      }
    }
  }
`;
