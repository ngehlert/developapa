import React from 'react';
import randomColor from 'randomcolor';
import TagCloud from 'react-tag-cloud';

class TagWordCloud extends React.Component {
  render() {
    const { tags } = this.props;
    const tagsWithFrequency = new Map();
    tags.forEach((tag) => {
      tagsWithFrequency.set(tag, (tagsWithFrequency.get(tag) || 0) + 1);
    });

    const getFontSize = (tag) => {
      return 5 + ((tagsWithFrequency.get(tag) || 0) / tags.length) * 200;
    };

    return (
      <TagCloud
        className='tag-cloud'
        style={{
          fontFamily: 'sans-serif',
          height: '400px',
          fontSize: 20,
          color: () => randomColor({
            hue: '#009688',
            luminosity: 'dark',
          }),
          padding: 5,
        }}
        rotate={() => {
          return Math.round(Math.random()) ? -90 : 0;
        }}
      >
        {Array.from(tagsWithFrequency.keys()).map((tag) => {
          console.log(getFontSize(tag));
          return (
            <div key={tag} style={{fontSize: getFontSize(tag)}}>{tag}</div>
          );
        })}
      </TagCloud>
    )
  }
}

export default TagWordCloud;
