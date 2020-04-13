import PropTypes from 'prop-types';
define(['react', 'react-prop-types', '../models/index'], function(
  React,
  PropTypes,
  { searchExamples }
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
    const onClick = (text) => {
      console.log('clicked', text);
    };

    return (
      <div style={{ paddingTop: '1rem' }}>
        <div className="col-sm-5 quick-reference">
          <Dl>
            {searchExamples.slice(0, 7).map((entry) => (
              <Entry
                label={entry.label}
                text={entry.example}
                tooltip={entry.tooltip}
                onClick={() => onClick(entry.example)}
              />
            ))}
          </Dl>
        </div>
        <div className="col-sm-7 quick-reference">
          <Dl>
            {searchExamples.slice(7).map((entry) => (
              <Entry
                label={entry.label}
                text={entry.example}
                tooltip={entry.tooltip}
                onClick={() => onClick(entry.example)}
              />
            ))}
          </Dl>
        </div>
      </div>
    );
  };

  return SearchExamples;
});
