const express = require('express');
const { request } = require('undici');
const { load } = require('cheerio');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const defaultHeaders = {
  'content-type': 'application/x-www-form-urlencoded',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'x-requested-with': 'XMLHttpRequest'
};

const toFormData = obj => new URLSearchParams(obj).toString();
const getRequestConfig = () => ({
  headersTimeout: 30000,
  bodyTimeout: 30000
});

app.post('/akinator/start', async (req, res) => {
  try {
    const lang = req.query.lang || "id";
    const baseUrl = `https://${lang}.akinator.com`;
    const sid = 1;
    const payload = { cm: false, sid };
    const body = toFormData(payload);

    const { body: resp } = await request(`${baseUrl}/game`, {
      method: 'POST',
      headers: defaultHeaders,
      body,
      ...getRequestConfig()
    });

    const html = await resp.text();
    const $ = load(html);

    const session = $('#askSoundlike > #session').attr('value');
    const signature = $('#askSoundlike > #signature').attr('value');
    const question = $('#question-label').text();

    res.json({
      success: true,
      session,
      signature,
      question,
      step: 0,
      sid,
      baseUrl
    });
  } catch (e) {
    console.error('❌ Error in /akinator/start', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/akinator/answer', async (req, res) => {
  try {
    const { baseUrl, session, signature, step, answer, progression = 0.0 } = req.body;

    const payload = {
      step,
      progression: parseFloat(progression).toFixed(5),
      sid: 1,
      cm: false,
      answer,
      step_last_proposition: '',
      session,
      signature
    };

    const body = toFormData(payload);

    const { body: resp } = await request(`${baseUrl}/answer`, {
      method: 'POST',
      headers: defaultHeaders,
      body,
      ...getRequestConfig()
    });

    const text = await resp.text();
    const data = JSON.parse(text);

    res.json(data);
  } catch (e) {
    console.error('❌ Error in /akinator/answer', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/akinator/stats", async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const url = `https://${lang}.akinator.com`;

    const { data } = await axios.get(url, { headers: defaultHeaders });
    const $ = cheerio.load(data);

    const lastGames = [];
    $(".last-games .content ul li").each((i, el) => {
      lastGames.push($(el).text().trim());
    });

    res.json({
      success: true,
      lang,
      lastGames
    });
  } catch (e) {
    console.error("❌ Error in /akinator/stats", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/akinator/choice', async (req, res) => {
  try {
    const { baseUrl, session, signature, step, pid, identifiant, charac_name, charac_desc } = req.body;

    const payload = {
      sid: 1,
      pid: pid || '9919',
      identifiant: identifiant || '',
      pflag_photo: 2,
      charac_name,
      charac_desc,
      session,
      signature,
      step
    };

    const body = toFormData(payload);

    const { body: resp } = await request(`${baseUrl}/choice`, {
      method: 'POST',
      headers: defaultHeaders,
      body,
      ...getRequestConfig()
    });

    const text = await resp.text();
    res.status(200).send(text);
  } catch (err) {
    console.error('❌ Error in /akinator/choice', err);
    res.status(500).json({ error: 'Gagal kirim ke Akinator.' });
  }
});

app.post('/akinator/exclude', async (req, res) => {
  try {
    const { baseUrl, session, signature, step, progression = 0.0 } = req.body;

    const payload = {
      step,
      sid: 1,
      cm: false,
      progression: parseFloat(progression).toFixed(5),
      session,
      signature,
      forward_answer: 1
    };

    const body = toFormData(payload);

    const { body: resp } = await request(`${baseUrl}/exclude`, {
      method: 'POST',
      headers: defaultHeaders,
      body,
      ...getRequestConfig()
    });

    const text = await resp.text();
    const data = JSON.parse(text);

    res.json(data);
  } catch (e) {
    console.error('❌ Error in /akinator/exclude', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/akinator/cancel_answer', async (req, res) => {
  try {
    const { baseUrl, session, signature, step, progression = 0.0 } = req.body;

    const payload = {
      step,
      sid: 1,
      cm: false,
      progression: parseFloat(progression).toFixed(5),
      session,
      signature
    };

    const body = toFormData(payload);

    const { body: resp } = await request(`${baseUrl}/exclude`, {
      method: 'POST',
      headers: defaultHeaders,
      body,
      ...getRequestConfig()
    });

    const text = await resp.text();
    const data = JSON.parse(text);

    res.json(data);
  } catch (e) {
    console.error('❌ Error in /akinator/exclude', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Akinator Express API jalan di http://localhost:${PORT}`);
});
