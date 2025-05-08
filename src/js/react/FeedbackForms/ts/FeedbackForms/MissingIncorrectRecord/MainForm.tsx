import React from 'react';
import FlexView from 'react-flexview';
import { useFormContext } from 'react-hook-form';
import { Control } from '../components';
import { MissingIncorrectRecordFormValues } from '../models';
import BibcodeList from './BibcodeList';
import FormPreview from './FormPreview';
import FormStatus from './FormStatus';

interface IMainFormProps {
  onSubmit?: () => void;
}

const MainForm: React.FunctionComponent<IMainFormProps> = ({ onSubmit }) => {
  const { register, errors } = useFormContext<
    MissingIncorrectRecordFormValues
  >();

  return (
    <React.Fragment>
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
        <BibcodeList/>
      </FlexView>
      <hr className="hr"/>
      <FormPreview onSubmit={onSubmit}/>
      <FormStatus/>
    </React.Fragment>
  );
};

export default MainForm;
