import React, { useState } from 'react';
import { Input, InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'type' | 'iconRight'>;

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible((v) => !v);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      iconRight={
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="p-1"
        >
          <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden />
        </button>
      }
    />
  );
};

export default PasswordInput;
