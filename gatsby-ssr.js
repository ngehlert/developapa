const React = require("react")
exports.onRenderBody = ({
    setPostBodyComponents,
  }) => {
  setPostBodyComponents([
    <script async defer src="https://api.developapa.com/app.js"/>,
    <noscript><img src="https://api.developapa.com/image.gif" alt=""/></noscript>
  ])
};
