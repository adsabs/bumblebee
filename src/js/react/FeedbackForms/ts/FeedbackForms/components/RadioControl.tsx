import React from 'react';

export type Ref = HTMLInputElement;

export type RadioOption = {
  label: string;
  key: string;
};

export interface RadioControlProps {
  field: string;
  label: string;
  a11yPrefix: string;
  helpMessage?: string;
  options: RadioOption[];
  inline?: boolean;
}

const RadioControl = React.forwardRef<Ref, RadioControlProps>((props, ref) => {
  const { field, label, a11yPrefix, inline, helpMessage, options } = props;
  const labelId = `${a11yPrefix}_${field}_radio`;
  return (
    <div className="form-group" role="radiogroup" aria-labelledby={labelId}>
      <label
        id={labelId}
        className="control-label"
        style={{ display: 'block' }}
      >
        {label}
      </label>
      {inline
        ? options.map(({ label: optionLabel, key: value }) => (
          <label className="radio-inline custom-radio" key={value}>
            <input type="radio" name={field} value={value} ref={ref}/>
            {optionLabel}
          </label>
        ))
        : options.map(({ label: optionLabel, key: value }) => (
          <div className="radio" key={value}>
            <label className="custom-radio">
              <input type="radio" name={field} value={value} ref={ref}/>
              {optionLabel}
            </label>
          </div>
        ))}

      {helpMessage && <span className="help-block">{helpMessage}</span>}
    </div>
  );
});

export default RadioControl;
