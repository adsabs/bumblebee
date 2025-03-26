define(['redux', 'js/react/FeedbackForms/actions', 'js/react/FeedbackForms/models/index'], function(
  { combineReducers },
  { SET_BIBCODE, SET_FORM },
  { FORMS }
) {
  const mainState = {
    bibcode: null,
    form: 'missingreferences',
  };
  const main = (state = mainState, action) => {
    switch (action.type) {
      case SET_BIBCODE:
        return { ...state, bibcode: action.payload };
      case SET_FORM:
        return {
          ...state,
          form: FORMS[action.payload] ? FORMS[action.payload] : state.form,
        };
      default:
        return state;
    }
  };

  const userState = {
    email: null,
  };
  const user = (state = userState, action) => {
    // action will be USER_ANNOUNCEMENT/...
    const [, type] = action.type.split('/');

    switch (type) {
      case 'user_signed_in':
        return { ...state, email: action.payload };
      case 'user_signed_out':
        return { ...state, email: null };
      default:
        return state;
    }
  };

  return combineReducers({
    main,
    user,
  });
});
