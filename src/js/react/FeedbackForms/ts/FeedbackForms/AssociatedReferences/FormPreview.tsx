import React, { useCallback } from 'react';
import { IfFulfilled, IfRejected, useAsync } from 'react-async';
import { useFormContext } from 'react-hook-form';
import { apiFetch, ApiTarget } from '../api';
import { PreviewModal } from '../components';
import { AssociatedArticlesFormValues } from '../models';
import PreviewBody from './PreviewBody';
import { useRecaptcha } from '../../hooks/useRecaptcha';

const fetchBibcodes= async (args: unknown) => {
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

const FormPreview: React.FunctionComponent<IFormPreview> = ({ onSubmit }) => {
  const { getValues, trigger, setError, reset, setValue } = useFormContext<
    AssociatedArticlesFormValues
  >();
  const { execute } = useRecaptcha('associated');
  const [show, setShow] = React.useState(false);
  const [ids, setIds] = React.useState<string[]>([]);
  const state = useAsync({
    deferFn: fetchBibcodes,
  });
  const { run, isPending, isFulfilled, data, error } = state;

  const handleReset = () => {
    reset();
    setValue('relation', 'none');
  };

  const onPreview = async () => {
    if (await trigger()) {
      const { sourceBibcode, associated, relation } = getValues();
      // if relation is other, only validate bibcode if it looks like a bibcode
      const rest =
        relation !== 'other'
          ? associated.map((a) => a.bibcode)
          : associated
              .filter(
                (a) => a.bibcode.length === 19 && a.bibcode.indexOf('/') === -1
              )
              .map((a) => a.bibcode);
      const bibcodeSet = new Set<string>([sourceBibcode, ...rest]);
      const uniqBibs = Array.from(bibcodeSet);
      setIds(uniqBibs);
      run(uniqBibs);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
    const params = getValues();
    params.recaptcha = await execute();
    await submitFeedback(createFeedbackString(params));
  }, [execute, getValues, onSubmit]);

  React.useEffect(() => {
    if (isFulfilled) {
      const { associated, sourceBibcode } = getValues();
      if (ids.length !== data?.response.numFound) {
        const bibs = data?.response.docs.map((e) => e.bibcode);
        const diff = ids.filter((e) => !bibs?.includes(e));

        // if the source bibcode is the wrong one, set an error there
        if (diff.includes(sourceBibcode)) {
          setError('sourceBibcode', {
            type: 'validate',
            message: "Bibcode wasn't found in ADS",
          });
        }

        // find all associated entries, and set errors
        associated.forEach(({ bibcode }, i) => {
          if (diff.includes(bibcode)) {
            setError(`associated[${i}].bibcode`, {
              type: 'validate',
              message: "Bibcode wasn't found in ADS",
            });
          }
        });
      } else {
        setShow(true);
      }
    }
  }, [isFulfilled]);

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
            <i className="fa fa-spinner fa-spin" aria-hidden />
          ) : (
            'Preview'
          )}
        </button>
        <button type="button" className="btn btn-default" onClick={handleReset}>
          Reset
        </button>
      </div>
      <IfRejected state={state}>
        <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
          {(error as any)?.responseJSON?.error || 'Server Error'}
        </div>
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          Sorry! we're having issues server-side. Please try again or send us an
          email at <strong>adshelp(at)cfa.harvard.edu</strong>
        </div>
      </IfRejected>

      <IfFulfilled state={state}>
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
          <PreviewBody />
        </PreviewModal>
      </IfFulfilled>
    </>
  );
};

export default FormPreview;

type FeedbackRequest = {
  origin: 'user_submission';
  'g-recaptcha-response': string;
  _subject: 'Associated Articles';
  name: string;
  email: AssociatedArticlesFormValues['email'];
  source: AssociatedArticlesFormValues['sourceBibcode'];
  target: string[];
  relationship: AssociatedArticlesFormValues['relation'];
  custom_name: AssociatedArticlesFormValues['customRelation'];
};

const createFeedbackString = (
  props: AssociatedArticlesFormValues
): FeedbackRequest => {
  const {
    name,
    email,
    recaptcha,
    relation,
    sourceBibcode,
    associated,
    customRelation,
  } = props;

  return {
    origin: 'user_submission',
    'g-recaptcha-response': recaptcha,
    _subject: 'Associated Articles',
    name,
    email,
    source: sourceBibcode,
    target: associated.map((a) => a.bibcode),
    relationship: relation,
    custom_name: customRelation,
  };
};
