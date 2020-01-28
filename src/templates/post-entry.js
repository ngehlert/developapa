import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';
import { rhythm, scale } from '../utils/typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Theme } from './post-list';
import { ThemeProvider } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import { green, red } from '@material-ui/core/colors';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Bio from '../components/bio';
import { StyledLink } from '../components/styled-link';
import styled from 'styled-components';

class BlogPostTemplate extends React.Component {
  state = {
    commentName: '',
    commentMessage: '',
    gdpr: false,
    isLoading: false,
    showSuccessSnackbar: false,
    showErrorSnackbar: false,
  };

  render() {
    const comments = this.props.data.allYaml.edges;
    const post = this.props.data.markdownRemark;
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
          <h4>Comments</h4>

          {comments
            .sort(({ node: nodeA }, { node: nodeB }) => {
              return nodeA.date - nodeB.date;
            })
            .map(({ node }) => {
              const dateOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
              };

              return (
                <div key={node.id} style={{ marginBottom: rhythm(1) }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2">
                        {node.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        {new Intl.DateTimeFormat('en-US', dateOptions).format(
                          node.date * 1000
                        )}
                      </Typography>
                      <Typography
                        variant="body1"
                        component="p"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {node.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          {comments.length === 0 ? (
            <Typography variant="body1" color="textSecondary" component="p">
              There are no comments available for this blog post yet
            </Typography>
          ) : null}

          <h4>Add a comment</h4>
          <form autoComplete="off" method="post" data-netlify-recaptcha="true" data-netlify-honeypot="bot-field" data-netlify="true">
            <div style={{display: 'none'}}>
              <label>Don’t fill this out if you're human: <input name="bot-field"/></label>
            </div>
            <input type="hidden" name="form-name" value="comments" />
            <StyledTextField
              id="name"
              label="Name"
              name="name"
              value={this.state.commentName}
              onChange={(event) => {
                this.setState({
                  commentName: event.target.value,
                });
              }}
              margin="normal"
              variant="outlined"
            />
            <StyledTextField
              id="comment"
              label="Comment"
              name="comment"
              multiline
              rows="8"
              value={this.state.commentMessage}
              onChange={(event) => {
                this.setState({
                  commentMessage: event.target.value,
                });
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
                      });
                    }}
                    name="gdpr"
                    value="checkedGdpr"
                    color="primary"
                  />
                }
                label="I agree that my name will be stored in connection with my comment and will be visible to others after a review. To change/delete the comment later please contact me via mail at info [at] ngehlert.de"
              />
            </FormGroup>
            <div
              style={{
                marginTop: rhythm(1),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div data-netlify-recaptcha="true"></div>
              <Button
                disabled={
                  !this.state.gdpr ||
                  !this.state.commentName.length ||
                  !this.state.commentMessage ||
                  this.state.isLoading
                }
                variant="contained"
                color="primary"
                type="submit"
              >
                Submit
              </Button>
              {this.state.isLoading ? (
                <CircularProgress size={24} style={{ marginLeft: '8px' }} />
              ) : null}
            </div>
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
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={
              this.state.showSuccessSnackbar || this.state.showErrorSnackbar
            }
            autoHideDuration={3000}
            onClose={() => {
              this.setState({
                showSuccessSnackbar: false,
                showErrorSnackbar: false,
              });
            }}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
          >
            {this.state.showSuccessSnackbar ? (
              <SnackbarContent
                style={{
                  backgroundColor: green[500],
                }}
                message={
                  <span id="message-id">Comment successfully submitted</span>
                }
              />
            ) : this.state.showErrorSnackbar ? (
              <SnackbarContent
                style={{
                  backgroundColor: red[500],
                }}
                message={
                  <span id="message-id">
                    There was a problem submitting your comment
                  </span>
                }
              />
            ) : null}
          </Snackbar>
        </Layout>
      </ThemeProvider>
    );
  }
}

const StyledTextField = styled(TextField)`
  width: ${rhythm(15)};

  @media (max-width: 600px) {
    width: 100%;
  }
`;

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
