import React from "react";
import { Link, graphql } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { rhythm, scale } from "../utils/typography";
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button"
import { Theme } from "../pages"
import { ThemeProvider } from '@material-ui/styles';
import * as axios from "axios"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Checkbox from "@material-ui/core/Checkbox"
import FormGroup from "@material-ui/core/FormGroup"

class BlogPostTemplate extends React.Component {

  state = {
    commentName: '',
    commentMessage: '',
    gdpr: false,
  };
  render() {
    const comments = this.props.data.allYaml.edges.filter(({node}) => {
      return node.id !== '42227bed-71a8-5a8b-9c94-1b846ee0fdf7';
    });
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
          <h4>Comments</h4>

          {comments
            .sort(({node: nodeA}, {node: nodeB}) => {
              return nodeA.date - nodeB.date;
            })
            .map(({node}) => {
              const options = {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false,
              };

              return (
                <div key={node.id} style={{marginBottom: rhythm(1)}}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2">
                        {node.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" component="p">
                        {new Intl.DateTimeFormat('en-US', options).format(node.date * 1000)}
                      </Typography>
                      <Typography variant="body1" component="p">
                        {node.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              )
            })
          }
          {comments.length === 0 ? (
            <Typography variant="body1" color="textSecondary" component="p">
              There are no comments available for this blog post yet
            </Typography>
          ): (null)}

          <h4>Add a comment</h4>
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
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.gdpr}
                    onChange={(event) => {
                      this.setState({
                        gdpr: event.target.checked,
                      })
                    }}
                    value="checkedGdpr"
                    color="primary"
                  />
                }
                label="I agree that my name will be stored in connection with my comment and will be visible to others after a review. To change/delete the comment later please contact me via mail at info [at] ngehlert.de"
              />
            </FormGroup>
            <Button disabled={!this.state.gdpr} style={{marginTop: rhythm(1)}} variant="contained" color="primary" onClick={() => {
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
