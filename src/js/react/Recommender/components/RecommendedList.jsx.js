define(['react', 'prop-types', 'react-redux', 'js/react/Recommender/actions'], function (
  React,
  PropTypes,
  {useSelector, useDispatch},
  {getRecommendations, emitAnalytics},
) {
  const Paper = ({title, bibcode, author, totalAuthors, onClick}) => {
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
      <li style={{marginTop: '1rem'}}>
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
    onClick: () => {
    },
  };

  Paper.propTypes = {
    title: PropTypes.string,
    bibcode: PropTypes.string,
    author: PropTypes.arrayOf(PropTypes.string),
    totalAuthors: PropTypes.number,
    onClick: PropTypes.func,
  };

  const Message = ({children}) => (
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

  var executed = 0;
  var userName = null;
  var reported = false;
  const selector = (state) => {
    // reset if it is a different user
    if (state.userName !== userName) {
      executed = 0;
      userName = state.userName;
      reported = false;
    }

    return {
      getRecommendationsRequest: state.requests.GET_RECOMMENDATIONS,
      getDocsRequest: state.requests.GET_DOCS,
      docs: state.docs,
      queryParams: state.queryParams,
      executed: executed,
      reported: reported,
    };
  };

  const RecommendedList = () => {
    const dispatch = useDispatch();
    /*
    const onGetMore = () => {
      dispatch(getFullList());
    };
    */

    const {
      getRecommendationsRequest,
      getDocsRequest,
      docs,
      queryParams,
      userName, // eslint-disable-line
    } = useSelector(selector);

    React.useEffect(() => {
      if (executed + 12 * 60 * 60 * 1000 < Date.now()) {
        // the hook gets called too many times even with [docs] in the args to useEffect
        // (and oracle returns 404 when nothing is found; which is IMHO wrong) but we can't
        // rely on status.failure for that reason
        executed = Date.now();
        dispatch(getRecommendations());
        reported = false;
      } else if (executed && docs.length === 0 && !reported) {
        // we are rendered (send the signal everytime -- even if it was sent already)
        dispatch(
          emitAnalytics([
            'send',
            'event',
            'interaction', 'no-recommendation', // category
            'no-useful-recommendations', // action
            '', // label,
            0, // value
          ]),
        );
        reported = true;
      }
    });

    const onPaperSelect = ({bibcode}, index) => {
      dispatch(
        emitAnalytics([
          'send',
          'event',
          'interaction', 'recommendation', // category
          queryParams.function, // action
          bibcode, // label,
          index, // value
        ]),
      );
    };

    if (
      getRecommendationsRequest.status === 'pending' ||
      getDocsRequest.status === 'pending'
    ) {
      return (
        <Message>
          <span>
            <i className="fa fa-spinner fa-spin" aria-hidden="true"/>{' '}
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
      return (
        <Message>
          Sorry, we do not have any recommendations for you just yet! ADS
          provides users recommendations based on their reading history, and we
          suggest that you create an ADS account to take advantage of this
          feature. If you already have an account, then be sure you are logged
          in while searching and reading papers. In due time we will be able to
          provide you with suggestions based on your inferred interests.
        </Message>
      );
    }

    return (
      <div>
        <ul className="list-unstyled">
          {docs.map(({title, bibcode, author, totalAuthors}, index) => (
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
      </div>
    );
  };

  return RecommendedList;
});
