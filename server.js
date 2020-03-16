if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const OWM_API_KEY =  process.env.OPEN_WEATHER_MAP_KEY,
      express = require('express'),
      axios = require('axios'),
      app = express()
      
app.use(express.json())
app.use(express.static('public')) 

app.post('/weather', (req, res) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lng}&appid=${OWM_API_KEY}&units=imperial`
    axios({
        url: url,
        responseType: 'json'
    }).then(data => res.json(data.data) )
      .catch(err => {
          console.log('Error: ', err)
      })
})

app.listen(3000, () => {
    console.log('Server started')
})