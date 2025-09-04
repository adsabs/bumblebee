define(['jquery', 'analytics'], function($, analytics) {
  const autocompleteSource = [
    { value: 'author:""', label: 'Author', match: 'author:"' },

    { value: 'first_author:""', label: 'First Author', match: 'author:"' },
    { value: 'first_author:""', label: 'First Author', match: 'first author' },
    { value: 'first_author:""', label: 'First Author', match: '^author' },
    { value: 'first_author:""', label: 'First Author', match: 'author:"^' },

    {
      value: 'bibstem:""',
      label: 'Publication (must use bibstem)',
      desc: 'e.g. bibstem:ApJ',
      match: 'bibstem:"',
    },
    {
      value: 'bibstem:""',
      label: 'Publication (must use bibstem)',
      desc: 'e.g. bibstem:ApJ',
      match: 'publication (bibstem)',
    },

    { value: 'arXiv:', label: 'arXiv ID', match: 'arxiv:' },
    { value: 'doi:', label: 'DOI', match: 'doi:' },

    {
      value: 'full:""',
      label: 'Full text search',
      desc: 'title, abstract, and body',
      match: 'full:',
    },
    {
      value: 'full:""',
      label: 'Full text search',
      desc: 'itle, abstract, and body',
      match: 'fulltext',
    },
    {
      value: 'full:""',
      label: 'Full text search',
      desc: 'title, abstract, and body',
      match: 'text',
    },

    { value: 'year:', label: 'Year', match: 'year' },
    {
      value: 'year:',
      label: 'Year Range',
      desc: 'e.g. 1999-2005',
      match: 'year range',
    },

    { value: 'aff:""', label: 'Affiliation', match: 'affiliation' },
    { value: 'aff:""', label: 'Affiliation', match: 'aff:' },

    {
      value: 'abs:""',
      label: 'Search abstract + title + keywords',
      match: 'abs:',
    },

    {
      value: 'collection:astronomy',
      label: 'Limit to papers in the astronomy database',
      match: 'database:astronomy',
    },
    {
      value: 'collection:physics',
      label: 'Limit to papers in the physics database',
      match: 'database:physics',
    },
    {
      value: 'collection:astronomy',
      label: 'Limit to papers in the astronomy database',
      match: 'collection:astronomy',
    },
    {
      value: 'collection:physics',
      label: 'Limit to papers in the physics database',
      match: 'collection:physics',
    },

    // hide this one
    //    {value: "abstract:\"\"" , label : "Abstract", match: "abstract:("},

    { value: 'title:""', label: 'Title', match: 'title:(' },

    { value: 'orcid:', label: 'ORCiD identifier', match: 'orcid:' },

    {
      value: 'object:',
      label: 'SIMBAD object (e.g. object:LMC)',
      match: 'object:',
    },

    {
      value: 'citations()',
      label: 'Citations',
      desc: 'Get papers citing your search result set',
      match: 'citations(',
    },
    {
      value: 'references()',
      label: 'References',
      desc: 'Get papers referenced by your search result set',
      match: 'references(',
    },

    {
      value: 'trending()',
      label: 'Trending',
      desc:
        'the list of documents most read by users who read recent papers on the topic being researched',
      match: 'trending(',
    },
    {
      value: 'reviews()',
      label: 'Review Articles',
      desc: 'review articles citing most relevant papers',
      match: 'reviews(',
    },

    {
      value: 'useful()',
      label: 'Useful',
      desc:
        'documents frequently cited by the most relevant papers on the topic being researched',
      match: 'useful(',
    },

    {
      value: 'property:refereed',
      label: 'Limit to refereed',
      desc: '(property:refereed)',
      match: 'refereed',
    },
    {
      value: 'property:refereed',
      label: 'Limit to refereed',
      desc: '(property:refereed)',
      match: 'property:refereed',
    },

    {
      value: 'property:notrefereed',
      label: 'Limit to non-refereed',
      desc: '(property:notrefereed)',
      match: 'non-refereed',
    },
    {
      value: 'property:notrefereed',
      label: 'Limit to non-refereed',
      desc: '(property:notrefereed)',
      match: 'property:notrefereed',
    },
    {
      value: 'property:notrefereed',
      label: 'Limit to non-refereed',
      desc: '(property:notrefereed)',
      match: 'notrefereed',
    },

    {
      value: 'doctype:eprint',
      label: 'Limit to eprints',
      desc: '(doctype:eprint)',
      match: 'eprint',
    },
    {
      value: 'doctype:eprint',
      label: 'Limit to eprints',
      desc: '(doctype:eprint)',
      match: 'doctype:eprint',
    },
    {
      value: 'doctype:eprint',
      label: 'Limit to eprints',
      desc: '(doctype:eprint)',
      match: 'property:eprint',
    },
    {
      value: 'property:openaccess',
      label: 'Limit to open access',
      desc: '(property:openaccess)',
      match: 'open access',
    },
    {
      value: 'property:openaccess',
      label: 'Limit to open access',
      desc: '(property:openaccess)',
      match: 'property:openaccess',
    },
    {
      value: 'property:openaccess',
      label: 'Limit to open access',
      desc: '(property:openaccess)',
      match: 'openaccess',
    },

    {
      value: 'doctype:software',
      label: 'Limit to software',
      desc: '(doctype:software)',
      match: 'software',
    },
    {
      value: 'doctype:software',
      label: 'Limit to software',
      desc: '(doctype:software)',
      match: 'doctype:software',
    },

    {
      value: 'doctype:inproceedings',
      label: 'Limit to papers in conference proceedings',
      desc: '(doctype:inproceedings)',
      match: 'conference proceedings',
    },
    {
      value: 'doctype:inproceedings',
      label: 'Limit to papers in conference proceedings',
      desc: '(doctype:inproceedings)',
      match: 'doctype:inproceedings',
    },
    {
      value: 'doctype:inproceedings',
      label: 'Limit to papers in conference proceedings',
      desc: '(doctype:inproceedings)',
      match: 'property:inproceedings',
    },
  ];

  /**
   * splits out the part of the text that the autocomplete cares about
   * @param {string} text
   */
  const findActiveAndInactive = (text) => {
    const parts = text
      .trim()
      .split(/\s+/)
      .filter((part) => !!part);

    return {
      active: parts.pop(),
      inactive: parts.length > 0 ? parts.join(' ') : '',
    };
  };

  /**
   * @param {HTMLElement} element
   */
  const render = (element) => {
    if (!element) {
      return;
    }
    const $input = $(element);

    // parse the sources and generate the suggestion list
    const source = (request, response) => {
      // stop the search if this flag has been set
      if ($input.data('preventSearch')) {
        $input.data('preventSearch', false);
        $input.autocomplete('close');
        return;
      }

      const term = request.term;

      $input.data('originalTerm', term);

      // don't show if the user is just adding spaces on the end
      if (/\s+$/.test(term)) {
        $input.autocomplete('close');
        return;
      }

      // only consider the right-most term
      if ($input.getCursorPosition() !== $input.val().length) {
        $input.autocomplete('close');
        return;
      }

      // use only the right-most term
      const { active } = findActiveAndInactive(term);
      let suggestions = [];

      try { // match on the item regex, and return the label
        const reg = new RegExp(`^${$.ui.autocomplete.escapeRegex(active)}`, 'i');
        suggestions = _.uniq(
          _.filter(autocompleteSource, (item) => reg.test(item.match)),
          false,
          _.property('label'),
        );
      } catch (e) {
        // if there is an error, just don't show any suggestions
        suggestions = [];
      }

      response(suggestions);
    };

    // render the preview of each selection as they are focused
    const focus = (event, ui) => {
      const $autocomplete = $input.data('ui-autocomplete');
      const { inactive } = findActiveAndInactive($autocomplete.term);
      const focusedSuggestion = ui.item.value;

      const all = `${
        inactive.length > 0 ? inactive + ' ' : ''
      }${focusedSuggestion}`;

      // don't update the input if user is only hovering
      if (event.originalEvent.originalEvent.type !== 'mouseenter') {
        $input.val(all);
      }
      $input.data('previewSuggestion', all);
      $input.data('didFocus', true);
      $input.data('focusedItem', ui.item);

      return false;
    };

    const select = (event, ui) => {
      const newVal = $input.data('previewSuggestion');
      $input.val(newVal);

      // place cursor inside quotes or parens, or if none, just put it at the end
      $input.selectRange(
        /[")]$/.test(ui.item.value) ? newVal.length - 1 : newVal.length
      );

      analytics(
        'send',
        'event',
        'interaction',
        'autocomplete-used',
        ui.item.value
      );
      return false;
    };

    $input.autocomplete({
      minLength: 1,
      autoFocus: false,
      delay: 0,
      source,
      focus,
      select,
    });

    // render the suggestion list with some highlighting
  $input.data('ui-autocomplete')._renderItem = function (ul, item) {
    const term = (this.term ?? '').toString().trim();
    const label = (item?.label ?? item?.value ?? '').toString();

    const $li = $('<li/>', { class: 'search-bar-suggestion' });
    const $a = $('<a/>');

    // Highlight without regex
    const appendHighlighted = (text, needle) => {
      if (!needle) {
        $a.text(text);
        return;
      }
      try {
        const hay = text.toLowerCase();
        const ned = needle.toLowerCase();
        const idx = hay.indexOf(ned);

        if (idx === -1) {
          // No match — just text
          $a.text(text);
          return;
        }

        // Build: [before][<span>match</span>][after]
        $a.append(document.createTextNode(text.slice(0, idx)));

        $('<span/>', {
          class: 'ui-state-highlight',
          text: text.slice(idx, idx + needle.length),
        }).appendTo($a);

        $a.append(document.createTextNode(text.slice(idx + needle.length)));
      } catch (error) {
        // Fallback on any unexpected error
        $a.text(text);
      }
    };

    appendHighlighted(label, term);

    if (item?.desc) {
      // Add a non-breaking space gap like your original
      $('<span/>', {
        class: 's-auto-description',
        text: `  ${item.desc}`, // text, not HTML
      }).appendTo($a);
    }

    // Avoid invalid 'hover' event — jQuery uses mouseenter/mouseleave
    return $li
      .on('mouseenter', (e) => e.preventDefault())
      .append($a)
      .appendTo(ul);
  };

    $input.bind({
      keydown(event) {
        const { didFocus } = $input.data();

        // prevent search unless user is actually deleting a term
        if (event.key === 'Backspace' && /\s+$/.test($input.val())) {
          $input.data('preventSearch', true);
        }

        // hack to work around default tabbing behavior and still maintain normal behavior within the input box
        if (event.key === 'Tab' && didFocus) {
          $input.data('didFocus', false);
          event.preventDefault();
        }
      },
      paste() {
        $input.data('preventSearch', true);
      },
    });
  };

  return { render, autocompleteSource };
});
