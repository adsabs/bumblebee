define([
  'react',
  'react-prop-types',
  'es6!./link.jsx'
], function (React, PropTypes, SourceLink) {

  const LinkList = ({ links, title, onClick, icon }) => {
    if (links.isEmpty()) {
      return null;
    }
    return (
      <div>
        <h3 className="s-right-col-widget-title">
          <i className={`icon-${icon}`} aria-hidden="true" style={{ marginRight: 5 }} />
          { title }
        </h3>
        <ul className="list-unstyled">
          {
            links.map(link => (
              <SourceLink
                name={link.get('name')}
                description={link.get('description')}
                count={link.get('count')}
                open={link.get('open')}
                url={link.get('url')}
                openUrl={link.get('openUrl')}
                onClick={() => onClick(link)}
              />
            ))
          }
        </ul>
      </div>
    );
  };

  LinkList.propTypes = {
    links: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
      description: PropTypes.string,
      open: PropTypes.bool,
      openUrl: PropTypes.bool
    })),
    title: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string
  };

  LinkList.defaultProps = {
    links: [],
    title: '',
    onClick: () => {},
    icon: ''
  };

  return LinkList;
});
