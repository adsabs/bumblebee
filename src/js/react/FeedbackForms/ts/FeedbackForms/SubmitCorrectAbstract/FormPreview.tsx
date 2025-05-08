import React from 'react';
import {useFormContext} from 'react-hook-form';
import { apiFetch, ApiTarget, isAjaxError } from "../api";
import {PreviewModal} from '../components';
import {EntryType, SubmitCorrectAbstractFormValues} from '../models';
import {createDiffString, ProcessedFormValues, processTree} from './DiffView';
import PreviewBody from './PreviewBody';
import {defaultValues, FormSubmissionCtx, OriginCtx} from './SubmitCorrectAbstract';
import {useRecaptcha} from '../../hooks/useRecaptcha';

type FeedbackRequest = {
  original: ProcessedFormValues;
  new: ProcessedFormValues;
  origin: string;
  _subject: string;
  name: string;
  email: SubmitCorrectAbstractFormValues['email'];
  diff: string;
  'g-recaptcha-response': string;
};

const submitFeedback = async (data: FeedbackRequest) => {
  try {
    return await apiFetch({
      target: ApiTarget.FEEDBACK,
      options: {
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
      },
    });
  } catch (e) {
    return await apiFetch({
      target: ApiTarget.FEEDBACK_FALLBACK,
      options: {
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
      },
    });
  }
};

interface IFormPreview {
  onSubmit?: () => void;
  disabled?: boolean;
}

const FormPreview: React.FunctionComponent<IFormPreview> = ({
  onSubmit,
  disabled = false,
}) => {
  const {trigger, getValues, reset} = useFormContext<
    SubmitCorrectAbstractFormValues
  >();
  const {execute} = useRecaptcha('submit_correct_abstract');
  const [show, setShow] = React.useState(false);
  const handlePreview = async () => {
    if (await trigger()) {
      setShow(true);
    }
  };

  const handleReset = () => reset(defaultValues);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const {origin} = React.useContext(OriginCtx);
  const {setSubmissionState} = React.useContext(FormSubmissionCtx);

  const handleSubmit = async () => {
    setSubmissionState({status: 'pending'});


    if (previewRef.current) {
      const currentValues = {
        ...origin,
        ...getValues(),
        recaptcha: await execute(),
      };

      try {
        await submitFeedback(
          createFeedbackString(
            origin,
            currentValues,
            getSafeDiff(origin, currentValues),
          ),
        );
        if (typeof onSubmit === 'function') {
          onSubmit();
        }

        setSubmissionState({status: 'success'});
        handleReset();
      } catch (e) {
        if (isAjaxError(e)) {
          setSubmissionState({
            status: 'error',
            message: e.responseJSON?.message,
            code: e.status,
            changes: getSafeDiff(origin, currentValues),
          });
        } else {
          // fallback for unexpected error shapes
          setSubmissionState({
            status: 'error',
            message: 'Unexpected error occurred.',
            code: 999,
            changes: getSafeDiff(origin, currentValues),
          });
        }
      }
    }
  };

  return (
    <>
      <div className="btn-toolbar" role="toolbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePreview}
          disabled={disabled}
        >
          Preview
        </button>
        <button type="button" className="btn btn-default" onClick={handleReset}>
          Reset
        </button>
      </div>
      <PreviewModal
        show={show}
        onHide={() => {
          setShow(false);
        }}
        onSubmit={() => {
          void handleSubmit();
          setShow(false);
        }}
        onCancel={() => {
          setShow(false);
        }}
      >
        <PreviewBody ref={previewRef}/>
      </PreviewModal>
    </>
  );
};


const getSafeDiff = (src: SubmitCorrectAbstractFormValues, curr: SubmitCorrectAbstractFormValues) => {
  try {
    return encodeURIComponent(createDiffString(src, curr));
  } catch (e) {
    return 'Unable to generate diff';
  }
};

const createFeedbackString = (
  original: SubmitCorrectAbstractFormValues,
  current: SubmitCorrectAbstractFormValues,
  previewText: string,
): FeedbackRequest => {
  const {name, email, recaptcha, entryType} = current;
  return {
    origin: 'user_submission',
    'g-recaptcha-response': recaptcha,
    _subject: `${entryType === EntryType.Edit ? 'Updated' : 'New'} Record`,
    original: processTree(original),
    new: processTree(current),
    name,
    email,
    diff: entryType === EntryType.Edit ? previewText : '',
  };
};

export default FormPreview;
