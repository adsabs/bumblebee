import React from 'react';

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required: boolean;
}

const Label: React.FunctionComponent<LabelProps> = ({
  htmlFor,
  children,
  required,
}) => {
  return (
    <label htmlFor={htmlFor} className="control-label">
      {required ? (
        <>
          {children}{' '}
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        </>
      ) : (
        children
      )}
    </label>
  );
};

export type Ref = HTMLSelectElement;

export interface SelectControlProps {
  field: string;
  a11yPrefix: string;
  label: string;
  placeholder?: string;
  errorMessage?: string | React.ReactElement;
  helpMessage?: string;
  defaultValue?: string;
  required?: boolean;
  children: React.ReactNode;
}

const SelectControl = React.forwardRef<Ref, SelectControlProps>(
  (props, ref) => {
    const {
      field,
      label,
      a11yPrefix,
      errorMessage,
      helpMessage,
      defaultValue,
      required,
      children,
    } = props;

    const inputId = `${a11yPrefix}_${field}_select`;
    const formGroupClasses = [
      'form-group',
      errorMessage ? 'has-feedback has-error' : '',
    ].join(' ');

    return (
      <div className={formGroupClasses}>
        <Label htmlFor={inputId} required={!!required}>
          {label}
        </Label>
        <select
          name={field}
          id={inputId}
          ref={ref}
          defaultValue={defaultValue}
          className="form-control"
          aria-required={required}
        >
          {children}
        </select>
        {(() => {
          if (errorMessage) {
            return (
              <span className="help-block with-errors">{errorMessage}</span>
            );
          } else if (helpMessage) {
            return <span className="help-block">{helpMessage}</span>;
          }
          return null;
        })()}
      </div>
    );
  },
);

export default SelectControl;
