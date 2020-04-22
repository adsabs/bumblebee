/* eslint-disable no-script-url */
define(['react', 'react-bootstrap', 'react-prop-types'], function(
  React,
  { Dropdown, MenuItem, Label },
  PropTypes
) {
  const renderRunButtons = (item, onSelect) => {
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
    return labels.map((l, i) => (
      <MenuItem
        href="javascript:void(0);"
        onSelect={onSelect}
        aria-label={`Search: ${l}`}
        eventKey={i}
      >
        <i className="fa fa-search fa-fw" aria-hidden="true" /> {l}
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
    return (
      <Dropdown
        disabled={disable}
        dropup={dropup}
        pullRight
        id={`actions-dropdown-${item.id}`}
      >
        <Dropdown.Toggle>
          <i className="fa fa-cog" aria-hidden="true" /> Actions
        </Dropdown.Toggle>
        <Dropdown.Menu style={{ overflow: 'visible !important' }}>
          <MenuItem header>View in search results page</MenuItem>
          {renderRunButtons(item, (queryKey) => onRunQuery(item, queryKey))}
          <MenuItem divider />
          <MenuItem header>Actions</MenuItem>
          <MenuItem
            href="javascript:void(0);"
            onClick={() => onToggleActive(item)}
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
          <MenuItem href="javascript:void(0);" onClick={() => onEdit(item)}>
            <i className="fa fa-pencil fa-fw" aria-hidden="true" /> Edit
          </MenuItem>
          <MenuItem href="javascript:void(0);" onClick={() => onDelete(item)}>
            <i className="fa fa-trash fa-fw" aria-hidden="true" /> Delete
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
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
