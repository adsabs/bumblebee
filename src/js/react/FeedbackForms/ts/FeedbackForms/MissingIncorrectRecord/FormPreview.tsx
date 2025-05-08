import React from 'react';
import {IfFulfilled, IfRejected, useAsync} from 'react-async';
import {useFormContext} from 'react-hook-form';
import {JSONResponse} from '../../hooks';
import {apiFetch, ApiTarget} from '../api';
import {PreviewModal} from '../components';
import {MissingIncorrectRecordFormValues} from '../models';
import {defaultValues} from './MissingIncorrectRecord';
import PreviewBody, {fetchReference} from './PreviewBody';
import {useRecaptcha} from '../../hooks/useRecaptcha';

const fetchBibcodes = (args: unknown) => {
  const [bibcodes] = args as [string[]];
  return apiFetch({
    target: ApiTarget.SEARCH,
    query: {
      fl: 'bibcode',
      q: `identifier:(${bibcodes.join(' OR ')})`,
      rows: bibcodes.length,
    },
  });
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
}

const FormPreview: React.FunctionComponent<IFormPreview> = ({onSubmit}) => {
  const {getValues, setError, trigger, reset} = useFormContext<
    MissingIncorrectRecordFormValues
  >();
  const {execute} = useRecaptcha('missing_incorrect_record')
  const [show, setShow] = React.useState(false);
  const [ids, setIds] = React.useState<string[]>([]);
  const state = useAsync<JSONResponse>({
    deferFn: fetchBibcodes,
  });
  const {run, isPending, isFulfilled, data, error} = state;

  const handleReset = () => reset(defaultValues);

  const onPreview = async () => {
    if (await trigger()) {
      const {bibcodes} = getValues();
      const bibcodeSet = new Set<string>();
      bibcodes.forEach(({cited, citing}) => {
        bibcodeSet.add(cited.trim());
        bibcodeSet.add(citing.trim());
      });
      const uniqBibs = Array.from(bibcodeSet);
      setIds(uniqBibs);
      run(uniqBibs);
    }
  };

  React.useEffect(() => {
    if (isFulfilled) {
      const {bibcodes} = getValues();

      if (ids.length !== data?.response.numFound) {
        const bibs = data?.response.docs.map((e) => e.bibcode);
        const diff = ids.filter((e) => !bibs?.includes(e));

        bibcodes.forEach(({citing, cited}, i) => {
          if (diff.includes(citing.trim())) {
            setError(`bibcodes[${i}].citing`, {
              type: 'validate',
              message: 'Bibcode wasn\'t found in ADS',
            });
          }

          if (diff.includes(cited.trim())) {
            setError(`bibcodes[${i}].cited`, {
              type: 'validate',
              message: 'Bibcode wasn\'t found in ADS',
            });
          }
        });
      } else {
        setShow(true);
      }
    }
  }, [isFulfilled]);

  const handleSubmit = async () => {
    try {
      const values = {...getValues(), recaptcha: await execute()};
      const exportResponse = await fetchReference(values.bibcodes);

      await submitFeedback(
        createFeedbackString(values, exportResponse?.export.split(/\n/g)),
      );
      if (typeof onSubmit === 'function') {
        onSubmit();
      }
    } catch (e) {
      // TODO: handle submission error that bubbles to here
    }
  };

  return (
    <>
      <div className="btn-toolbar" role="toolbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onPreview}
          disabled={isPending}
        >
          {isPending ? (
            <i className="fa fa-spinner fa-spin" aria-hidden/>
          ) : (
            'Preview'
          )}
        </button>
        <button type="button" className="btn btn-default" onClick={handleReset}>
          Reset
        </button>
      </div>

      <IfRejected state={state}>
        <div className="alert alert-danger" style={{marginTop: '1rem'}}>
          {(error as any)?.responseJSON?.error || 'Server Error'}
        </div>
      </IfRejected>

      <IfFulfilled state={state}>
        <PreviewModal
          show={show}
          onHide={() => {
            setShow(false);
          }}
          onSubmit={() => {
            handleSubmit();
            setShow(false);
          }}
          onCancel={() => {
            setShow(false);
          }}
        >
          <PreviewBody/>
        </PreviewModal>
      </IfFulfilled>
    </>
  );
};

type FeedbackRequest = {
  origin: 'user_submission';
  'g-recaptcha-response': string;
  _subject: 'Missing References';
  name: string;
  email: string;
  references: {
    citing: string;
    cited: string;
    refstring: string;
  }[];
};

const createFeedbackString = (
  props: MissingIncorrectRecordFormValues,
  referenceString: string[],
): FeedbackRequest => {
  const {name, email, bibcodes, recaptcha} = props;

  return {
    origin: 'user_submission',
    'g-recaptcha-response': recaptcha,
    _subject: 'Missing References',
    name,
    email,
    references: bibcodes.map(({citing, cited}) => ({
      citing: citing.trim(),
      cited: cited.trim(),
      refstring: referenceString.find(ref => ref.startsWith(cited.trim())) ?? 'not-found'
    })),
  };
};

export default FormPreview;
