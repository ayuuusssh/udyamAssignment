import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function TextField({ id, label, name, placeholder }) {
  const { register, formState: { errors } } = useFormContext();
  const err = errors?.[name]?.message;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} placeholder={placeholder} {...register(name)} />
      {err && <div className="err">{err}</div>}
    </div>
  );
}
