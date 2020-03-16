var searchElement = document.querySelector('.search-location'),
    searchBox = new google.maps.places.SearchBox(searchElement),
    lat, lng, place, todayButton, forecastButton, tempDegree =  '°F'

function setWeatherData(data, place) {  
    function elementCreation(className, text) {
        var element = document.createElement('div')
        element.className = className
        element.innerText = text
        return element
    }
    var inElement = document.querySelector('.result-today'),
        location = elementCreation('today-location', `${place.name}, ${data.sys.country}`),
        description = elementCreation('today-description', `${data.weather[0].main} (${data.weather[0].description})`),
        temperature = elementCreation('today-temperature', `${data.main.temp} ${tempDegree}`),
        humidity = elementCreation('today-humidity', `${data.main.humidity}%`),
        wind_speed = elementCreation('today-wind_speed', `${data.wind.speed} km/h`),
        pressure = elementCreation('today-pressure', `${data.main.pressure} hPa`), 
        arr = [
            location,
            description,
            temperature,
            humidity,
            wind_speed,
            pressure
        ]

    inElement.innerHTML = '';

    for (var i = 0; i < arr.length; i++) {
        inElement.appendChild(arr[i])
    }
}

function getWeatherData() {
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng
        })
    }).then(res => res.json())
      .then((data) => {
        setWeatherData(data, place)
      })
      .catch(err => {
          console.log(err)
      })
}

searchBox.addListener('places_changed', () => {
    place = searchBox.getPlaces()[0]
    if (place == null) { return }
    lat = place.geometry.location.lat()
    lng = place.geometry.location.lng()
})

todayButton = document.querySelector('.search-button')
todayButton.addEventListener('click', function() {
    if(lat && lng) {
        getWeatherData()
    }
})
 
