import React from 'react';
import { Link } from 'gatsby';

import { rhythm } from '../utils/typography';
import Image from 'gatsby-image';
import { useMediaQuery } from '@material-ui/core';
import headerImage from '../../static/header.png';
import footerSvg from '../../static/footer.svg';

function MediaQuery({ query, children }) {
  let result = useMediaQuery(query);
  return children(result);
}

class Layout extends React.Component {
  render() {
    const { location, title, children, logo } = this.props;
    const rootPath = `${__PATH_PREFIX__}/`;
    let header;

    if (
      location.pathname === rootPath ||
      location.pathname.startsWith('/tag/')
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
                <Link
                  style={{
                    boxShadow: `none`,
                    textDecoration: `none`,
                    color: `inherit`,
                  }}
                  to={`/`}
                >
                  {title}
                </Link>
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
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `minmax(0, 1fr) minmax(${rhythm(12)}, ${rhythm(
            26
          )}) minmax(0, 1fr)`,
          gridTemplateAreas:
            '"left-spacer header right-spacer" "left-spacer content right-spacer" "left-spacer footer right-spacer"',
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          minWidth: 0,
          backgroundImage:  `url(${headerImage}), url(${footerSvg})`,
          backgroundSize: 'contain, 100% 300px',
          backgroundPosition: 'right top, bottom left',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}
      >
        <div style={{ gridArea: 'left-spacer' }}> </div>
        <div style={{ gridArea: 'right-spacer' }}> </div>
        <header style={{ gridArea: 'header' }}>{header}</header>
        <main style={{ gridArea: 'content' }}>{children}</main>
        <footer style={{ gridArea: 'footer' }}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', height: '150px', alignItems: 'end'}}>
            <div>
              &copy; {new Date().getFullYear()}, Nicolas Gehlert
            </div>
            <div style={{textAlign: 'right'}}>
              See <a href={'https://simpleanalytics.com/developapa.com'} target="'blank" rel="noopener noreferrer">Statistics</a> for this blog
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default Layout;
