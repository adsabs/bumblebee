define(['underscore', 'jquery-ui', 'jquery', 'moment'], function(
  _,
  $ui,
  $,
  moment
) {
  var Utils = {
    /**
     * Receives the  ISO8601 date string (actually, browsers will be able to parse
     * range of date strings, but you should be careful and not count on that!)
     *
     * And returns a string in requested format; when the minute is set to 0,
     * we will that the month was not given (ADS didn't know about it)
     *
     * @param dateString
     *    string in ISO8601 format
     * @param format
     *    string, jquery-ui datepicker for options
     * @param options
     * @returns {*}
     */
    formatDate: function(dateString, options = {}) {
      const { format = 'YYYY/MM', missing: missingOpts = {} } = options;

      const missing = {
        day: 'YYYY/MM',
        month: 'YYYY',
        dayAndMonth: 'YYYY',
        ...missingOpts,
      };

      // break apart date
      const regex = /^(?<year>\d{4})-(?<month>\d{2}|00)-(?<day>\d{2}|00)$/;
      const match = dateString.match(regex);

      if (match) {
        const { year, month, day } = match.groups;
        const monthMissing = month === '00';
        const dayMissing = day === '00';

        const date = [
          Number.parseInt(year, 10),

          // months are zero-based, everything else is one-based
          monthMissing ? 0 : Number.parseInt(month, 10) - 1,
          dayMissing ? 1 : Number.parseInt(day, 10),
        ];

        const utc = moment.utc(date);

        if (!utc.isValid()) {
          // if for some reason the parsed date is invalid, and assuming the year is always there, use that
          return year;
        }

        if (monthMissing && dayMissing) {
          return utc.format(missing.dayAndMonth);
        }
        if (monthMissing) {
          return utc.format(missing.month);
        }
        if (dayMissing) {
          return utc.format(missing.day);
        }

        return utc.format(format);
      }

      // if the regex doesn't match, return a null value
      return null;
    },

    shortenAbstract: function(abs, maxLen) {
      maxLen = maxLen || 300;
      // if this function returns undefined,
      // the template knows to just show the whole abstract
      if (abs.length <= maxLen) return undefined;
      var i = abs.slice(0, maxLen).lastIndexOf(' ');
      return abs.slice(0, i + 1) + '...';
    },

    /**
     * This method prepares data for consumption by the template on a per-doc basis
     *
     * @returns {*}
     */
    prepareDocForViewing: function(data) {
      var shownAuthors;
      var maxAuthorNames = 3;

      if (data.author && data.author.length > maxAuthorNames) {
        data.extraAuthors = data.author.length - maxAuthorNames;
        shownAuthors = data.author.slice(0, maxAuthorNames);
      } else if (data.author) {
        shownAuthors = data.author;
      }

      if (data.author) {
        var format = function(d, i, arr) {
          var l = arr.length - 1;
          if (i === l || l === 0) {
            return d; // last one, or only one
          }
          return d + ';';
        };
        data.authorFormatted = _.map(shownAuthors, format);
        data.allAuthorFormatted = _.map(data.author, format);
      }

      data.formattedDate =
        data.formattedDate ||
        (data.pubdate ? this.formatDate(data.pubdate) : undefined);
      data.shortAbstract = data.abstract
        ? this.shortenAbstract(data.abstract)
        : undefined;
      data.details = data.details || {
        shortAbstract: data.shortAbstract,
        pub: data.pub,
        abstract: data.abstract,
      };
      data.num_citations = data['[citations]']
        ? data['[citations]'].num_citations
        : undefined;
      data.identifier = data.bibcode ? data.bibcode : data.identifier;

      // make sure undefined doesn't become "undefined"
      data.encodedIdentifier = _.isUndefined(data.identifier)
        ? data.identifier
        : encodeURIComponent(data.identifier);

      if (data.pubdate || data.shortAbstract) {
        data.popover = true;
      }

      if (this.model) data.orderNum = this.model.get('resultsIndex') + 1;

      return data;
    },
  };

  return Utils;
});
