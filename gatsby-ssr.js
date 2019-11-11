const React = require("react")
exports.onRenderBody = ({
    setPostBodyComponents,
  }) => {
  setPostBodyComponents([
    <script key="post body key 1" async defer src="https://api.developapa.com/app.js"/>,
    <noscript key="post body key 2"><img src="https://api.developapa.com/image.gif" alt=""/></noscript>
  ])
};
