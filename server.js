// .env file se API key load karne ke liye
require('dotenv').config();

// Express framework import kiya
const express = require('express');

// Weatherstack API call ke liye axios use kiya
const axios = require('axios');

// Path module import kiya file path resolve karne ke liye
const path = require('path');

// Express app create kiya
const app = express();

// 'public' folder ko static folder banaya (CSS, images, etc. serve karne ke liye)
app.use(express.static('public'));

// HTML form se data parse karne ke liye middleware
app.use(express.urlencoded({ extended: true }));

// Home route => jab user root URL par jaye to HTML page show ho
app.get('/', (req, res) => {
  // index.html file ko bhej rahe hain response me
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Form submit hone ke baad weather fetch karne ka logic
app.post('/weather', async (req, res) => {
  // form se city ka naam liya
  const city = req.body.city;

  // environment file se API key li
  const apiKey = process.env.WEATHERSTACK_API_KEY;

  try {
    // Weatherstack API ko call kiya
    const result = await axios.get(`http://api.weatherstack.com/current`, {
      params: {
        access_key: apiKey, // yeh API key hai
        query: city,        // yeh user dwara diya gaya city name hai
      },
    });

    // API se milne wala data
    const data = result.data;

    // agar data me success false ya current weather info missing ho to error message bhejo
    if (data.success === false || !data.current) {
      return res.send(`
        <p>"${city}" ke liye weather data nahi mila. City name sahi se likhiye.</p>
        <br><a href="/">Wapas jayein</a>
      `);
    }

    // agar sab kuch sahi hai to weather details show karo
    res.send(`
      <h2>${data.location.name}, ${data.location.country} ka Mausam</h2>
      <p>🌡️Temperature: ${data.current.temperature}°C</p>
      <p>🌥️Condition: ${data.current.weather_descriptions[0]}</p>
      <img src="${data.current.weather_icons[0]}" alt="Weather icon"/>
      <br><br><a href="/">Dusre city ka weather dekhein</a>
    `);
  } catch (error) {
    // Agar API call ya server error aaye to console me error show karo aur user ko message bhejo
    console.error("Weatherstack Error:", error.message);
    res.status(500).send('Weather data fetch karne me dikkat aayi. Thodi der baad try karein.');
  }
});

// Server ko 3000 port (ya env me diya gaya) par chalu kiya
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Weather app chal raha hai: http://localhost:${PORT}`);
});
