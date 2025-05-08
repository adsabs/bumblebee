import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

interface IPreviewProps {
  children?: React.ReactNode;
  disabled?: boolean;
  beforeOpen?: () => Promise<boolean> | boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const Preview: React.FunctionComponent<IPreviewProps> = ({
  children,
  disabled,
  beforeOpen,
  onSubmit,
  onCancel,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
    setOpen(false);
  };
  const handleCancel = () => {
    setOpen(false);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };
  const handleOpen = async () => {
    let allow = true;
    if (typeof beforeOpen === 'function') {
      allow = await beforeOpen();
    }
    if (allow) {
      setOpen(true);
    }
  };

  return (
    <React.Fragment>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleOpen}
        disabled={disabled}
      >
        Preview
      </button>
      <Modal show={open} onHide={handleCancel} backdrop="static" bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Previewing...</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            type="button"
            className="btn btn-default"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

Preview.defaultProps = {
  children: null,
  disabled: false,
  beforeOpen: async () => {
    return true;
  },
  onSubmit: () => {
    return null;
  },
  onCancel: () => {
    return null;
  },
};

Preview.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  beforeOpen: PropTypes.func,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Preview;
