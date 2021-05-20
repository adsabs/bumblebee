define([
  'react',
  'prop-types',
  'react-redux',
  '../models/index',
  '../actions',
], function(
  React,
  PropTypes,
  { useDispatch },
  { searchExamples },
  { updateSearchBar, emitAnalytics }
) {
  const Dl = ({ children }) => {
    return <dl className="dl-horizontal">{children}</dl>;
  };

  Dl.propTypes = {
    children: PropTypes.element.isRequired,
  };

  const Entry = ({ label, text, onClick, tooltip }) => {
    return (
      // eslint-disable-next-line react/jsx-fragments
      <React.Fragment>
        <dt>{label}</dt>
        <dd>
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
    onClick: () => {},
  };

  Entry.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    text: PropTypes.string,
    tooltip: PropTypes.string,
  };

  const SearchExamples = () => {
    const dispatch = useDispatch();
    const onClick = (text) => {
      dispatch(updateSearchBar(text));
      dispatch(emitAnalytics(['send', 'event', 'interaction.suggestion-used']));
    };

    return (
      <div
        style={{
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div className="quick-reference">
          <Dl>
            {searchExamples.slice(0, 7).map((entry) => (
              <Entry
                label={entry.label}
                text={entry.example}
                tooltip={entry.tooltip}
                onClick={() => onClick(entry.example)}
                key={entry.label}
              />
            ))}
          </Dl>
        </div>
        <div className="quick-reference">
          <Dl>
            {searchExamples.slice(7).map((entry) => (
              <Entry
                label={entry.label}
                text={entry.example}
                tooltip={entry.tooltip}
                onClick={() => onClick(entry.example)}
                key={entry.label}
              />
            ))}
          </Dl>
        </div>
      </div>
    );
  };

  return SearchExamples;
});
