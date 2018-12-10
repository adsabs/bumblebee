define([
  'underscore',
  'react',
  'react-prop-types',
], function (_, React, PropTypes) {
  // No Results View
  const NoResults = () => (
    <h3 className="s-right-col-widget-title">
      No Sources Found
    </h3>
  );

  // Loading View
  const Loading = () => (
    <div className="text-center text-muted">
      <i
        className="fa fa-spinner fa-spin fa-2x"
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
    </div>
  );

  // Full Text List
  const FullTextLinkList = ({ items, onClick }) => (
    <div className="resources__full__list">
      <div className="resources__header__row">
        <i className="fa fa-file-text-o" aria-hidden="true"/>
        <div className="resources__header__title">full text sources</div>
      </div>
      {_.map(items, (groups, key) => <div className="resources__content" key={key}>
          <div className="resources__content__title">{key}</div>
          <div className="resources__content__links">
            {_.map(groups, (g, idx) => <span>
                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener"
                  onClick={() => onClick(g)}
                  title={`${g.description} ${g.open ? 'OPEN ACCESS' : g.type === 'INSTITUTION' ? '' : 'SIGN IN REQUIRED'}`}
                  className={`resources__content__link ${g.open ? 'unlock' : ''}`}>
                  {g.type === 'PDF' && <i className="fa fa-file-pdf-o" aria-hidden="true"/>}
                  {g.type === 'HTML' && <i className="fa fa-file-text" aria-hidden="true"/>}
                  {g.type === 'SCAN' && <i className="fa fa-file-image-o" aria-hidden="true"/>}
                  {g.type === 'INSTITUTION' && <i className="fa fa-university" aria-hidden="true"/>}
                </a>
                {idx < groups.length - 1
                  && <div className="resources__content__link__separator">|</div>
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
  FullTextLinkList.propTypes = {
    items: PropTypes.array,
    onClick: PropTypes.func
  };
  FullTextLinkList.defaultProps = {
    items: [],
    onClick: () => {}
  };

  // Data Product List
  const DataProductLinkList = ({ items, onClick }) => (
    <div className="resources__data__list">
      <div className="resources__header__row">
        <i className="fa fa-database"/>
        <div className="resources__header__title">data products</div>
      </div>
      <div className="resources__content">
        {_.map(items, item => <a
            href={item.url}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(item)}
            title={item.description}
            className="resources__content__link">
            {item.name} ({item.count})
          </a>
        )}
      </div>
    </div>
  );
  DataProductLinkList.propTypes = {
    items: PropTypes.array,
    onClick: PropTypes.func
  };
  DataProductLinkList.defaultProps = {
    items: [],
    onClick: () => {}
  };

  // Main View
  const App = props => (
    <div className="s-right-col-widget-container" style={{ padding: 10 }}>
      { props.loading && <Loading />}
      { props.noResults && !props.loading && <NoResults /> }
      { !props.loading && !props.hasError
        && <div className="resources__container">
          { !_.isEmpty(props.fullTextSources)
            && <FullTextLinkList items={props.fullTextSources} onClick={props.onLinkClick} />
          }
          { !_.isEmpty(props.dataProducts)
            && <DataProductLinkList items={props.dataProducts} onClick={props.onLinkClick} />
          }
        </div>
      }
    </div>
  );
  App.propTypes = {
    loading: PropTypes.bool,
    noResults: PropTypes.bool,
    fullTextSources: PropTypes.array,
    dataProducts: PropTypes.array,
    onLinkClick: PropTypes.func,
    hasError: PropTypes.string
  };
  App.defaultProps = {
    loading: false,
    noResults: false,
    fullTextSources: [],
    dataProducts: [],
    onLinkClick: () => {},
    hasError: null
  };

  return App;
});
