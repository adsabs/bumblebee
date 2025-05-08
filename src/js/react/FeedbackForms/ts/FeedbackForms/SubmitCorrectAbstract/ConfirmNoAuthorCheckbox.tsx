import React, { FC, useEffect } from 'react';
import { FormGroup } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { SubmitCorrectAbstractFormValues } from '../models';


export const ConfirmNoAuthorCheckbox: FC = () => {
  const { control, register, setValue, unregister, errors } = useFormContext();

  const authors = useWatch<SubmitCorrectAbstractFormValues['authors']>({
    control,
    name: 'authors',
  });

  const confirmNoAuthor = useWatch<
    SubmitCorrectAbstractFormValues['confirmNoAuthor']
  >({
    control,
    name: 'confirmNoAuthor',
    defaultValue: false,
  });

  useEffect(() => {
    register({ name: 'confirmNoAuthor' });
    return () => unregister('confirmNoAuthor');
  }, [register]);

  if (!authors || authors.length === 0) {
    return (
      <FormGroup
        className={errors?.confirmNoAuthor ? `has-feedback has-error` : ''}
      >
        <Label hasError={errors?.confirmNoAuthor}>
          <input
            type="checkbox"
            name="confirmNoAuthor"
            checked={confirmNoAuthor}
            required
            onChange={(e) =>
              setValue('confirmNoAuthor', e.currentTarget.checked)
            }
            ref={register}
          />{' '}
          Abstract has no author(s)?
        </Label>
        {errors?.confirmNoAuthor ? (
          <span className="help-block with-errors">
            {errors.confirmNoAuthor.message}
          </span>
        ) : null}
      </FormGroup>
    );
  }
  return null;
};

const Label = styled.label<{ hasError: boolean }>`
  margin-bottom: 1rem;
  color: ${(props) => (props.hasError ? '#c7311a' : 'auto')};
`;
