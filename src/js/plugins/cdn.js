define([], function() {
  const CDN_URL = 'https://ads-assets.pages.dev';

  const normalize = (moduleName) => {
    try {
      const parts = moduleName.split('!');
      return parts[parts.length - 1].split('?')[0];
    } catch (e) {
      return moduleName;
    }
  };

  const cdn = {
    load: function(name, req, onload) {
      const path = normalize(name);
      console.log({ name, req, url: path })
      req(
        [`${CDN_URL}/${path}.js`],
        function(module) {
          onload(module);
        },
        function() {
          req([name], function(module) {
            onload(module);
          });
        }
      );
    },
  };

  return cdn;
});
