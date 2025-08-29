/**
 *
 * Purpose: Increase Workbox's maximum precache file size to support offline functionality.
 *
 * Only applied in production builds. Finds the CRA service worker plugin
 * (InjectManifest or GenerateSW) and sets maximumFileSizeToCacheInBytes
 * to 15 MB so larger assets (e.g., map tiles or big chunks... in our case Plot page) can be cached.
 *
 * Alternative solution: ejecting CRA would give direct access to webpack
 * and Workbox configs, allowing this change without CRACO, but ejecting
 * makes future CRA updates harder and requires managing all configs manually.
 *
 */

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      // Only tweak Workbox in production builds
      if (env === "production") {
        const workboxPlugin = webpackConfig.plugins.find(
          (plugin) =>
            plugin.constructor.name === "InjectManifest" ||
            plugin.constructor.name === "GenerateSW"
        );

        if (workboxPlugin && workboxPlugin.config) {
          // Increase precache size limit (default = 5MB)
          workboxPlugin.config.maximumFileSizeToCacheInBytes = 15 * 1024 * 1024; // 15MB
        }
      }
      return webpackConfig;
    },
  },
};
