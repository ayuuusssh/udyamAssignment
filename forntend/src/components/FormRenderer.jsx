import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { buildYupForStep } from '../utils/validationBuilder.js';
import TextField from './fields/TextField.jsx';
import PinField from './fields/PinField.jsx';
import ProgressBar from './ProgressBar.jsx';

const API = 'http://localhost:4000';

export default function FormRenderer() {
  const [schema, setSchema] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    axios.get(`${API}/schema`).then(res => setSchema(res.data)).catch(console.error);
  }, []);

  const step = useMemo(() => schema?.steps?.[stepIndex], [schema, stepIndex]);

  const methods = useForm({
    resolver: yupResolver(buildYupForStep(step?.fields || [])),
    mode: 'onChange'
  });

  if (!schema) return <div>Loading schema…</div>;

  const next = (data) => {
    sessionStorage.setItem(`step-${step.id}`, JSON.stringify(data));
    setStepIndex(i => i + 1);
  };

  const back = () => setStepIndex(i => i - 1);

  const finalSubmit = async (data) => {
    const all = {};
    for (const s of schema.steps) {
      Object.assign(all, JSON.parse(sessionStorage.getItem(`step-${s.id}`) || '{}'));
    }
    Object.assign(all, data);

    const res = await axios.post(`${API}/submit`, all).catch(e => e.response);
    if (res?.status === 200) {
      alert(`Submitted! id: ${res.data.id}`);
      sessionStorage.clear();
    } else {
      alert(`Submission failed: ${JSON.stringify(res?.data)}`);
    }
  };

  return (
    <div>
      <ProgressBar current={stepIndex} total={schema.steps.length} />
      <h2>{step.title}</h2>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(stepIndex < schema.steps.length - 1 ? next : finalSubmit)}
        >
          <div className="row">
            {step.fields.map((f) => {
              if (f.type === 'pincode') return <PinField key={f.id} {...f} />;
              return <TextField key={f.id} {...f} />;
            })}
          </div>

          <div className="btnbar">
            {stepIndex > 0 ? (
              <button type="button" className="btn" onClick={back}>Back</button>
            ) : <span />}

            <button
              type="submit"
              className="btn primary"
              disabled={!methods.formState.isValid}
            >
              {stepIndex < schema.steps.length - 1 ? 'Next' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
