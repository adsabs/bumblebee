// @ts-nocheck
define([
  'underscore',
  'react',
  'react-bootstrap',
  '../containers/ClassicLoginForm',
], function(
  { debounce },
  React,
  {
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    HelpBlock,
    Button,
    Alert,
    Modal,
  },
  ClassicLoginForm
) {
  const getStatusMessage = ({ status, error }) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-info">
            <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Sending
            request...
          </span>
        );
      case 'failure':
        return (
          <span className="text-danger">
            {error ? error : 'Unable to import'}
          </span>
        );
    }
  };

  const initialState = {
    isLoggedIn: false,
    showModal: false,
    new: 0,
    existing: 0,
  };

  class ImportNotificationsForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = initialState;
      this.onSubmit = this.onSubmit.bind(this);
      this.onLogin = this.onLogin.bind(this);
      this.onHide = this.onHide.bind(this);
      this.onChangeUser = this.onChangeUser.bind(this);
      this.beginImport = debounce(this.beginImport, 1000);
    }

    onSubmit(e) {
      e.preventDefault();
      this.beginImport();
    }

    beginImport() {
      this.props.importClassic();
    }

    onLogin() {
      this.setState({ isLoggedIn: true });
    }

    onChangeUser() {
      this.setState({ isLoggedIn: false });
    }

    onHide() {
      this.setState({ showModal: false });
      this.props.onSuccess();
    }

    componentWillReceiveProps(next) {
      if (
        this.props.importClassicRequest.status !==
          next.importClassicRequest.status &&
        next.importClassicRequest.status === 'success'
      ) {
        this.setState({
          showModal: true,
          new: next.importClassicRequest.result.new.length,
          existing: next.importClassicRequest.result.existing.length,
        });
      }
    }

    render() {
      return (
        <div style={{ paddingTop: '1rem' }}>
          <ClassicLoginForm
            onLogin={() => this.onLogin()}
            onChangeUser={this.onChangeUser}
          />
          {this.state.isLoggedIn && (
            <div style={{ marginTop: '2rem' }}>
              <Form onSubmit={this.onSubmit}>
                <div className="row">
                  <div className="col-sm-4">
                    <Button type="submit" bsStyle="primary" bsSize="large">
                      Begin Import
                    </Button>
                  </div>
                  <div
                    className="col-sm-4 text-center"
                    style={{ paddingTop: '1rem' }}
                  >
                    {getStatusMessage(this.props.importClassicRequest)}
                  </div>
                </div>
              </Form>
            </div>
          )}
          {this.state.showModal && (
            <Modal.Dialog show={this.state.showModal} onHide={this.onHide}>
              <Modal.Header>
                <Modal.Title>Import Successful</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p>
                  We successfully imported <strong>{this.state.new}</strong> new
                  notification{this.state.new !== 1 ? 's' : ''}
                </p>
                <p>
                  and found <strong>{this.state.existing}</strong> existing
                  notification{this.state.existing !== 1 ? 's' : ''}
                </p>
              </Modal.Body>

              <Modal.Footer>
                <Button bsStyle="primary" onClick={this.onHide}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          )}
        </div>
      );
    }
  }

  ImportNotificationsForm.defaultProps = {
    onSuccess: () => {},
    importClassic: () => {},
  };

  return ImportNotificationsForm;
});
