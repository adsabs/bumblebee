define([
  'underscore',
  'react',
  'react-bootstrap',
  'immutable',
  'react-prop-types',
  'es6!./linklist.jsx',
  'es6!./modal.jsx'
], function (_, React, ReactBS, Immutable, PropTypes, LinkList, Modal) {

  const { Button } = ReactBS;

  const styles = {
    app: {
      maxWidth: 250
    }
  };

  // shown when `loading` is true
  const Loading = () => (
    <div className="text-center text-muted">
      <i
        className="fa fa-spinner fa-spin fa-2x"
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
    </div>
  );

  // shown when `hasLinks` is false
  const NoLinks = () => (
    <h3 className="s-right-col-widget-title">
      No Sources Found
    </h3>
  );

  const ResourcesApp = ({
    app,
    onLinkClick,
    setModal
  }) => {
    let additionalLinks;
    const allFullTextSources = app.get('fullTextSources');
    const allDataProducts = app.get('dataProducts');
    const loading = app.get('fetching');
    const modalShow = app.get('modalShown');

    // only take the first 3
    const fullTextLinks = allFullTextSources.slice(0, 3);
    const dataProductLinks = allDataProducts.slice(0, 3);

    // check if there are more
    if (allFullTextSources.size > 3 || allDataProducts > 3) {
      additionalLinks = {
        fullTextLinks: allFullTextSources,
        dataProductLinks: allDataProducts
      };
    }

    // check if we have links to show
    const noLinks = fullTextLinks.isEmpty() && dataProductLinks.isEmpty();

    return (
      <div className="s-right-col-widget-container" style={styles.app}>

        {/* if there are no sources, say so here */}
        { !loading && noLinks && <NoLinks />}

        {/* Loading spinner */}
        { loading && <Loading /> }

        {/* if not loading, then show our links */}
        { !loading && !noLinks &&
          <div>
            <LinkList
              icon="text"
              links={fullTextLinks}
              title="FULL TEXT SOURCES"
              onClick={link => onLinkClick(link)}
            />
            <LinkList
              icon="data"
              links={dataProductLinks}
              title="DATA PRODUCTS"
              onClick={link => onLinkClick(link)}
            />
            { _.isPlainObject(additionalLinks) &&
              <Button bsSize="xsmall" onClick={() => setModal(true)}>Show All</Button>
            }
          </div>
        }
        <Modal
          show={modalShow}
          onHide={() => setModal(false)}
          links={additionalLinks}
          onClick={link => onLinkClick(link)}
        />
      </div>
    );
  };

  ResourcesApp.propTypes = {
    onLinkClick: PropTypes.func,
    setModal: PropTypes.func,
    app: PropTypes.instanceOf(Immutable).isRequired
  };

  ResourcesApp.defaultProps = {
    onLinkClick: () => {},
    setModal: () => {}
  };

  return ResourcesApp;
});
