import React from 'react';
import styled from 'styled-components';
import { rhythm } from '../utils/typography';
import Image from 'gatsby-image';
import { useMediaQuery } from '@material-ui/core';
import headerImage from '../../static/header.png';
import footerSvg from '../../static/footer.svg';
import SideMenu from './side-menu';
import { StyledLink } from './styled-link';

function MediaQuery({ query, children }) {
  let result = useMediaQuery(query);
  return children(result);
}

class Layout extends React.Component {
  render() {
    const { location, title, children, logo, tags } = this.props;
    const rootPath = `${__PATH_PREFIX__}/`;
    let header;
    const pagePattern = `${rootPath}[\\W\\d]+`;

    if (
      location.pathname === rootPath ||
      location.pathname.startsWith('/tag/') ||
      location.pathname.match(new RegExp(pagePattern))
    ) {
      header = (
        <div
          style={{
            marginBottom: rhythm(1.5),
            marginTop: 0,
            display: 'grid',
            gridTemplateColumns: '1fr minmax(100px, 250px)',
            alignItems: 'end',
          }}
        >
          <MediaQuery query="(max-width:700px)">
            {(query) => (
              <h1
                style={{
                  fontSize: query ? '12vw' : '84px',
                  marginBottom: 0,
                  fontFamily: 'Poiret One, serif',
                }}
              >
                <StyledLink
                  style={{
                    color: `inherit`,
                  }}
                  to={`/`}
                >
                  {title}
                </StyledLink>
              </h1>
            )}
          </MediaQuery>
          <Image
            fluid={logo.childImageSharp.fluid}
            alt="Blog logo"
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: 0,
            }}
            imgStyle={{}}
          />
        </div>
      );
    } else {
      header = (
        <h3
          style={{
            marginTop: 0,
            fontFamily: 'Poiret One, serif',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <StyledLink
            style={{
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </StyledLink>

          <Image
            fixed={logo.childImageSharp.fixed}
            alt="Blog logo"
            style={{
              marginRight: rhythm(1 / 2),
              marginBottom: 0,
              minWidth: 50,
              width: `80px`,
              height: `80px`,
            }}
            imgStyle={{}}
          />
        </h3>
      );
    }
    return (
      <AppLayout tags={tags}>
        <TagCloudArea>
          <div> </div>
          {tags !== undefined ? <SideMenu tags={tags} /> : <></>}{' '}
        </TagCloudArea>
        <div style={{ gridArea: 'right-spacer' }}> </div>
        <header style={{ gridArea: 'header' }}>{header}</header>
        <main style={{ gridArea: 'content' }}>{children}</main>
        <footer style={{ gridArea: 'footer' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              height: '150px',
              alignItems: 'end',
            }}
          >
            <div>&copy; {new Date().getFullYear()}, Nicolas Gehlert</div>
            <div style={{ textAlign: 'right' }}>
              See{' '}
              <a
                href={'https://simpleanalytics.com/developapa.com'}
                target="'blank"
                rel="noopener noreferrer"
              >
                Statistics
              </a>{' '}
              for this blog
            </div>
          </div>
        </footer>
      </AppLayout>
    );
  }
}

const AppLayout = styled.div`
  display: grid;
  grid-template-columns:
    minmax(${(props) => (props.tags !== undefined ? '350px' : '0')}, 1fr)
    minmax(${rhythm(12)}, ${rhythm(26)}) minmax(0, 1fr);
  grid-template-areas: 'left-header-spacer header right-spacer' 'tag-cloud content right-spacer' 'left-footer-spacer footer right-spacer';
  padding: ${rhythm(1.5)} ${rhythm(3 / 4)};
  min-width: 0;
  background-image: url(${headerImage}), url(${footerSvg});
  background-size: contain, 100% 300px;
  background-position: right top, bottom left;
  background-repeat: no-repeat, no-repeat;

  @media (max-width: 1000px) {
    grid-template-columns: 0 1fr 0;
  }
  
  pre[class*="language-"]>code {
    border-left-width: 2px;
  }
  
  pre[class*="language-"].line-numbers.line-numbers .line-numbers-rows {
    left: 8px !important;
  }
  pre[class*="language-"].line-numbers.line-numbers code {
    padding-left: 2.8em;
  }

  a {
    box-shadow: none;
  }
`;

const TagCloudArea = styled.div`
  grid-area: tag-cloud;
  grid-template-columns: minmax(0, 1fr) minmax(350px, 400px);
  display: grid;

  @media (max-width: 1000px) {
    display: none;
  }
`;

export default Layout;
