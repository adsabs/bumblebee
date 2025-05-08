import React from 'react';
import { Modal } from 'react-bootstrap';
import FlexView from 'react-flexview';

export enum AlertType {
  DEFAULT = 'default',
  SUCCESS = 'success',
  LOADING = 'loading',
  ERROR = 'error',
}

interface IAlertModalProps {
  title?: string;
  timeout?: number;
  type?: AlertType;
}

const childrenContainerStyles: React.CSSProperties = {
  marginLeft: '1rem',
  padding: '0 1rem 0 1rem',
};

const AlertModal: React.FC<IAlertModalProps> = (props) => {
  const [open, setOpen] = React.useState(true);
  const { title, children, timeout = 3000, type = AlertType.DEFAULT } = props;

  const close = React.useCallback(() => setOpen(false), [setOpen]);

  React.useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (open) {
      id = setTimeout(close, timeout);
    }
    return () => clearTimeout(id);
  }, [open, close, timeout]);

  return (
    <Modal show={open} backdrop="static" onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{title || getTitle(type)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FlexView vAlignContent="center">
          <FlexView shrink>{getIcon(type)}</FlexView>
          <div style={childrenContainerStyles}>{children}</div>
        </FlexView>
      </Modal.Body>
    </Modal>
  );
};

const getTitle = (type: AlertType) => {
  switch (type) {
    case AlertType.SUCCESS:
      return 'Success';
    case AlertType.LOADING:
      return 'Loading';
    case AlertType.ERROR:
      return 'Error';
    default:
      return 'Alert';
  }
};

const getIcon = (type: AlertType) => {
  switch (type) {
    case AlertType.SUCCESS:
      return <i className="fa fa-check fa-2x text-success" aria-hidden/>;
    case AlertType.LOADING:
      return <i className="fa fa-spinner fa-spin fa-2x" aria-hidden/>;
    case AlertType.ERROR:
      return (
        <i
          className="fa fa-exclamation-triangle fa-2x text-danger"
          aria-hidden
        />
      );
    default:
      return <i className="fa fa-exclamation-triangle fa-2x" aria-hidden/>;
  }
};

export default AlertModal;
