define(['react', 'prop-types', 'react-bootstrap'], function(
  React,
  PropTypes,
  { Panel }
) {
  const initialState = {
    open: false,
    hovered: false,
    focused: false,
  };
  class CollapsePanel extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = initialState;
      this.toggle = this.toggle.bind(this);
      this.toggleHover = this.toggleHover.bind(this);
      this.onChangeFocus = this.onChangeFocus.bind(this);
    }

    toggle() {
      this.setState({ open: !this.state.open });
    }

    toggleHover() {
      this.setState({ hovered: !this.state.hovered });
    }

    onChangeFocus(val) {
      return () => {
        this.setState({ focused: val });
      };
    }

    render() {
      const caretDir = this.state.open ? 'down' : 'right';
      return (
        <Panel expanded={this.state.open} onToggle={this.toggle}>
          <Panel.Heading style={{ padding: '0' }}>
            <Panel.Title>
              <button
                className="create-notification-title btn btn-link btn-block"
                onMouseEnter={this.toggleHover}
                onMouseLeave={this.toggleHover}
                onFocus={this.onChangeFocus(true)}
                onBlur={this.onChangeFocus(false)}
                aria-expanded={this.state.open}
                onClick={this.toggle}
              >
                <div className="s-create-notification-title__title">
                  <span>
                    <i className="fa fa-bell" aria-hidden="true" /> Create email
                    notification
                  </span>
                  <span>
                    <i
                      className={`fa fa-caret-${caretDir}`}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </button>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              {this.props.render({ collapse: () => this.toggle() })}
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      );
    }
  }

  CollapsePanel.defaultProps = {
    render: () => {},
  };
  CollapsePanel.propTypes = {
    render: PropTypes.func,
  };

  return CollapsePanel;
});
