import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertModal } from '../components';
import { AlertType } from '../components/AlertModal';
import { SubmitCorrectAbstractFormValues } from '../models';
import { FormSubmissionCtx } from './SubmitCorrectAbstract';

const FormStatus: React.FunctionComponent = () => {
  const { submissionState } = React.useContext(FormSubmissionCtx);

  const { errors } = useFormContext<SubmitCorrectAbstractFormValues>();

  if (Object.keys(errors).length > 0) {
    return (
      <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
        Form errors, check entries above
      </div>
    );
  }

  if (submissionState === null) {
    return null;
  }

  if (submissionState?.status === 'pending') {
    return <AlertModal type={AlertType.LOADING}>Submitting...</AlertModal>;
  }

  if (submissionState?.status === 'success') {
    return (
      <AlertModal type={AlertType.SUCCESS}>Submitted, thank you!</AlertModal>
    );
  }

  if (submissionState?.status === 'error') {
    if (submissionState.code === 500 || submissionState.code >= 400 && submissionState.code <= 499) {
      return (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          There was an error processing the request, please try again, or send
          an email with your changes to{' '}
          <strong>adshelp(at)cfa.harvard.edu</strong>.
        </div>
      );
    } else {
      return (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          <p>{submissionState.message}</p>
          <p>
            Please try again, or send an email with your changes to{' '}
            <strong>adshelp(at)cfa.harvard.edu</strong>.
          </p>
        </div>
      );
    }
  }

  return null;
};

export default FormStatus;
