import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import FlexView from 'react-flexview';
import PropTypes from 'prop-types';
import { AssociatedArticlesFormValues } from '../models';
import { Control } from '../components';
import { getErrorMessage } from '../SubmitCorrectAbstract/helpers/getErrorMessage';

export interface IBibcodeListProps {
  label: string;
  secondaryLabel: string;
}

const BibcodeList: React.FunctionComponent<IBibcodeListProps> = ({
  label,
  secondaryLabel,
}) => {
  const { control, register, errors } = useFormContext<
    AssociatedArticlesFormValues
  >();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'associated',
  });

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({ bibcode: '' });
  };

  // get the placeholder based on the type of relation
  const relation = useWatch<AssociatedArticlesFormValues['relation']>({
    name: 'relation',
    defaultValue: 'none',
  });
  const placeholder = getBibcodePlaceholder(relation);

  return (
    <React.Fragment>
      <Control
        field="sourceBibcode"
        type="text"
        a11yPrefix="feedback"
        label={`${label} Bibcode`}
        ref={register}
        placeholder={placeholder}
        errorMessage={
          errors.sourceBibcode ? errors.sourceBibcode.message : undefined
        }
      />
      <div>
        <FlexView column>
          {fields.map(({ id, bibcode }, index) => {
            return (
              <Control
                key={id}
                field={`associated[${index}].bibcode`}
                type="text"
                a11yPrefix="feedback"
                label={`${secondaryLabel} Bibcode${
                  relation === 'other' ? ', URL or DOI' : `${index + 1}`
                }`}
                placeholder={placeholder}
                ref={register()}
                defaultValue={bibcode}
                errorMessage={getErrorMessage<AssociatedArticlesFormValues, 'associated', 'bibcode'>(errors, index, 'associated', 'bibcode')}
                actionButton={
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemove(index)}
                    disabled={fields.length <= 1}
                  >
                    <i className="fa fa-trash" aria-hidden="true" />
                    <span className="sr-only">Remove</span>
                  </button>
                }
              />
            );
          })}
        </FlexView>
      </div>
      <FlexView hAlignContent="left">
        {['arxiv', 'errata', 'series'].includes(relation) && (
          <button
            type="button"
            className="btn btn-default"
            onClick={handleAdd}
            disabled={fields.length > 10}
          >
            <i className="fa fa-plus" aria-hidden="true" /> Add new row
          </button>
        )}
      </FlexView>
    </React.Fragment>
  );
};

BibcodeList.defaultProps = {
  label: '',
  secondaryLabel: '',
};

BibcodeList.propTypes = {
  label: PropTypes.string.isRequired,
  secondaryLabel: PropTypes.string.isRequired,
};

const getBibcodePlaceholder = (
  type: AssociatedArticlesFormValues['relation']
) => {
  switch (type) {
    case 'arxiv':
      return '2001quant.ph..1003R';
    default:
      return '1998ApJ...501L..41Y';
  }
};

export default BibcodeList;
