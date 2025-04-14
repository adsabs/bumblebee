define(['./actions', '../shared/helpers'], function(
  { CHECK_BIBCODES },
  { middleware }
) {
  const checkBibcodes = middleware(({ action, next, trigger }) => {
    next(action);

    if (
      action.type === CHECK_BIBCODES &&
      Array.isArray(action.payload) &&
      action.payload.length > 0
    ) {
      const query = action.payload.reduce((acc, id, i, arr) => {
        if (i === 0) {
          acc = 'identifier:(';
        }
        if (i === arr.length - 1) {
          acc += `${id})`;
        } else {
          acc += `${id} OR `;
        }
        return acc;
      }, '');
      trigger('doSearch', query, () => {});
    }
  });

  return { checkBibcodes };
});
