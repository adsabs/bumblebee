import React from "react";
import FlexView from "react-flexview";
import { useFieldArray, useFormContext } from "react-hook-form";
import styled from "styled-components";
import { Control, SelectControl } from "../components";
import { EntryType, Reference, referenceOptions, SubmitCorrectAbstractFormValues } from "../models";
import { getErrorMessage } from "./helpers/getErrorMessage";

interface IControlRow {
  count: number;
}

const ControlRow = styled.div<IControlRow>`
  display: flex;
  justify-content: flex-start;

  & > * {
    flex-basis: ${({ count }) => `${(1 / count) * 100}%`};
  }

  & > *:not(:first-child) {
    margin-left: 1rem;
  }
`;

const ControlContainer = styled.div`
  margin-bottom: 1rem;
`;

const name = 'references';

const ReferencesList: React.FC = () => {
  const { control, register, errors, getValues } = useFormContext<SubmitCorrectAbstractFormValues>();

  const { fields, append, remove } = useFieldArray<Reference>({
    control,
    name,
  });

  const { entryType } = getValues();

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
      {fields.length === 1 && entryType === EntryType.Edit ? (
        <p>No References</p>
      ) : (
        fields.map(({ id, type, value }, index) => {
          return (
            <ControlRow key={id} count={entryType === EntryType.Edit ? 2 : 1}>
              {entryType === EntryType.Edit && (
                <SelectControl
                  field={`${name}[${index}].type`}
                  label={`Reference ${index + 1} type`}
                  a11yPrefix="feedback"
                  ref={register()}
                  defaultValue={type}
                  errorMessage={getErrorMessage<SubmitCorrectAbstractFormValues, 'references', 'type'>(
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
                    ...referenceOptions.map(({ key, text }) => (
                      <option value={key} key={key}>
                        {text}
                      </option>
                    )),
                  ]}
                </SelectControl>
              )}
              <Control
                field={`${name}[${index}].value`}
                type="text"
                a11yPrefix="feedback"
                label={`Reference ${index + 1}`}
                defaultValue={value}
                errorMessage={getErrorMessage<SubmitCorrectAbstractFormValues, 'references', 'value'>(
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
        })
      )}
      <FlexView hAlignContent="left">
        {entryType === EntryType.Edit ? (
          <p>
            Please use the <a href="/feedback/missingreferences">Add Missing References form</a> for adding missing
            references.
          </p>
        ) : (
          <button type="button" className="btn btn-default" onClick={handleAdd}>
            <i className="fa fa-plus" aria-hidden="true" /> Add new reference
          </button>
        )}
      </FlexView>
    </ControlContainer>
  );
};

export default ReferencesList;
