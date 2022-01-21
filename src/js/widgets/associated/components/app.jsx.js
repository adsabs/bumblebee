define(['underscore', 'react', 'prop-types'], function(_, React, PropTypes) {
  // component styles
  const styles = {
    list: {
      listStyleType: 'none',
      marginLeft: '7px',
    },
    link: {
      fontSize: '1em',
      borderLeft: 'solid 3px grey',
      paddingLeft: '5px',
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
          <>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => onClick(item)}
            >
              {item.name}{' '}
            </a>
            <i className="fa fa-external-link" aria-hidden="true" />
          </>
        );
      }
      return (
        <a href={item.url} onClick={() => onClick(item)}>
          {item.name}
        </a>
      );
    };

    return (
      <div style={styles.list} id="associated_works">
        {items.map((i) => (
          <div
            key={i.id}
            style={styles.link}
            className="resources__content__link associated_work"
          >
            {i.circular ? i.name : getLink(i)}
          </div>
        ))}
      </div>
    );
  };

  // Associated Articles Widget
  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showAllBtn: false,
        showAll: false,
        items: [],
      };
      this.onToggleShowAll = this.onToggleShowAll.bind(this);
    }

    // check items length, and slice them smaller if necessary
    componentWillReceiveProps(props) {
      if (props.items.length > 4) {
        this.setState({
          items: props.items.slice(0, 4),
          showAllBtn: true,
          showAll: false,
        });
      } else {
        this.setState({ items: props.items });
      }
    }

    onToggleShowAll(e) {
      e.preventDefault();
      this.setState((prevState) => ({
        showAll: !prevState.showAll,
        items: prevState.showAll
          ? this.props.items.slice(0, 4)
          : this.props.items,
      }));
    }

    render() {
      const { loading, handleLinkClick, hasError } = this.props;
      const { items, showAllBtn, showAll } = this.state;

      if (items.length > 0) {
        return (
          <div className="resources__container">
            <Title>Related Materials ({this.props.items.length})</Title>
            <Links items={items} onClick={handleLinkClick} />
            {showAllBtn && (
              <input
                type="button"
                id="associated_works_btn"
                className="btn btn-default btn-xs"
                onClick={this.onToggleShowAll}
                value={showAll ? 'Show Less' : 'Show All'}
              />
            )}
          </div>
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
