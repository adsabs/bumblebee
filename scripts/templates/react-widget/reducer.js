define(['redux'], function({ combineReducers }) {
  const main = (state = {}, action) => {
    return state;
  };

  return combineReducers({
    main,
  });
});
