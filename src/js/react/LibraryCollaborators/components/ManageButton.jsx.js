define(['react', 'prop-types', '../constants'], function(
  React,
  PropTypes,
  { Permissions }
) {
  const ManageButton = ({
    permission = Permissions.READ,
    onChange,
    ...otherProps
  }) => {
    const handleChange = (e) => {
      onChange(Permissions[e.currentTarget.value.toUpperCase()]);
    };

    return (
      <div>
        <span className="sr-only" id="permission-selected">
          {permission.label} permission selected
        </span>
        <select
          key={`select-${permission.id}`}
          id={`manage-permission-${permission.id}`}
          aria-labelledby="permission-selected"
          value={permission.id}
          onChange={handleChange}
          {...otherProps}
          className="form-control"
        >
          {Object.values(Permissions).map((item) => (
            <option
              key={`option-${item.id}`}
              value={item.id}
              title={item.description}
            >
              {item.label}
            </option>
          ))}
        </select>
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
