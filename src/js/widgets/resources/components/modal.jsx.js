define([
  'react',
  'react-bootstrap',
  'react-prop-types',
  'es6!./link.jsx'
], function (React, ReactBS, PropTypes, SourceLink) {

  const { Modal, Button, Grid, Row, Col } = ReactBS;

  const ResourcesModal = ({ show, onHide, links, onClick }) => (
    <Modal
      show={show}
      onHide={onHide}
      bsSize="large"
      aria-labelledBy="resource-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="resource-modal-title">External Sources</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid>
          <Row>
            <Col xs={6}>
              <h3 className="s-right-col-widget-title text-left">
                <i className="icon-text" aria-hidden="true" style={{ marginRight: 5 }} />
                FULL TEXT SOURCES
              </h3>
              <ul className="list-unstyled">
                {links.fullTextLinks.map(link => (
                  <SourceLink
                    name={link.get('name')}
                    description={link.get('description')}
                    count={link.get('count')}
                    open={link.get('open')}
                    url={link.get('url')}
                    openUrl={link.get('openUrl')}
                    onClick={() => onClick(link)}
                  />
                ))}
              </ul>
            </Col>
            <Col xs={6}>
              <h3 className="s-right-col-widget-title text-left">
                <i className="icon-data" aria-hidden="true" style={{ marginRight: 5 }} />
                DATA PRODUCTS
              </h3>
              <ul className="list-unstyled">
                {links.dataProductLinks.map(link => (
                  <SourceLink
                    name={link.get('name')}
                    description={link.get('description')}
                    count={link.get('count')}
                    open={link.get('open')}
                    url={link.get('url')}
                    openUrl={link.get('openUrl')}
                    onClick={() => onClick(link)}
                  />
                ))}
              </ul>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );

  ResourcesModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    links: PropTypes.shape({
      fullTextLinks: PropTypes.array,
      dataProductLinks: PropTypes.array
    }),
    onClick: PropTypes.func
  };

  ResourcesModal.defaultProps = {
    show: false,
    onHide: null,
    links: {
      fullTextLinks: [],
      dataProductLinks: []
    },
    onClick: () => {}
  };

  return ResourcesModal;
});
