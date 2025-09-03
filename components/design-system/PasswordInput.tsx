import React from 'react';
import { Input, InputProps } from './Input';

export const PasswordInput: React.FC<InputProps> = (props) => {
  const [show, setShow] = React.useState(false);

  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      iconRight={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="focus:outline-none"
        >
          <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
        </button>
      }
    />
  );
};
