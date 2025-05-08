import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FlexView from 'react-flexview';
import styled from 'styled-components';
import { SubmitCorrectAbstractFormValues, Url, urlOptions } from '../models';
import { Control, SelectControl } from '../components';
import { getErrorMessage } from './helpers/getErrorMessage';

const ControlRow = styled.div`
  display: flex;
  justify-content: flex-start;

  & > * {
    flex-basis: 50%;
  }

  & > *:not(:first-child) {
    margin-left: 1rem;
  }
`;

const ControlContainer = styled.div`
  margin-bottom: 1rem;
`;

const name = 'urls';

const UrlsList: React.FC = () => {
  const { control, register, errors } = useFormContext<SubmitCorrectAbstractFormValues>();
  const { fields, append, remove } = useFieldArray<Url>({
    control,
    name,
  });

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({
      value: '',
    });
  };

  return (
    <ControlContainer>
      {fields.map(({ id, type, value }, index) => {
        return (
          <ControlRow key={id}>
            <SelectControl
              field={`${name}[${index}].type`}
              label={`URL ${index + 1} type`}
              a11yPrefix="feedback"
              ref={register()}
              defaultValue={type}
              errorMessage={getErrorMessage<SubmitCorrectAbstractFormValues, 'urls', 'type'>(
                errors,
                index,
                name,
                'type'
              )}
            >
              {[
                <option value="none" key="none">
                  Choose a type
                </option>,
                ...urlOptions.map(({ key, text }) => (
                  <option value={key} key={key}>
                    {text}
                  </option>
                )),
              ]}
            </SelectControl>
            <Control
              field={`${name}[${index}].value`}
              type="text"
              a11yPrefix="feedback"
              label={`URL ${index + 1}`}
              defaultValue={value}
              errorMessage={getErrorMessage<SubmitCorrectAbstractFormValues, 'urls', 'value'>(
                errors,
                index,
                name,
                'value'
              )}
              actionButton={
                <button disabled={fields.length <= 1} className="btn btn-danger" onClick={() => handleRemove(index)}>
                  <i className="fa fa-trash" aria-hidden="true" />
                  <span className="sr-only">Remove</span>
                </button>
              }
              ref={register()}
            />
          </ControlRow>
        );
      })}
      <FlexView hAlignContent="left">
        <button type="button" className="btn btn-default" onClick={handleAdd}>
          <i className="fa fa-plus" aria-hidden="true" /> Add new URL
        </button>
      </FlexView>
    </ControlContainer>
  );
};

export default UrlsList;
