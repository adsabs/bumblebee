import React from 'react';
import FlexView from 'react-flexview';
import { useFormContext, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { Control, RadioControl } from '../components';
import { EntryType, entryTypeOptions, SubmitCorrectAbstractFormValues } from '../models';
import BibcodeLoaderBtn from './BibcodeLoaderBtn';
import FormPreview from './FormPreview';
import FormStatus from './FormStatus';
import RecordForm from './RecordForm';

interface IMainFormProps {
  onSubmit?: () => void;
}

const MainForm: React.FunctionComponent<IMainFormProps> = ({ onSubmit }) => {
  const { register, errors, control } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();

  const [isLoaded, setIsLoaded] = React.useState(false);
  const entryType = useWatch<SubmitCorrectAbstractFormValues['entryType']>({
    control,
    name: 'entryType',
  });

  return (
    <React.Fragment>
      <FormStatus/>
      <FlexView column>
        <Control
          type="text"
          field="name"
          label="Name"
          a11yPrefix="feedback"
          placeholder="John Smith"
          ref={register}
          errorMessage={errors.name ? errors.name.message : undefined}
          required
        />
        <Control
          type="text"
          field="email"
          label="Email"
          a11yPrefix="feedback"
          placeholder="john@example.com"
          ref={register}
          errorMessage={errors.email ? errors.email.message : undefined}
          required
        />
        <RadioControl
          field="entryType"
          label="Entry Type"
          a11yPrefix="feedback"
          ref={register}
          options={entryTypeOptions}
          inline
        />
        <BibcodeLoaderBtn
          onLoaded={() => setIsLoaded(true)}
          onLoading={() => setIsLoaded(false)}
        />
      </FlexView>
      {entryType === EntryType.Edit && !isLoaded ? null : <RecordForm/>}
      <hr className="hr"/>
      <FormPreview
        onSubmit={onSubmit}
        disabled={entryType === EntryType.Edit && !isLoaded}
      />
      <FormStatus/>
    </React.Fragment>
  );
};

interface INewEditRadiosProps {
  onChange(value: string): void;

  defaultValue: string;
}

const NewEditRadios: React.FC<INewEditRadiosProps> = ({
  onChange,
  defaultValue,
}) => {
  const [val, setVal] = React.useState(defaultValue);
  const handleChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.name);
    },
    [],
  );

  React.useEffect(() => {
    onChange(val);
  }, [val, onChange]);

  return (
    <div
      role="radio-group"
      className="form-group"
      aria-labelledby="feedback-entry-type"
    >
      <RadioTitle id="feedback-entry-type">Record Type</RadioTitle>
      <label className="radio-inline">
        <input
          type="radio"
          name="new"
          checked={val === 'new'}
          onChange={handleChange}
        />
        New Record
      </label>
      <label className="radio-inline">
        <input
          type="radio"
          name="edit"
          checked={val === 'edit'}
          onChange={handleChange}
        />
        Edit Record
      </label>
    </div>
  );
};

NewEditRadios.defaultProps = {
  onChange: () => null,
  defaultValue: 'new',
};

const RadioTitle = styled.h3`
  font-size: inherit;
  font-weight: bold;
  margin-top: 0;
`;

export default MainForm;
