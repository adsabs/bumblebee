/* eslint-disable no-script-url */
define([
  'react',
  'react-bootstrap',
  'react-aria-menubutton',
  'prop-types',
], function(React, { Label }, { Button, Wrapper, Menu, MenuItem }, PropTypes) {
  const renderRunButtons = (item) => {
    let labels = [];
    if (item.type === 'template') {
      if (item.template === 'arxiv') {
        if (item.data === null) {
          labels = ['Search'];
        } else {
          labels = [
            'Keyword Matches - Recent Papers',
            'Other Recent Papers in Selected Categories',
          ];
        }
      } else if (item.template === 'keyword' && item.data !== null) {
        labels = ['Recent Papers', 'Most Popular', 'Most Cited'];
      } else {
        labels = ['Search'];
      }
    } else {
      labels = ['Search'];
    }
    return labels.map((label, i) => (
      <MenuItem
        key={label}
        text={label}
        value={{ type: 'runquery', queryKey: i }}
        className="menuitem"
      >
        <i className="fa fa-search fa-fw" aria-hidden="true" /> {label}
      </MenuItem>
    ));
  };

  const ActionsDropdown = ({
    onToggleActive,
    onRunQuery,
    onEdit,
    onDelete,
    item,
    disable,
    dropup,
  }) => {
    // is a general notification, disallow editing
    const allowEdit = item.type !== 'query';

    const handleSelection = ({ type, queryKey }) => {
      switch (type) {
        case 'toggleactive':
          return onToggleActive(item);
        case 'edit':
          return onEdit(item);
        case 'delete':
          return onDelete(item);
        case 'runquery':
          return onRunQuery(item, queryKey);
        default:
      }
    };

    return (
      <Wrapper
        onSelection={handleSelection}
        className="react-aria-menubutton__wrapper"
      >
        <Button
          className={`btn btn-default ${disable ? 'disabled' : ''}`}
          disabled={disable}
        >
          <i className="fa fa-cog" aria-hidden="true" /> Actions{' '}
          <i className="fa fa-caret-down" aria-hidden="true" />
        </Button>
        <Menu>
          <ul className="react-aria-menubutton__menu">
            <span
              key="query-header"
              aria-hidden="true"
              className="menuitem__label"
            >
              View in search results page
            </span>
            {renderRunButtons(item)}
            <hr key="divider" />
            <span
              key="actions-header"
              aria-hidden="true"
              className="menuitem__label"
            >
              Actions
            </span>
            <MenuItem
              key="toggler"
              text="toggle"
              className="menuitem"
              value={{ type: 'toggleactive' }}
            >
              <div className="label-group">
                <Label bsStyle={item.active ? 'success' : 'default'}>
                  ENABLED
                </Label>
                <Label bsStyle={item.active ? 'default' : 'danger'}>
                  DISABLED
                </Label>
              </div>
            </MenuItem>
            {allowEdit && (
              <MenuItem
                key="edit"
                text="edit"
                className="menuitem"
                value={{ type: 'edit' }}
              >
                <i className="fa fa-pencil fa-fw" aria-hidden="true" /> Edit
              </MenuItem>
            )}
            <MenuItem
              key="delete"
              text="delete"
              className="menuitem"
              value={{ type: 'delete' }}
            >
              <i className="fa fa-trash fa-fw" aria-hidden="true" /> Delete
            </MenuItem>
          </ul>
        </Menu>
      </Wrapper>
    );
  };

  ActionsDropdown.defaultProps = {
    disable: false,
    dropup: false,
    onDelete: () => {},
    onEdit: () => {},
    onRunQuery: () => {},
    onToggleActive: () => {},
  };

  ActionsDropdown.propTypes = {
    disable: PropTypes.bool,
    item: PropTypes.shape({
      active: PropTypes.bool,
      id: PropTypes.number,
      type: PropTypes.string,
    }).isRequired,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onRunQuery: PropTypes.func,
    onToggleActive: PropTypes.func,
    dropup: PropTypes.bool,
  };

  return ActionsDropdown;
});
