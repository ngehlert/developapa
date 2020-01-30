import React from 'react';
import { rhythm } from '../utils/typography';
import { StyledLink } from '../components/styled-link';
import Chip from '@material-ui/core/Chip';
import { navigate } from 'gatsby';
import slugify from '@sindresorhus/slugify';

class PostCard extends React.Component {
  render() {
    const { node } = this.props;
    const title = node.frontmatter.title || node.fields.slug;
    return (
      <div
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
            marginTop: rhythm(0.6),
          }}
        >
          <StyledLink to={node.fields.slug}>{title}</StyledLink>
        </h3>
        <div
          style={{
            position: `absolute`,
            top: rhythm(1 / 6),
            right: rhythm(1 / 4),
            fontSize: rhythm(0.45),
            fontStyle: 'italic',
          }}
        >
          {node.frontmatter.date}
        </div>
        <div>
          {node.frontmatter.tags.map((tag) => {
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
  }
}

export default PostCard;
