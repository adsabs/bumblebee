define([
  'react',
  'react-prop-types',
  'react-redux',
  'react-bootstrap',
  '../actions',
], function(
  React,
  PropTypes,
  { useSelector, useDispatch },
  { Button },
  { getRecommendations, getFullList, emitAnalytics }
) {
  const Paper = ({ title, bibcode, author, totalAuthors, onClick }) => {
    const el = React.useRef(null);
    React.useEffect(() => {
      if (el.current) {
        el.current.addEventListener('click', onClick);
      }
      return () => {
        if (el.current) {
          el.current.removeEventListener('click', onClick);
        }
      };
    }, []);

    return (
      <li style={{ marginTop: '1rem' }}>
        <a href={`#/abs/${bibcode}/abstract`} ref={el}>
          {title}
        </a>
        <ul className="list-inline">
          {author.map((entry, i) => (
            <li key={entry}>{`${entry}${i < 2 ? ';' : ''}`}</li>
          ))}
          {totalAuthors > 3 && <li>...</li>}
        </ul>
      </li>
    );
  };
  Paper.defaultProps = {
    title: '',
    bibcode: '',
    author: [],
    totalAuthors: 0,
    onClick: () => {},
  };

  Paper.propTypes = {
    title: PropTypes.string,
    bibcode: PropTypes.string,
    author: PropTypes.arrayOf(PropTypes.string),
    totalAuthors: PropTypes.number,
    onClick: PropTypes.func,
  };

  const Message = ({ children }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 0',
      }}
    >
      {children}
    </div>
  );
  Message.propTypes = {
    children: PropTypes.element.isRequired,
  };

  const selector = (state) => {
    return {
      getRecommendationsRequest: state.requests.GET_RECOMMENDATIONS,
      getDocsRequest: state.requests.GET_DOCS,
      docs: state.docs,
    };
  };

  const RecommendedList = () => {
    const dispatch = useDispatch();
    const onGetMore = () => {
      dispatch(getFullList());
    };
    const { getRecommendationsRequest, getDocsRequest, docs } = useSelector(
      selector
    );
    React.useEffect(() => {
      if (docs.length === 0) {
        dispatch(getRecommendations());
      }
    }, [docs]);

    const onPaperSelect = ({ bibcode }, index) => {
      dispatch(
        emitAnalytics([
          'send',
          'event',
          'interaction.select-paper',
          index,
          { bibcode },
        ])
      );
    };

    if (
      getRecommendationsRequest.status === 'pending' ||
      getDocsRequest.status === 'pending'
    ) {
      return (
        <Message>
          <span>
            <i className="fa fa-spinner fa-spin" aria-hidden="true" />{' '}
            Loading...
          </span>
        </Message>
      );
    }

    if (
      getRecommendationsRequest.status === 'failure' ||
      getDocsRequest.status === 'failure'
    ) {
      return (
        <Message>
          <span>
            <i
              className="fa fa-exclamation-triangle text-danger"
              aria-hidden="true"
            />{' '}
            {getRecommendationsRequest.error || getDocsRequest.error}
          </span>
        </Message>
      );
    }

    if (docs.length === 0) {
      return <Message>No recommendations right now, check back later</Message>;
    }

    return (
      <div>
        <ul className="list-unstyled">
          {docs.map(({ title, bibcode, author, totalAuthors }, index) => (
            <Paper
              key={bibcode}
              title={title}
              bibcode={bibcode}
              author={author}
              totalAuthors={totalAuthors}
              onClick={() => onPaperSelect(docs[index], index)}
            />
          ))}
        </ul>
        <Message>
          <Button bsStyle="link" onClick={onGetMore}>
            See full list
          </Button>
        </Message>
      </div>
    );
  };

  return RecommendedList;
});
