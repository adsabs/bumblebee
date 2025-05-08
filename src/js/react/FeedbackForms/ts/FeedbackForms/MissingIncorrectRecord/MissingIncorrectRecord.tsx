import { yupResolver } from '@hookform/resolvers';
import React from 'react';
import FlexView from 'react-flexview';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FormErrorBoundary } from '../components';
import { MissingIncorrectRecordFormValues, ReduxState } from '../models';
import MainForm from './MainForm';
import { validationSchema } from './validationSchema';

export const defaultValues: MissingIncorrectRecordFormValues = {
  name: '',
  email: '',
  bibcodes: [{ cited: '', citing: '' }],
  recaptcha: '',
};

const emailSelector = ({ user }: ReduxState) => user.email;

const MissingIncorrectRecord: React.FunctionComponent = () => {
  const email = useSelector<
    ReduxState,
    MissingIncorrectRecordFormValues['email']
  >(emailSelector);

  const methods = useForm<MissingIncorrectRecordFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...defaultValues,
      email: email ? email : '',
    },
  });

  const onSubmit = methods.handleSubmit(() => undefined);

  return (
    <FormErrorBoundary>
      <FlexView column>
        <Heading>
          Submit missing references for the ADS Abstract Service
        </Heading>
        <FlexView column>
          <p>
            Please use this form to submit one or more citations currently
            missing from our databases.
          </p>
          <p>
            In order to use this form you will need to know the bibcodes of the
            citing and cited papers, and enter them in the appropriate fields.
          </p>
          <p>
            If either the citing or cited paper is not in ADS you should{' '}
            <a href="#feedback/correctabstract">submit a record</a> for it
            first.
          </p>
        </FlexView>
        <FormProvider {...(methods as any)}>
          <form>
            <MainForm onSubmit={onSubmit}/>
          </form>
        </FormProvider>
      </FlexView>
    </FormErrorBoundary>
  );
};

const Heading = styled.h2`
  margin-top: 0;
`;

export default MissingIncorrectRecord;
