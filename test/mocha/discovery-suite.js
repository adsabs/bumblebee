define([
  './core-suite',
  './ui-suite',
  './qb-suite',
  './orcid-suite',
  './wraps-suite'
], function(
  core,
  ui,
  qb,
  orcid
  ) {


  return core.concat(ui).concat(qb).concat(orcid);
});