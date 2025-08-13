import { buildYupForStep } from './validationBuilder.js';

describe('ValidationBuilder', () => {
  it('should fail for invalid PAN', async () => {
    const fields = [
      {
        name: 'pan',
        label: 'PAN',
        required: true,
        validation: {
          pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$',
          message: 'Invalid PAN format'
        }
      }
    ];
    const schema = buildYupForStep(fields);
    await expect(schema.validate({ pan: '12345' }))
      .rejects
      .toThrow('Invalid PAN format');
  });

  it('should pass for valid PAN', async () => {
    const fields = [
      {
        name: 'pan',
        label: 'PAN',
        required: true,
        validation: {
          pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$',
          message: 'Invalid PAN format'
        }
      }
    ];
    const schema = buildYupForStep(fields);
    const result = await schema.validate({ pan: 'ABCDE1234F' });
    expect(result.pan).toBe('ABCDE1234F');
  });
});
