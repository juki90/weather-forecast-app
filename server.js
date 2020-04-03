if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 3000;

const OWM_API_KEY = process.env.OPEN_WEATHER_MAP_KEY,
  express = require("express"),
  axios = require("axios"),
  app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/weather", (req, res) => {
  const celsius = req.body.celsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lng}&appid=${OWM_API_KEY}&units=${celsius}`;
  axios({
    url: url,
    responseType: "json"
  })
    .then(data => res.json(data.data))
    .catch(err => res.json("Error"));
});

app.post("/forecast", (req, res) => {
  const celsius = req.body.celsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${req.body.lat}&lon=${req.body.lng}&appid=${OWM_API_KEY}&units=${celsius}`;
  axios({
    url: url,
    responseType: "json"
  })
    .then(data => res.json(data.data))
    .catch(err => res.json("Error"));
});

app.listen(PORT, () => {
  console.log("Server started");
});
