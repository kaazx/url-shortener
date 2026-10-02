require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.use(express.urlencoded({ extended: false }));

const urls = [];

app.post('/api/shorturl', (req, res) => {
  const original = req.body.url;
  let parsed;

  try {
    parsed = new URL(original);
  } catch {
    return res.json({ error: 'invalid url' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsed.hostname, (err) => {
    if (err) return res.json({ error: 'invalid url' });

    let index = urls.indexOf(original);
    if (index === -1) {
      urls.push(original);
      index = urls.length - 1;
    }

    res.json({ original_url: original, short_url: index + 1 });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const url = urls[Number(req.params.short_url) - 1];
  if (!url) return res.json({ error: 'No short URL found for the given input' });
  res.redirect(url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});