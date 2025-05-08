import React from 'react';

export type Ref = HTMLInputElement;

export interface CheckboxProps {
  onClick: (...event: any[]) => void;
}

const Checkbox = React.forwardRef<Ref, CheckboxProps>(
  ({ onClick, ...rest }, ref) => (
    <label className="custom-checkbox" onClick={onClick}>
      <input
        type="checkbox"
        className="custom-control-input"
        ref={ref}
        {...rest}
      />
    </label>
  ),
);

export default Checkbox;
