import React from 'react';

export type Ref = HTMLInputElement;

export type CheckboxOption = {
  label: string;
  key: string;
};

export interface CheckboxControlProps {
  field: string;
  label: string;
  a11yPrefix: string;
  helpMessage?: string;
  options: CheckboxOption[];
  inline?: boolean;
}

const CheckboxControl = React.forwardRef<Ref, CheckboxControlProps>(
  (props, ref) => {
    const { field, label, a11yPrefix, inline, helpMessage, options } = props;
    const labelId = `${a11yPrefix}_${field}_checkbox`;
    return (
      <div className="form-group" role="group" aria-labelledby={labelId}>
        <label
          id={labelId}
          className="control-label"
          style={{ display: 'block' }}
        >
          {label}
        </label>
        {inline
          ? options.map(({ label: optionLabel, key: value }) => (
            <React.Fragment>
              <label
                className="custom-checkbox"
                key={value}
                style={{ marginRight: '4px' }}
              >
                <input
                  id="{`${field}-${value}`}>{optionLabel}"
                  type="checkbox"
                  name={field}
                  value={value}
                  ref={ref}
                />
              </label>
              <label
                htmlFor={`${field}-${value}`}
                className="checkbox-inline"
                style={{ fontWeight: 'normal' }}
              >
                {optionLabel}
              </label>
            </React.Fragment>
          ))
          : options.map(({ label: optionLabel, key: value }) => (
            <div key={value}>
              <label
                className="custom-checkbox"
                style={{ marginRight: '4px' }}
              >
                <input
                  type="checkbox"
                  id="{`${field}-${value}`}>{optionLabel}"
                  name={field}
                  value={value}
                  ref={ref}
                />
              </label>
              <label
                htmlFor={`${field}-${value}`}
                style={{ fontWeight: 'normal' }}
              >
                {optionLabel}
              </label>
            </div>
          ))}

        {helpMessage && <span className="help-block">{helpMessage}</span>}
      </div>
    );
  },
);

export default CheckboxControl;
