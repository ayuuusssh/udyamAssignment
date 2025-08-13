const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    payload: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', SubmissionSchema);
