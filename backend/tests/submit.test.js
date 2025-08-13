const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const submitRoute = require('../src/routes/submit');

// Mock DB model
jest.mock('../src/models/Submission', () => ({
  create: jest.fn(async (payload) => ({ _id: 'mockid123', payload }))
}));

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/submit', submitRoute);

describe('POST /submit', () => {
  beforeAll(async () => {
    // Ensure schema.json exists for validation
    const schema = {
      steps: [
        {
          id: 1,
          fields: [
            {
              name: 'aadhaar',
              label: 'Aadhaar',
              required: true,
              validation: { pattern: '^\\d{12}$', message: 'Aadhaar must be 12 digits' }
            }
          ]
        }
      ]
    };
    await fs.ensureDir(path.join(__dirname, '..', 'public'));
    await fs.writeJson(path.join(__dirname, '..', 'public', 'schema.json'), schema);
  });

  it('should return 400 for invalid Aadhaar', async () => {
    const res = await request(app).post('/submit').send({ aadhaar: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatch(/Aadhaar must be 12 digits/);
  });

  it('should return 200 for valid Aadhaar', async () => {
    const res = await request(app).post('/submit').send({ aadhaar: '123456789012' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
