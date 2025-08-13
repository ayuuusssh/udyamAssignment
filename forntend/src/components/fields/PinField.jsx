import React, { useState } from 'react';
import axios from 'axios';
import { useFormContext } from 'react-hook-form';

export default function PinField({ id, label, name }) {
  const { register, setValue, formState: { errors } } = useFormContext();
  const [loading, setLoading] = useState(false);
  const err = errors?.[name]?.message;

  async function onBlur(e) {
    const pin = e.target.value;
    if (!/^\d{6}$/.test(pin)) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
      if (Array.isArray(res.data) && res.data[0].Status === 'Success') {
        const po = res.data[0].PostOffice?.[0];
        if (po) {
          setValue('city', po.District || '');
          setValue('state', po.State || '');
        }
      }
    } catch (e) {
      console.error('PIN lookup failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...register(name)} onBlur={onBlur} />
      {loading && <div style={{ fontSize: 12 }}>Looking up PIN…</div>}
      {err && <div className="err">{err}</div>}
    </div>
  );
}
