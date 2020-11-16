define(['react', 'prop-types', 'react-bootstrap', '../constants'], function(
  React,
  PropTypes,
  { DropdownButton, MenuItem },
  { Permissions }
) {
  const ManageButton = ({ permission, onChange, ...otherProps }) => {
    return (
      <div>
        <span className="sr-only" id="permission-selected">
          {permission.label} permission selected
        </span>
        <DropdownButton
          bsStyle="default"
          bsSize="sm"
          style={{
            minWidth: '120px',
          }}
          {...otherProps}
          title={permission.label}
          key={permission.id}
          id={`manage-permission-${permission.id}`}
          aria-labelledby="permission-selected"
          dropup
        >
          {Object.keys(Permissions).map((key) => {
            const item = Permissions[key];

            if (permission !== item) {
              return (
                <MenuItem
                  key={item.id}
                  eventKey={item.id}
                  href="javascript:void(0);"
                  onSelect={() => onChange(item)}
                  title={item.description}
                >
                  {item.label}
                </MenuItem>
              );
            }

            return null;
          })}
        </DropdownButton>
      </div>
    );
  };

  ManageButton.defaultProps = {
    permission: Permissions.READ,
    onChange: () => {},
  };

  ManageButton.propTypes = {
    permission: PropTypes.object,
    onChange: PropTypes.func,
  };

  return ManageButton;
});
