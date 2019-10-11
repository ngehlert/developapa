const React = require("react")
exports.onRenderBody = ({
    setPostBodyComponents,
  }) => {
  setPostBodyComponents([
    <script async defer src="https://cdn.simpleanalytics.io/hello.js"/>,
    <noscript><img src="https://api.simpleanalytics.io/hello.gif" alt=""/></noscript>
  ])
}
