window.reqs.filter(e => {
  return !(/(config|babel|es6)$/.test(e[1])) && !(/^\/\//.test(e[2]));
}).map(e => e[1]).join(',\n');
