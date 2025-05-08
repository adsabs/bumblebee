import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import FlexView from "react-flexview";
import styled from "styled-components";
import { Control } from "../components";
import { Keyword, SubmitCorrectAbstractFormValues } from "../models";
import { getErrorMessage } from "./helpers/getErrorMessage";

interface IControlRow {
  count: number;
}

const ControlRow = styled.div<IControlRow>`
  display: flex;

  & > * {
    flex-basis: ${({ count }) => `${(1 / count) * 100}%`};
  }
`;

const ControlContainer = styled.div`
  margin-bottom: 1rem;
`;

const name = 'keywords';

const KeywordsList: React.FC = () => {
  const { control, register, errors } = useFormContext<SubmitCorrectAbstractFormValues>();
  const { fields, append, remove } = useFieldArray<Keyword>({
    control,
    name,
  });

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({ value: '' });
  };

  return (
    <ControlContainer>
      {fields.map(({ id, value }, index) => {
        return (
          <ControlRow key={id} count={1}>
            <Control
              field={`${name}[${index}].value`}
              type="text"
              a11yPrefix="feedback"
              label={`Keyword ${index + 1}`}
              defaultValue={value}
              errorMessage={getErrorMessage<SubmitCorrectAbstractFormValues, 'keywords', 'value'>(
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
          <i className="fa fa-plus" aria-hidden="true" /> Add new keyword
        </button>
      </FlexView>
    </ControlContainer>
  );
};

export default KeywordsList;
