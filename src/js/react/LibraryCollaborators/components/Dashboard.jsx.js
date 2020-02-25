define([
  'react',
  'react-bootstrap',
  'es6!./AddCollaboratorModal.jsx',
  'es6!./PermissionList.jsx',
  'react-prop-types',
], function(
  React,
  { Button, Alert },
  AddCollaboratorModal,
  PermissionList,
  PropTypes
) {
  const renderAlerts = ({ add, get, edit }) => {
    if (
      edit.status === 'pending' ||
      add.status === 'pending' ||
      get.status === 'pending'
    ) {
      return (
        <div className="row text-center">
          <Alert bsStyle="info">
            <strong>
              <i className="fa fa-spinner fa-spin" aria-hidden="true" />
            </strong>{' '}
            {edit.status
              ? 'Updating permissions, one moment...'
              : add.status
              ? 'Creating new collaborator, one moment...'
              : get.status
              ? 'Loading...'
              : ''}
          </Alert>
        </div>
      );
    } else if (
      edit.status === 'failure' ||
      add.status === 'failure' ||
      get.status === 'failure'
    ) {
      return (
        <div className="row text-center">
          <Alert bsStyle="danger">
            <strong>
              <i className="fa fa-exclamation-triangle" aria-hidden="true" />
            </strong>{' '}
            {edit.error
              ? `Unable to update permission (${edit.error})`
              : add.error
              ? `Unable to add collaborator (${add.error})`
              : get.error
              ? `Unable to retrieve collaborators (${get.error})`
              : 'Something went wrong with the request'}
          </Alert>
        </div>
      );
    } else if (edit.status === 'success' || add.status === 'success') {
      return (
        <div className="row text-center">
          <Alert bsStyle="success">
            <strong>
              <i className="fa fa-check" aria-hidden="true" />
            </strong>{' '}
            {edit.status
              ? 'Permission updated!'
              : add.status
              ? 'Collaborator added!'
              : ''}
          </Alert>
        </div>
      );
    }
  };

  const initialState = {
    showAddCollaboratorModal: false,
  };
  class Dashboard extends React.Component {
    constructor(props) {
      super(props);
      this.state = initialState;
      this.onRevokeAccess = this.onRevokeAccess.bind(this);
      this.onChangePermission = this.onChangePermission.bind(this);
      this.onAddCollaborator = this.onAddCollaborator.bind(this);
    }

    onRevokeAccess(id) {
      const email = this.props.permissions[id].email;
      this.props.editCollaborator({
        id: this.props.library.id,
        email,
        permission: null,
      });
    }

    onChangePermission(id, permission) {
      const email = this.props.permissions[id].email;
      this.props.editCollaborator({
        id: this.props.library.id,
        email,
        permission,
      });
    }

    onAddCollaborator({ email, permission }) {
      this.setState({
        showAddCollaboratorModal: false,
        pendingAddCollaborator: true,
      });
      this.props.addCollaborator({
        id: this.props.library.id,
        email,
        permission,
      });
    }

    componentWillReceiveProps(nextProps) {
      this.setState(initialState);

      if (this.props.library.id !== nextProps.library.id) {
        this.props.getCollaborators(nextProps.library.id);
      }
    }

    componentDidMount() {
      this.props.getInitialData();
    }

    render() {
      const { permissions, requests } = this.props;
      const { showAddCollaboratorModal } = this.state;

      return (
        <section>
          <div className="row">
            <h3 className="h3">Collaborators</h3>
          </div>
          <div>
            <div className="row">
              <Button
                onClick={() =>
                  this.setState({ showAddCollaboratorModal: true })
                }
              >
                <i className="fa fa-user-plus fa-fw" aria-hidden="true" /> Add
                Collaborator
              </Button>
            </div>

            {Object.keys(permissions).length ? (
              <div className="row">
                <PermissionList
                  permissions={permissions}
                  onRevokeAccess={this.onRevokeAccess}
                  onChangePermission={this.onChangePermission}
                />
              </div>
            ) : (
              <div>
                <hr />
                <div className="row text-center">
                  You have no collaborators, yet. Please add one above
                </div>
              </div>
            )}
            {renderAlerts(requests)}
            <AddCollaboratorModal
              show={showAddCollaboratorModal}
              onHide={() => this.setState({ showAddCollaboratorModal: false })}
              onSubmit={this.onAddCollaborator}
            />
          </div>
        </section>
      );
    }
  }

  Dashboard.defaultProps = {
    permissions: {},
    addCollaborator: () => {},
    changePermission: () => {},
    revokeAccess: () => {},
  };

  Dashboard.propTypes = {
    permissions: PropTypes.object,
    addCollaborator: PropTypes.func,
    changePermission: PropTypes.func,
    revokeAccess: PropTypes.func,
    requests: PropTypes.object,
  };

  return Dashboard;
});
