define([
  'react',
  'react-prop-types',
  'react-bootstrap',
  'es6!./PermissionEntry.jsx',
], function(React, PropTypes, { Table }, PermissionEntry) {
  const initialState = {};
  class PermissionList extends React.Component {
    constructor(props) {
      super(props);
      this.state = initialState;
    }

    render() {
      return (
        <Table striped hover>
          <thead>
            <tr>
              <th>Email</th>
              <th id="table-title-permission">Permission</th>
              <th>
                <span className="sr-only">Revoke Access </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.props.permissions).map((id) => (
              <PermissionEntry
                data={this.props.permissions[id]}
                key={id}
                onRevokeAccess={() => this.props.onRevokeAccess(id)}
                onChangePermission={(change) =>
                  this.props.onChangePermission(id, change)
                }
                pendingPermissionChange={true}
              />
            ))}
          </tbody>
        </Table>
      );
    }
  }

  PermissionList.defaultProps = {
    permissions: {},
    onRevokeAccess: () => {},
    onChangePermission: () => {},
  };

  PermissionList.propTypes = {
    permissions: PropTypes.object,
    onRevokeAccess: PropTypes.func,
    onChangePermission: PropTypes.func,
  };

  return PermissionList;
});
