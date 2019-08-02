import React from "react";
import { Link } from "gatsby";

import { rhythm, scale } from "../utils/typography";
import Image from "gatsby-image";

class Layout extends React.Component {
  render() {
    const { location, title, children, logo } = this.props;
    const rootPath = `${__PATH_PREFIX__}/`;
    let header;

    if (location.pathname === rootPath) {
      header = (
        <h1
          style={{
            ...scale(1.7),
            marginBottom: rhythm(1.5),
            marginTop: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "Poiret One, serif",
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
            }}
            imgStyle={{}}
          />
        </h1>
      );
    } else {
      header = (
        <h3
          style={{
            marginTop: 0,
            fontFamily: "Poiret One, serif",
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
        </h3>
      );
    }
    return (
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(26),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <header>{header}</header>
        <main>{children}</main>
        <footer>© {new Date().getFullYear()}, Nicolas Gehlert</footer>
      </div>
    );
  }
}

export default Layout;
