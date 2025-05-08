import React from 'react';
import Async from 'react-async';
import { useFormContext } from 'react-hook-form';
import { apiFetch, ApiTarget } from '../api';
import { MissingIncorrectRecordFormValues } from '../models';

const getRef = (bibcode: string, refs: string[]) => refs.find(ref => ref.startsWith(bibcode));


export const generatePreview = (
  { bibcodes, email, name }: MissingIncorrectRecordFormValues,
  data: { export: string },
  ref: React.Ref<HTMLPreElement>,
) => {
  if (data && data.export) {
    const refs = data.export.split(/\n/g);
    return (
      <pre ref={ref}>
        {`From: ${name}
Address: ${email}

Missing references:
${bibcodes.map((entry, i) => `${i + 1}:${i < 9 ? '  ' : ' '}${entry.citing} -> ${getRef(entry.cited, refs) ?? ''}`).join('\n')}
`}</pre>
    );
  } else {
    return 'Sorry, unable to generate preview (you can still submit)';
  }
};

export const fetchReference = (
  bibcodes: MissingIncorrectRecordFormValues['bibcodes'],
) => {
  return apiFetch({
    target: ApiTarget.EXPORT + 'custom',
    options: {
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        bibcode: bibcodes.map((e) => e.cited),
        format: ['%R (%1l (%Y), %Q)'],
        sort: ['bibcode desc']
      }),
    },
  });
};

const PreviewBody = React.forwardRef<HTMLPreElement>((_, ref) => {
  const { getValues } = useFormContext<MissingIncorrectRecordFormValues>();

  const fetchReferenceString = React.useCallback(() => {
    const { bibcodes } = getValues();

    return fetchReference(bibcodes);
  }, []);

  return (
    <Async promiseFn={fetchReferenceString}>
      <Async.Pending>loading...</Async.Pending>
      <Async.Fulfilled>
        {(data: any) => generatePreview(getValues(), data, ref)}
      </Async.Fulfilled>
      <Async.Rejected>
        {(error) => (
          <>
            <p>Sorry, unable to generate preview (you can still submit)</p>
            <div className="alert alert-danger">
              {(error as any)?.responseJSON?.error || 'Server Error'}
            </div>
          </>
        )}
      </Async.Rejected>
    </Async>
  );
});

export default PreviewBody;
