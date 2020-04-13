define(['react', 'react-prop-types', 'react-redux', '../actions'], function(
  React,
  PropTypes,
  { useSelector, useDispatch },
  { getRecommendations }
) {
  const Paper = ({ title, bibcode, author }) => {
    return (
      <li style={{ marginTop: '1rem' }}>
        <a href={`/abs/${bibcode}/abstract`}>{title}</a>
        <ul className="list-inline">
          {author.slice(0, 3).map((entry, i) => (
            <li>{`${entry}${i < 2 ? ';' : ''}`}</li>
          ))}
          {author.length > 3 && <li>...</li>}
        </ul>
      </li>
    );
  };
  Paper.defaultProps = {
    title: '',
    bibcode: '',
    author: [],
  };

  Paper.propTypes = {
    title: PropTypes.string,
    bibcode: PropTypes.string,
    author: PropTypes.arrayOf(PropTypes.string),
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
    React.useEffect(() => {
      dispatch(
        getRecommendations({
          function: 'similar',
          sort: 'entry_date',
          numDocs: 5,
          cutoffDays: 5,
          topNReads: 10,
        })
      );
    }, []);
    const { getRecommendationsRequest, getDocsRequest, docs } = useSelector(
      selector
    );

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
          {docs.map(({ title, bibcode, author }) => (
            <Paper title={title} bibcode={bibcode} author={author} />
          ))}
        </ul>
      </div>
    );
  };

  return RecommendedList;
});
