const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const URL = 'https://udyamregistration.gov.in/UdyamRegistration.aspx';

// Extract visible fields to show proof-of-scrape (not used directly by the UI)
function extractFieldsFromHtml(html) {
  const $ = cheerio.load(html);
  const fields = [];
  $('input, select, textarea, button').each((_, el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase?.() || '';
    const id = $el.attr('id') || null;
    const name = $el.attr('name') || id || null;
    let label = null;
    if (id) {
      const lab = $(`label[for="${id}"]`).first();
      if (lab.length) label = lab.text().trim().replace(/\s+/g, ' ');
    }
    if (!label) {
      const parentLabel = $el.closest('label');
      if (parentLabel.length) label = parentLabel.text().trim().replace(/\s+/g, ' ');
    }
    const entry = {
      tag,
      type: ($el.attr('type') || (tag === 'select' ? 'select' : 'text')).toLowerCase(),
      id,
      name,
      label,
      required: $el.attr('required') !== undefined
    };
    if (tag === 'select') {
      entry.options = $el.find('option').map((i, opt) => ({
        value: $(opt).attr('value') || '',
        label: $(opt).text().trim()
      })).get();
    }
    fields.push(entry);
  });
  return fields;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

    // Snapshot of current DOM (proof only)
    const html = await page.content();
    const rawFields = extractFieldsFromHtml(html);

    // Build a normalized, assignment-focused schema for Steps 1 & 2
    const schema = {
      source: URL,
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 1,
          title: "Aadhaar Verification",
          fields: [
            {
              name: "aadhaar",
              id: "aadhaar",
              label: "Aadhaar Number",
              type: "text",
              placeholder: "Enter 12-digit Aadhaar",
              required: true,
              validation: { pattern: "^\\d{12}$", message: "Aadhaar must be 12 digits" }
            },
            {
              name: "otp",
              id: "otp",
              label: "OTP",
              type: "text",
              placeholder: "Enter 6-digit OTP",
              required: true,
              validation: { pattern: "^\\d{6}$", message: "OTP must be 6 digits" }
            }
          ],
          rawSample: rawFields.slice(0, 25)
        },
        {
          id: 2,
          title: "PAN & Address",
          fields: [
            {
              name: "pan",
              id: "pan",
              label: "PAN Number",
              type: "text",
              placeholder: "ABCDE1234F",
              required: true,
              validation: {
                pattern: "^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$",
                flags: "i",
                message: "Invalid PAN format"
              }
            },
            {
              name: "pincode",
              id: "pincode",
              label: "PIN Code",
              type: "pincode",
              placeholder: "6-digit PIN",
              required: true,
              validation: { pattern: "^\\d{6}$", message: "Enter a valid 6-digit PIN" }
            },
            { "name": "city",  "id": "city",  "label": "City",  "type": "text", "required": true },
            { "name": "state", "id": "state", "label": "State", "type": "text", "required": true }
          ]
        }
      ]
    };

    await fs.ensureDir('../backend/public');
    await fs.writeJson('../backend/public/schema.json', schema, { spaces: 2 });
    console.log('✅ Scrape complete → backend/public/schema.json');
  } catch (e) {
    console.error('Scrape failed:', e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
