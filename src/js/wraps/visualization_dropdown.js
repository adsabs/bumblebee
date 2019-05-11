define([
  'js/widgets/dropdown-menu/widget'

], function (

  DropdownWidget

) {
  // config

  var links = [
    { section: 'Visualizations' },
    { description: 'Citation Metrics', navEvent: 'show-metrics' },
    { description: 'Author Network', navEvent: 'show-author-network' },
    { description: 'Paper Network', navEvent: 'show-paper-network' },
    { description: 'Concept Cloud', navEvent: 'show-concept-cloud' },
    { description: 'Results Graph', navEvent: 'show-bubble-chart' },
    { divider: true, hideIfNoItemsSelected: true },
    { section: 'Operations', hideIfNoItemsSelected: true },
    { description: 'Also-read()', hideIfNoItemsSelected: true, pubsubEvent: 'second-order-search/trending' },
    { description: 'Citations()', hideIfNoItemsSelected: true, pubsubEvent: 'second-order-search/citations' },
    { description: 'References()', hideIfNoItemsSelected: true, pubsubEvent: 'second-order-search/references' },
    { description: 'Similar()', hideIfNoItemsSelected: true, pubsubEvent: 'second-order-search/similar' }
  ];

  var btnType = 'btn-primary-faded';
  var dropdownTitle = 'Explore';
  var iconClass = 'icon-explore';
  var rightAlign = true;
  var selectedOption = true;


  return function () {
    var VisDropdown = new DropdownWidget({
      links: links,
      btnType: btnType,
      dropdownTitle: dropdownTitle,
      iconClass: iconClass,
      rightAlign: rightAlign,
      selectedOption: selectedOption

    });

    return VisDropdown;
  };
});
