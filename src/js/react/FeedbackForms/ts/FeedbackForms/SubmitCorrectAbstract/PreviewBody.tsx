import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { EntryType, SubmitCorrectAbstractFormValues } from '../models';
import DiffView, { processTree } from './DiffView';
import { OriginCtx } from './SubmitCorrectAbstract';
import { FormErrorBoundary } from '../components';

const PreviewBody = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { getValues } = useFormContext<SubmitCorrectAbstractFormValues>();
  const { origin } = React.useContext(OriginCtx);

  // make sure that undefined values get filled by the original
  const currentValues = {
    ...origin,
    ...getValues(),
  };
  const { name, email, entryType } = currentValues;

  return (
    <div ref={ref}>
      <pre>
        {`From: ${name}
Address: ${email}`}
        {entryType === EntryType.New &&
          `

New Record:

`}
        {entryType === EntryType.New &&
          JSON.stringify(processTree(currentValues), null, 2)}
      </pre>
      {entryType === EntryType.Edit && (
        <>
          <p>Summary of corrections/updates:</p>
          <FormErrorBoundary msg={<>Unable to load preview. You can still submit.</>}>
            <ScrollView>
              <DiffView left={origin} right={currentValues}/>
            </ScrollView>
          </FormErrorBoundary>
        </>
      )}


    </div>
  );
});


const ScrollView = styled.div`
  max-height: 600px;
  overflow-y: scroll;
`;

export default PreviewBody;
