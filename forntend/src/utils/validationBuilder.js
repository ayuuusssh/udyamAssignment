import * as yup from 'yup';

export function buildYupForStep(fields = []) {
  const shape = {};
  fields.forEach(f => {
    let s = yup.string();
    if (f.required) s = s.required(`${f.label || f.name} is required`);
    if (f.validation?.pattern) {
      const re = new RegExp(f.validation.pattern, f.validation.flags || '');
      s = s.matches(re, f.validation.message || 'Invalid format');
    }
    if (f.validation?.min) s = s.min(Number(f.validation.min));
    if (f.validation?.max) s = s.max(Number(f.validation.max));
    shape[f.name] = s;
  });
  return yup.object().shape(shape);
}
