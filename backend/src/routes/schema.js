const path = require('path');
const fs = require('fs-extra');
const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const p = path.join(__dirname, '..', '..', 'public', 'schema.json');
    if (await fs.pathExists(p)) {
      const json = await fs.readJson(p);
      return res.json(json);
    }
    // Fallback if scraper not run yet
    return res.json({
      source: 'fallback',
      steps: [
        {
          id: 1,
          title: 'Aadhaar Verification',
          fields: [
            { name: 'aadhaar', id: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true, validation: { pattern: '^\\d{12}$', message: 'Aadhaar must be 12 digits' } },
            { name: 'otp', id: 'otp', label: 'OTP', type: 'text', required: true, validation: { pattern: '^\\d{6}$', message: 'OTP must be 6 digits' } }
          ]
        },
        {
          id: 2,
          title: 'PAN & Address',
          fields: [
            { name: 'pan', id: 'pan', label: 'PAN Number', type: 'text', required: true, validation: { pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$', flags: 'i', message: 'Invalid PAN format' } },
            { name: 'pincode', id: 'pincode', label: 'PIN Code', type: 'pincode', required: true, validation: { pattern: '^\\d{6}$', message: '6-digit PIN' } },
            { name: 'city', id: 'city', label: 'City', type: 'text', required: true },
            { name: 'state', id: 'state', label: 'State', type: 'text', required: true }
          ]
        }
      ]
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load schema' });
  }
});

module.exports = router;
