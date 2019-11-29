import React from 'react';
import styled from 'styled-components';
import { graphql, useStaticQuery } from 'gatsby';
import slugify from '@sindresorhus/slugify';
import { TagCloud } from 'react-tagcloud';
import { rhythm } from '../utils/typography';
import { StyledLink } from './styled-link';

const SideMenu = (props) => {
  const stickyPostQuery = useStaticQuery(graphql`
    query StickyPostQuery {
      allMarkdownRemark(
        filter: { frontmatter: { sticky: { eq: true } } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            fields {
              slug
            }
            id
            frontmatter {
              title
              date
            }
          }
        }
      }
    }
  `);
  const stickyPosts = stickyPostQuery.allMarkdownRemark.edges;
  const { tags } = props;

  const tagsWithFrequency = new Map();
  tags.forEach((tag) => {
    tagsWithFrequency.set(tag, (tagsWithFrequency.get(tag) || 0) + 1);
  });

  const data = Array.from(tagsWithFrequency.keys()).map((key) => {
    return {
      value: key,
      count: tagsWithFrequency.get(key),
    };
  });

  let seed = 1337;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  return (
    <div style={{ marginTop: '112px' }}>
      <Header>Tag Cloud</Header>
      <TagCloud
        minSize={14}
        maxSize={30}
        tags={data}
        colorOptions={{
          hue: '#009688',
          luminosity: 'dark',
        }}
        renderer={tagRenderer}
        randomNumberGenerator={random}
        style={{ marginBottom: rhythm(1.5) }}
      />
      <Header>Sticky Posts</Header>
      <StickyList>
        {stickyPosts.map((post) => (
          <li style={{ paddingLeft: '12px' }} key={post.node.id}>
            <StyledLink to={post.node.fields.slug}>
              {post.node.frontmatter.title}
            </StyledLink>
          </li>
        ))}
      </StickyList>
    </div>
  );
};

function tagRenderer(tag, size, color) {
  return (
    <StyledLink
      to={`/tag/${slugify(tag.value)}`}
      key={tag.value}
      style={{
        color,
        fontSize: `${size}px`,
        display: 'inline-block',
        padding: '0 12px',
      }}
    >
      {tag.value}
    </StyledLink>
  );
}

const Header = styled.p`
  font-family: Poiret One, serif;
  padding: 0 12px 6px 12px;
  margin-right: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const StickyList = styled.ul`
  list-style: none;
`;

export default SideMenu;
