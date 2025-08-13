require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { connect } = require('./db');
const schemaRoute = require('./routes/schema');
const submitRoute = require('./routes/submit');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/schema', schemaRoute);
app.use('/submit', submitRoute);

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/udyam';

connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Backend on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Mongo connection failed:', e);
    process.exit(1);
  });
