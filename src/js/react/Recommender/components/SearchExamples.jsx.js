define([
  'react',
  'prop-types',
  'react-redux',
  'js/react/Recommender/models/index',
  'js/react/Recommender/actions',
], function (
  React,
  PropTypes,
  {useDispatch},
  {searchExamples},
  {updateSearchBar, emitAnalytics},
) {
  const Dl = ({children}) => {
    return <dl className="dl-horizontal">{children}</dl>;
  };

  Dl.propTypes = {
    children: PropTypes.element.isRequired,
  };

  const Entry = ({label, text, onClick, tooltip}) => {
    return (
      // eslint-disable-next-line react/jsx-fragments
      <React.Fragment>
        <dt>{label}</dt>
        <dd style={{display: 'flex'}}>
          <button type="button" onClick={onClick} className="text-link">
            {text}
          </button>
          {tooltip && (
            <i
              className="icon-help"
              aria-hidden="true"
              data-toggle="tooltip"
              title={tooltip}
            />
          )}
        </dd>
      </React.Fragment>
    );
  };
  Entry.defaultProps = {
    label: '',
    text: '',
    tooltip: '',
    onClick: () => {
    },
  };

  Entry.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    text: PropTypes.string,
    tooltip: PropTypes.string,
  };

  const SearchExamples = React.memo(() => {
    const dispatch = useDispatch();
    const onClick = (text) => {
      dispatch(updateSearchBar(text));
      dispatch(
        emitAnalytics(['send', 'event', 'interaction', 'suggestion-used']),
      );
    };

    const generateRandom = (max) => {
      return Math.floor(Math.random() * max);
    };

    return (
      <div className="search-examples">
        <div className="quick-reference">
          <Dl>
            {searchExamples.slice(0, 8).map((entry) => {
              const index = generateRandom(entry.examples.length);
              const example = entry.syntax.replace('%', entry.examples[index]);
              return (
                <Entry
                  label={entry.label}
                  text={example}
                  tooltip={entry.tooltip}
                  onClick={() => onClick(example)}
                  key={entry.label}
                />
              );
            })}
          </Dl>
        </div>
        <div className="quick-reference">
          <Dl>
            {searchExamples.slice(8).map((entry) => {
              const index = generateRandom(entry.examples.length);
              const example = entry.syntax.replace('%', entry.examples[index]);
              return (
                <Entry
                  label={entry.label}
                  text={example}
                  tooltip={entry.tooltip}
                  onClick={() => onClick(example)}
                  key={entry.label}
                />
              );
            })}
          </Dl>
        </div>
      </div>
    );
  });

  return SearchExamples;
});
