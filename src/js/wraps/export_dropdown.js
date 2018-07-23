define([
  'underscore',
  'js/widgets/config',
  'js/widgets/dropdown-menu/widget'
], function (_, config, DropdownWidget) {
  var links = [
    { description: 'in BibTeX', navEvent: 'export', params: { format: 'bibtex' } },
    { description: 'in AASTeX', navEvent: 'export', params: { format: 'aastex' } },
    { description: 'in EndNote', navEvent: 'export', params: { format: 'endnote' } },
    { description: 'in RIS', navEvent: 'export', params: { format: 'ris' } },
    { description: 'in ADS Classic', navEvent: 'export', params: { format: 'classic' } },
    { description: 'Author Affiliation', navEvent: 'show-author-affiliation-tool' },
    { description: 'Other Formats', navEvent: 'export', params: { format: 'other' } }

    // deactivated, needs the myads microservice
    // {href : '/export/query' , description : 'Export Query' , navEvent: 'export-query'}
  ];

  var btnType = 'btn-primary-faded';
  var dropdownTitle = 'Export';
  var iconClass = 'icon-export';
  var rightAlign = true;
  var selectedOption = true;

  return function () {
    var Dropdown = new DropdownWidget({
      links: links,
      btnType: btnType,
      dropdownTitle: dropdownTitle,
      iconClass: iconClass,
      rightAlign: rightAlign,
      selectedOption: selectedOption,
      updateLinks: function (userData) {
        var format = userData.defaultExportFormat;
        var formatVal = (_.find(config.export.formats, { label: format })).value;

        if (format) {
          var match;
          _.forEach(links, function (link, idx) {
            if (link.params && link.params.format && link.params.format === formatVal) {
              match = idx;
              return false;
            }
          });

          var newVal = _.assign({}, links[0], {
            description: 'in ' + format,
            params: _.assign({}, links[0].params, { format: formatVal })
          });
          return match ?
            [newVal]
              .concat(links.slice(1, match))
              .concat(links[0])
              .concat(links.slice(match + 1)) :
            [newVal]
              .concat(links.slice(1));
        }
        return links;
      }
    });

    return Dropdown;
  };
});
