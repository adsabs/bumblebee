import { yupResolver } from '@hookform/resolvers';
import React from 'react';
import FlexView from 'react-flexview';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as Yup from 'yup';
import { FormErrorBoundary } from '../components';
import {
  AssociatedArticlesFormValues,
  ReduxState,
  relationOptions,
} from '../models';
import MainForm from './MainForm';

const validationSchema: Yup.ObjectSchema<AssociatedArticlesFormValues> = Yup.object().shape(
  {
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email()
      .required('Required'),
    relation: Yup.mixed().oneOf(
      relationOptions.map(({ key }) => key),
      'Must select a relation'
    ),
    customRelation: Yup.string().test(
      'customRelationRequired',
      'Must set a custom relation',
      function(value) {
        const isOther = this.parent.relation === 'other';
        return !(isOther && value === '');
      }
    ),
    sourceBibcode: Yup.string()
      .required('Source bibcode is required')
      .length(19, 'Invalid Bibcode'),
    associated: Yup.mixed().when('relation', {
      is: 'other',
      then: Yup.array<{ bibcode: string }>(
        Yup.object({
          bibcode: Yup.string()
            .required('Related bibcode, URL or DOI is blank')
            .test(
              'valideBibcode',
              'Must be a valid bibcode, URL or DOI',
              function(value) {
                return value.indexOf('/') !== -1 || value.length === 19;
              }
            ),
        })
      ),
      otherwise: Yup.array<{ bibcode: string }>(
        Yup.object({
          bibcode: Yup.string()
            .required('Associated bibcode is blank')
            .length(19, 'Invalid Bibcode'),
        })
      ),
    }),
    recaptcha: Yup.string().ensure(),
  }
);

export const defaultValues: AssociatedArticlesFormValues = {
  name: '',
  customRelation: '',
  sourceBibcode: '',
  associated: [{ bibcode: '' }],
  relation: 'none',
  email: '',
  recaptcha: '',
};

const emailSelector = ({ user }: ReduxState) => user.email;

const AssociatedReferences: React.FunctionComponent = () => {
  const email = useSelector<ReduxState, AssociatedArticlesFormValues['email']>(
    emailSelector
  );

  const methods = useForm<AssociatedArticlesFormValues>({
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
          Submit Associated Articles for the ADS Abstract Service
        </Heading>
        <FlexView column>
          <p>
            Use this form to submit correlated articles (errata, multiple part
            articles, etc) with other articles in the ADS. For instance:
          </p>
          <p>
            <Bold>1999ApJ...511L..65Y</Bold>: Erratum: An X-Ray Microlensing
            Test of AU-Scale Accretion Disk Structure in Q2237+0305
          </p>
          <p>is an erratum for:</p>
          <p>
            <Bold>1998ApJ...501L..41Y</Bold>: An X-Ray Microlensing Test of
            AU-Scale Accretion Disk Structure in Q2237+0305
          </p>
          <p>
            Such associated references are connected with links in the ADS
            database. If you know of any correlated references (errata, multiple
            part articles, etc) that do not have such links, please let us know
            about them by filling in the codes for these correlated articles in
            this form. The form accepts one bibcode for the main paper and one
            or more bibcodes for the associated articles. Use the "Add a Record"
            button to enter multiple records.
          </p>
        </FlexView>
        <FormProvider {...(methods as any)}>
          <form>
            <MainForm onSubmit={onSubmit} />
          </form>
        </FormProvider>
      </FlexView>
    </FormErrorBoundary>
  );
};

const Heading = styled.h2`
  margin-top: 0;
`;

const Bold = styled.span`
  font-weight: bold;
`;

export default AssociatedReferences;
