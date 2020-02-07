define([
  'react',
  'react-prop-types',
  'react-bootstrap',
  '../constants',
  'es6!./ManageButton.jsx',
], function(
  React,
  PropTypes,
  { Button, Modal },
  { Permissions },
  ManageButton
) {
  const ConfirmModal = ({ show, onHide, onOk, children }) => {
    return (
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="revoke-access-confirm__title"
      >
        <Modal.Header>
          <Modal.Title id="revoke-access-confirm__title">
            Confirm Revoke Access
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button bsSize="lg" onClick={onHide}>
            Cancel
          </Button>
          <Button bsSize="lg" bsStyle="danger" onClick={onOk}>
            Revoke Access
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const initialState = {
    showConfirmRevokeModal: false,
    email: '',
    permission: Permissions.ADMIN,
  };
  class PermissionEntry extends React.Component {
    constructor(props) {
      super(props);

      const { email, permission } = props.data;
      this.state = {
        initialState,
        email,
        permission,
      };
      this.onManagePermissions = this.onManagePermissions.bind(this);
      this.openConfirmRevocationModal = this.openConfirmRevocationModal.bind(
        this
      );
      this.closeConfirmRevocationModal = this.closeConfirmRevocationModal.bind(
        this
      );
      this.doRevocation = this.doRevocation.bind(this);
    }

    onManagePermissions(permission) {
      this.setState({ permission });
      this.props.onChangePermission(permission);
    }

    openConfirmRevocationModal() {
      this.setState({ showConfirmRevokeModal: true });
    }

    doRevocation() {
      this.setState({ showConfirmRevokeModal: false });
      this.props.onRevokeAccess();
    }

    closeConfirmRevocationModal() {
      this.setState({ showConfirmRevokeModal: false });
    }

    render() {
      return (
        <tr>
          <td>
            <span>
              <i className="fa fa-user-circle-o" aria-hidden="true" />{' '}
              {this.state.email}
            </span>
          </td>
          <td>
            <ManageButton
              permission={this.state.permission}
              onChange={this.onManagePermissions}
            />
          </td>
          <td style={{ display: 'grid', justifyContent: 'end' }}>
            <Button
              bsStyle="danger"
              bsSize="sm"
              onClick={this.openConfirmRevocationModal}
            >
              Revoke Access{' '}
              <span className="sr-only">for {this.state.email}</span>
            </Button>
          </td>
          <ConfirmModal
            show={this.state.showConfirmRevokeModal}
            onHide={this.closeConfirmRevocationModal}
            onOk={this.doRevocation}
          >
            <p>
              This will revoke all permissions for{' '}
              <strong>{this.state.email}</strong>.
            </p>
            <p>Are you sure?</p>
          </ConfirmModal>
        </tr>
      );
    }
  }
  PermissionEntry.defaultProps = {
    data: null,
    onRevokeAccess: () => {},
    onChangePermission: () => {},
    pendingPermissionChange: false,
    isNew: false,
  };
  PermissionEntry.propTypes = {
    data: PropTypes.object.isRequired,
    onRevokeAccess: PropTypes.func,
    onChangePermission: PropTypes.func,
    pendingPermissionChange: PropTypes.bool,
    isNew: PropTypes.bool,
  };
  return PermissionEntry;
});
