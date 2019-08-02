import React from "react";

import { rhythm } from "../utils/typography";

const Chip = (props) => {
  return (
    <div
      style={{
        display: 'inline-block',
        height: rhythm(0.8),
        fontSize: rhythm(0.45),
        fontWeight: '500',
        color: 'rgba(0,0,0,0.6)',
        lineHeight: rhythm(0.8),
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: rhythm(1 / 2),
        paddingRight: rhythm(1 / 2),
        borderRadius: rhythm(0.4),
        backgroundColor: '#e4e4e4',
        marginRight: rhythm(0.3),
      }}
    >
      {props.children}
    </div>
  );
};

export default Chip;
