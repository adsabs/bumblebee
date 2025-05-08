import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertModal } from '../components';
import { AlertType } from '../components/AlertModal';
import { MissingIncorrectRecordFormValues } from '../models';

const FormStatus: React.FunctionComponent = () => {
  const [doneSubmitting, setDoneSubmitting] = React.useState(false);

  const {
    errors,
    formState: { isSubmitting, isSubmitted },
  } = useFormContext<MissingIncorrectRecordFormValues>();

  React.useEffect(() => {
    if (!isSubmitting && isSubmitted) {
      setDoneSubmitting(true);
      setTimeout(() => setDoneSubmitting(false), 5000);
    }
  }, [isSubmitting, isSubmitted]);

  if (Object.keys(errors).length > 0) {
    return (
      <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
        Form errors, check entries above
      </div>
    );
  }
  if (isSubmitting) {
    return <AlertModal type={AlertType.LOADING}>Submitting...</AlertModal>;
  }

  if (doneSubmitting) {
    return (
      <AlertModal type={AlertType.SUCCESS}>Submitted, thank you!</AlertModal>
    );
  }

  return null;
};

export default FormStatus;
