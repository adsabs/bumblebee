define([
  'underscore',
  'js/components/api_targets',
  'js/components/api_query',
  'js/components/api_request',
], function(_, ApiTargets, ApiQuery, ApiRequest) {
  const NAME = '__EXPORT_RESULTS_AS_BIBTEX__';

  const mixin = {
    /**
     *
     * Gets an array of documents and exposes a function on
     * the global object which, when called, will make a request
     * to `/export` to retrieve a bibtex string.
     *
     * This global method can't be called
     * more than once per cycle.
     *
     * @param {object[]} docs - array of documents
     */
    __exposeMetadata: function(docs = []) {
      window[NAME] = _.once(
        () =>
          new Promise((resolve, reject) => {
            const ids = docs.map((d) =>
              _.isArray(d.identifier) ? d.identifier[0] : d.identifier
            );
            const ps = this.getPubSub();
            const request = new ApiRequest({
              target: ApiTargets.EXPORT + 'bibtex',
              query: new ApiQuery({ bibcode: ids }),
              options: {
                type: 'POST',
                done: ({ export: bibtexString }) => {
                  resolve({ identifiers: ids, bibtexString });
                },
                fail: (ev) => reject(ev),
              },
            });
            ps.publish(ps.EXECUTE_REQUEST, request);
          })
      );
    },
  };

  return mixin;
});
