import React from 'react';
import {Modal, ModalProps} from 'react-bootstrap';

interface IPreviewModalProps extends ModalProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const PreviewModal: React.FunctionComponent<IPreviewModalProps> = ({
  onSubmit,
  onCancel,
  children,
  ...modalProps
}) => {
  return (
    <Modal
      backdrop="static"
      bsSize="large"
      {...modalProps}
      className="feedback-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Previewing...</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <div
          className="btn-toolbar"
          role="toolbar"
          aria-label="Recaptcha submission toolbar"
          style={{marginBottom: '2rem'}}
        >
          <button type="submit" className="btn btn-primary" onClick={onSubmit}>
            Submit
          </button>
          <button type="button" className="btn btn-default" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <div className="form-group">
          <div className="g-recaptcha">
            <small className="recaptcha-msg">This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of
                Service</a> apply.</small>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
