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
      console.log('CDN Loader', { name, normalized: normalize(name), req, onload, _: this });

      if (process.env.NODE_ENV === 'development') {
        return req([name], function(module) {
          onload(module);
        }, function (err) {
          console.error('Problem loading module', { moduleName: name }, err);
          if (onload.error) {
            onload.error(err);
          }
        });
      }

      const path = normalize(name);
      req(
        [`${CDN_URL}/${path}.js`],
        function(module) {
          onload(module);
        },
        function() {
          req([name], function(module) {
            onload(module);
          });
        },
        function (err) {
          console.error('Problem loading module', { moduleName: name, normalizedName: path }, err);
          if (onload.error) {
            onload.error(err);
          }
        }
      );
    },
  };

  return cdn;
});
