import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FlexView from 'react-flexview';
import styled from 'styled-components';
import { Control } from '../components';
import { MissingIncorrectRecordFormValues } from '../models';
import { getErrorMessage } from "../SubmitCorrectAbstract/helpers/getErrorMessage";

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

const BibcodeList: React.FunctionComponent<{}> = () => {
  const { control, register, errors, setValue, getValues } = useFormContext<
    MissingIncorrectRecordFormValues
  >();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bibcodes',
  });

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({
      citing: '',
      cited: '',
    });
  };

  const handleCopy = (index: number) => {
    setValue(`bibcodes[${index}].citing`, getValues('bibcodes[0].citing'));
  };

  return (
    <React.Fragment>
      {fields.map(({ id, citing, cited }, index) => {
        return (
          <ControlRow key={id}>
            <Control
              field={`bibcodes[${index}].citing`}
              type="text"
              a11yPrefix="feedback"
              label={`Citing Bibcode ${index + 1}`}
              defaultValue={citing}
              placeholder="1998ApJ...501L..41Y"
              errorMessage={getErrorMessage<MissingIncorrectRecordFormValues, 'bibcodes', 'citing'>(errors, index, 'bibcodes', 'citing')}
              ref={register()}
              actionButton={
                index > 0 ? (
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => handleCopy(index)}
                    title="Copy primary citing bibcode"
                  >
                    <i className="fa fa-copy" aria-hidden="true"/>
                    <span className="sr-only">Copy primary citing bibcode</span>
                  </button>
                ) : null
              }
            />
            <Control
              field={`bibcodes[${index}].cited`}
              type="text"
              a11yPrefix="feedback"
              label={`Cited Bibcode ${index + 1}`}
              defaultValue={cited}
              placeholder="1998ApJ...501L..41Y"
              errorMessage={getErrorMessage<MissingIncorrectRecordFormValues, 'bibcodes', 'cited'>(errors, index, 'bibcodes', 'cited')}
              actionButton={
                <button
                  type="button"
                  disabled={fields.length <= 1}
                  className="btn btn-danger"
                  onClick={() => handleRemove(index)}
                >
                  <i className="fa fa-trash" aria-hidden="true"/>
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
          <i className="fa fa-plus" aria-hidden="true"/> Add new row
        </button>
      </FlexView>
    </React.Fragment>
  );
};

export default BibcodeList;
