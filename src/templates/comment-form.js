/*global Sentry*/
import * as axios from 'axios';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { rhythm } from '../utils/typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { green, red } from '@material-ui/core/colors';
import Snackbar from '@material-ui/core/Snackbar';

class CommentForm extends React.Component {
  state = {
    commentName: '',
    commentMessage: '',
    honeypot: '',
    gdpr: false,
    isLoading: false,
    showSuccessSnackbar: false,
    showErrorSnackbar: false,
  };

  async saveComment(event) {
    event.preventDefault();
    this.setState({ isLoading: true });
    try {
      await axios.default.post(
        '/',
        encode({
          name: this.state.commentName,
          comment: this.state.commentMessage,
          gdpr: this.state.gdpr,
          slug: this.props.pageContext.slug,
          'bot-field': this.state.honeypot,
          'form-name': 'comment-form',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      this.setState({
        commentName: '',
        commentMessage: '',
        gdpr: false,
        showSuccessSnackbar: true,
      });
    } catch (error) {
      this.setState({ showErrorSnackbar: true });
      Sentry.captureException(error);
    }
    this.setState({ isLoading: false });
  }

  render() {
    return (
      <div>
        <h4>Add a comment</h4>
        <form
          autoComplete="off"
          name="comment-form"
          method="post"
          onSubmit={(event) => {
            this.saveComment(event);
          }}
          data-netlify-honeypot="bot-field"
          data-netlify="true"
        >
          <div style={{ display: 'none' }}>
            <label>
              Don’t fill this out if you're human:{' '}
              <input
                name="bot-field"
                value={this.state.honeypot}
                onChange={(event) => {
                  this.setState({
                    honeypot: event.target.value,
                  });
                }}
              />
            </label>
          </div>
          <input type="hidden" name="form-name" value="comment-form" />
          <input type="hidden" name="slug" value="blog-page" />
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
      </div>
    )
  }

}

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

const StyledTextField = styled(TextField)`
  width: ${rhythm(15)};

  @media (max-width: 600px) {
    width: 100%;
  }
`;

export default CommentForm;
