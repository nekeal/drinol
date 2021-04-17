const path = require("path");
const BundleTracker = require("webpack-bundle-tracker");

module.exports = {
  webpack: function (config, env) {
    config.plugins.push(
      new BundleTracker({
        path: __dirname,
        filename:
          env === "production"
            ? "./webpack-stats.json"
            : "./webpack-stats-dev.json",
      })
    );
    return config;
  },
};
