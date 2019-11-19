define(['underscore'], function(_) {
  /**
   * Take in an array of affiliations, and figure out which should be
   * selected
   *
   * @param {array} affs
   */
  const selectAffiliation = function(affs) {
    // check if there are more than 1, if not just select that one
    if (affs.length > 1) {
      // check if the first entry is a (None), if so, then find the first non-(None) entry
      if (affs[0].name === '-') {
        const idx = affs.findIndex((a) => a.name !== '-');
        if (idx) {
          return [
            ...affs.slice(0, idx),
            { ...affs[idx], selected: true },
            ...affs.slice(idx + 1),
          ];
        }
      }
    }
    return [{ ...affs[0], selected: true }];
  };

  /**
   * Parse and format author affiliation data
   *
   * This factory will create a new entry for the table that has an author and all
   * their corresponding affiliations and active dates.
   *
   * @param {string} author
   * @param {array} affs
   * @returns {{id: string, selected: boolean, author: *, affiliations: Array, lastActiveDates: Array}}
   */
  const authorAffiliationFactory = function(author, affs) {
    const out = {
      id: _.uniqueId(),
      selected: true,
      author: author,
      affiliations: [],
      lastActiveDates: [],
    };

    out.affiliations = selectAffiliation(
      affs.map((a, i) => ({
        id: _.uniqueId(),
        selected: false,
        name: a.affiliations.name,
        years: a.affiliations.years,
      }))
    );

    out.lastActiveDates = affs.map((a, i) => ({
      id: _.uniqueId(),
      selected: i === 0,
      date: a.affiliations.lastActiveDate,
    }));

    return out;
  };

  return {
    create: authorAffiliationFactory,
  };
});
