define([], function() {
  const actions = {
    SET_BIBCODE: 'SET_BIBCODE',
    SET_FORM: 'SET_FORM',

    CHECK_BIBCODES: 'CHECK_BIBCODES',
  };

  const actionCreators = {
    setBibcode: (payload) => ({ type: actions.SET_BIBCODE, payload }),
    setForm: (payload) => ({ type: actions.SET_FORM, payload }),
    checkBibcodes: (payload) => ({
      type: actions.CHECK_BIBCODES,
      payload,
    }),
  };

  return { ...actions, ...actionCreators };
});
