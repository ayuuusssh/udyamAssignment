const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const Submission = require('../models/submission');
const { buildServerValidator } = require('../validation/buildValidator');

router.post('/', async (req, res) => {
  try {
    // Load scraped schema
    const schemaPath = path.join(__dirname, '..', '..', 'public', 'schema.json');
    const fullSchema = (await fs.pathExists(schemaPath))
      ? await fs.readJson(schemaPath)
      : { steps: [] };

    // Build dynamic server-side validator
    const validator = buildServerValidator(fullSchema);

    // Validate request body
    await validator.validate(req.body, { abortEarly: false });

    // Save to MongoDB
    const doc = await Submission.create({ payload: req.body });
    return res.json({ ok: true, id: doc._id });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ ok: false, errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
