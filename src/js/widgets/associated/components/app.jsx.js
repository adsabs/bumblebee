define(['underscore', 'react', 'prop-types'], function(_, React, PropTypes) {
  // component styles
  const styles = {
    list: {
      listStyleType: 'none',
      marginLeft: '-10px',
      padding: '0',
    },
    link: {
      fontSize: '1em',
    },
    icon: {
      fontSize: '1.4em',
      'padding-right': '5px',
    },
  };

  // create the title element
  const Title = ({ children }) => (
    <div className="associated__header__title">
      <i className="fa fa-folder-open" style={styles.icon} aria-hidden="true" />
      {children}
    </div>
  );

  // create the links element
  const Links = ({ items, onClick }) => {
    const getLink = (item) => {
      if (item.external) {
        return (
          <React.Fragment>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => onClick(item)}
            >
              {item.name}{' '}
            </a>
            <i className="fa fa-external-link" aria-hidden="true" />
          </React.Fragment>
        );
      }
      return (
        <a href={item.url} onClick={() => onClick(item)}>
          {item.name}
        </a>
      );
    };

    return (
      <ul style={styles.list}>
        {items.map((i) => (
          <li key={i.id} style={styles.link}>
            {i.circular ? i.name : getLink(i)}
          </li>
        ))}
      </ul>
    );
  };

  // container for wrapping children
  const Container = ({ children }) => (
    <div className="s-right-col-widget-container" style={{ padding: 10 }}>
      {children}
    </div>
  );

  // simple button
  const ShowAllBtn = ({ onClick }) => (
    <button className="btn btn-default btn-xs" onClick={(e) => onClick(e)}>
      Show All
    </button>
  );

  // Associated Articles Widget
  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showAllBtn: false,
        items: [],
      };
    }

    // remove the button and update the items to show everything
    onShowAll(e) {
      e.preventDefault();
      this.setState({
        showAllBtn: false,
        items: this.props.items,
      });
    }

    // check items length, and slice them smaller if necessary
    componentWillReceiveProps(props) {
      if (props.items.length > 4) {
        this.setState({
          items: props.items.slice(0, 4),
          showAllBtn: true,
        });
      } else {
        this.setState({ items: props.items });
      }
    }

    render() {
      const { loading, handleLinkClick, hasError } = this.props;
      const { items, showAllBtn } = this.state;

      if (items.length > 0) {
        return (
          <Container>
            <Title>Associated Works ({this.props.items.length})</Title>
            <Links items={items} onClick={handleLinkClick} />
            {showAllBtn && <ShowAllBtn onClick={(e) => this.onShowAll(e)} />}
          </Container>
        );
      }
      return null;
    }
  }

  App.propTypes = {
    hasError: PropTypes.bool,
    items: PropTypes.array,
    loading: PropTypes.bool,
    handleLinkClick: PropTypes.func,
  };

  App.defaultProps = {
    hasError: false,
    items: [],
    loading: false,
    handleLinkClick: () => {},
  };

  return App;
});
