import React from 'react';
import randomColor from 'randomcolor';
import TagCloud from 'react-tag-cloud';

class TagWordCloud extends React.Component {
  render() {
    return (
      <TagCloud
        className='tag-cloud'
        style={{
          fontFamily: 'sans-serif',
          height: '400px',
          fontSize: 20,
          color: () => randomColor({
            hue: 'blue'
          }),
          padding: 5,
        }}>
        <div>Gobots</div>
        <div>Thundercats</div>
        <div>M.A.S.K.</div>
        <div>GI Joe</div>
        <div>Inspector Gadget</div>
        <div>Bugs Bunny</div>
        <div>Tom & Jerry</div>
        <div>Cowboy Bebop</div>
        <div>Evangelion</div>
        <div>Bleach</div>
        <div>GITS</div>
        <div>Pokemon</div>
        <div>She Ra</div>
        <div>Fullmetal Alchemist</div>
        <div>Gundam</div>
        <div>Uni Taisen</div>
        <div>Pinky and the Brain</div>
        <div>Bobs Burgers</div>
      </TagCloud>
    )
  }
}

export default TagWordCloud;
