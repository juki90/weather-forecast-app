let searchElement = document.querySelector(".search-location"),
    searchBox = new google.maps.places.SearchBox(searchElement),
    lat, lng, place, todayButton, forecastButton, tempDegree =  "°F", speed = "mi/h"

searchElement.value = ""

function setWeatherData(data) {  
    function elementCreation(className, text) {
        var element = document.createElement("div")
        element.className = className
        element.innerHTML = text
        return element
    }

    var inElement = document.querySelector(".result-today"),
        inElementOther = document.querySelector(".result-forecast"),
        location = elementCreation("today-location", `Location: <b class="b">${data.name}, ${data.sys.country}</b>`),
        description = elementCreation("today-description", `Description: <b class="b">${data.weather[0].main} (${data.weather[0].description})</b>`),
        temperature = elementCreation("today-temperature", `Temperature: <b class="b">${data.main.temp} ${tempDegree}</b>`),
        humidity = elementCreation("today-humidity", `Humidity: <b class="b">${data.main.humidity}%</b>`),
        wind_speed = elementCreation("today-wind_speed", `Wind speed: <b class="b">${data.wind.speed} ${speed}</b>`),
        pressure = elementCreation("today-pressure", `Air pressure: <b class="b">${data.main.pressure} hPa</b>`), 
        arr = [
            location,
            description,
            temperature,
            humidity,
            wind_speed,
            pressure
        ]

    inElement.innerHTML = "";
    inElementOther.innerHTML = "";

    document.querySelector(".search-info").innerHTML = ""

    for (var i = 0; i < arr.length; i++) {
        inElement.appendChild(arr[i])
    }
}

function setForecastData(data) {  

    let inElement = document.querySelector(".result-forecast"),
        inElementOther = document.querySelector(".result-today")

    inElement.innerHTML = ""
    inElementOther.innerHTML = ""

    let graphContainer = document.createElement("div"),
        buttonsContainer = document.createElement("div")

        graphContainer.setAttribute("id", "container")
        buttonsContainer.setAttribute("id", "buttons")

    inElement.appendChild(graphContainer)
    inElement.appendChild(buttonsContainer)

    document.querySelector(".search-info").innerHTML = ""

    let allData = data

    let temperatureData = allData.list.map(e => {
        return {par: e.dt, value: e.main.temp}
    })

    let humidityData = allData.list.map(e => {
        return {par: e.dt, value: e.main.humidity}
    })

    let windspeedData = allData.list.map(e => {
        return {par: e.dt, value: e.wind.speed}
    })

    let airpressureData = allData.list.map(e => {
        return {par: e.dt, value: e.main.pressure}
    })

    function drawGraph (data, domain, celsius = false) {
        // set the dimensions and margins of the graph
        let margin = {top: 20, right: 20, bottom: 50, left: 70},
            width = 1800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom,
            domainR = 0, domainV = 0, unit = celsius ? "°C" : "°F"

        // set the ranges
        let x = d3.scaleTime().range([0, width]);
        let y = d3.scaleLinear().range([height, 0]);

        // define the line
        let valueline = d3.line()
            .x(function(d) { return x(d.par * 1000); })
            .y(function(d) { return y(d.value); });

        // append the svg obgect to the body of the page
        // appends a "group" element to "svg"
        // moves the "group" element to the top left margin
        let svg = d3.select("#container").append("svg")
            .attr("id", `${domain}`)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return new Date(d.par*1000) })).nice(data.length);

        switch(domain) {
            case "temperature":
                y.domain([celsius ? -90 : -130, celsius ? 60 : 140]);
                domainR = 250
                domainV = 10
                break;
            case "humidity":
                y.domain([0, 100]);
                domainR = 0;
                domainV = 340
                unit = "%"
                break;
            case "windspeed":
                y.domain([0, 100]);
                domainR = 600;
                domainV = 150;
                unit = celsius ? " km/h" : " mi/h"
                break;
            case "airpressure":
                y.domain([850, 1100]);
                domainR = 250;
                domainV = 0;
                unit = " hPa"
                break;
        }
        
        // set the gradient
        svg.append("defs")
            .append("linearGradient")				
            .attr("id", `line-gradient-${domain}-${celsius}`)			
            .attr("gradientUnits", "userSpaceOnUse")	
            .attr("x1", 0).attr("y1", domainR)			
            .attr("x2", 0).attr("y2", domainV)
            .selectAll("stop")						
            .data([								
                {offset: "0%", color: "darkblue"},		
                {offset: "50%", color: "lightblue"},		
                {offset: "55%", color: "lightgreen"},		
                {offset: "65%", color: "yellow"},		
                {offset: "100%", color: "red"}	
            ])					
            .enter().append("stop")			
            .attr("offset", function(d) { return d.offset; })	
            .attr("stop-color", function(d) { return d.color; });

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", `line ${domain}`)
            .attr("transform", "translate(" + -13 + ", 0)")
            .attr("stroke", `url(#line-gradient-${domain}-${celsius})`)
            .attr("d", valueline);

        // Add value texts
            svg.append("g")
                .selectAll("text").data(data).enter()
                .append("text")
                .text(function(d, i){
                if (!i || i === data.length - 1) {return ""}
                return Math.floor(d.value)
                })
                .attr("transform", function(d, i) {
                if (i !== 0) {
                    let tempValue = d.value
                    if (celsius) {
                        tempValue = (d.value * 1.8) + 32
                    }
                    switch (domain) {
                    case "temperature":
                        return `translate(${(i*width-90)/data.length}, ${height-170.5-tempValue * 1.2})`
                    case "humidity":
                        return `translate(${(i*width-140)/data.length}, ${height-20-d.value*3.2})`
                    case "airpressure":
                        return `translate(${(i*width-140)/data.length}, ${1315 - d.value*1.2})`
                    case "windspeed":
                        return `translate(${(i*width-140)/data.length}, ${height-10-d.value*3.4})`
                    }
                }
                })

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "time-axis")
            .call(d3.axisBottom(x)
                    .ticks(data.length)
                    .tickFormat(function(d, i) {
                    let date = new Date(d)
                        return  `${date.getHours() < 10 ? "0" + date.getHours(): date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`
                    }))
        // Add the ADDITIONAL X Axis
        let newdate = ""
        svg.append("g")
            .attr("transform", "translate(0," + (height + 15) + ")")
            .attr("class", "date-axis")
            .call(d3.axisBottom(x)
                    .ticks(data.length)
                    .tickFormat(function(d, i) {
                    let date = new Date(d)
                    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
                    if (i === 0) {newdate = day}

                    if (day === newdate) {return ""}
                    newdate = day
                    
                    return  `${day} ${date.toLocaleString("en", { month: "long" })}`

                }))
        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y)
                    .ticks(14)
                    .tickFormat(function(d) {
                        return d + unit;
                    }))
        return svg
    }

    let iscelsius = tempDegree === "°F" ? false : true

    drawGraph(temperatureData, "temperature", iscelsius)
    drawGraph(humidityData, "humidity", iscelsius)
    drawGraph(airpressureData, "airpressure", iscelsius)
    drawGraph(windspeedData, "windspeed", iscelsius)

    let buttons = {
        temperature: document.createElement("button"),
        humidity: document.createElement("button"),
        airpressure: document.createElement("button"),
        windspeed: document.createElement("button")
    }

    buttons.temperature.classList.add("temperature")
    buttons.humidity.classList.add("humidity")
    buttons.airpressure.classList.add("airpressure")
    buttons.windspeed.classList.add("windspeed")

    function buttonListener(e) {
    let classname = e.target.getAttribute("class"),
        element = document.querySelector("#" + classname)

        if (!element.classList.contains("not-hidden")) {
            let collection = document.querySelectorAll("svg") 
            for(let i = 0; i < collection.length; i++) {
            collection[i].classList.remove("not-hidden")
            }
            element.classList.add("not-hidden")
        }
    }

    buttons.temperature.innerHTML = "Temperature"
    buttons.humidity.innerHTML = "Humidity"
    buttons.airpressure.innerHTML = "Air pressure"
    buttons.windspeed.innerHTML = "Wind speed"
    
    document.querySelector("#temperature").classList.add("not-hidden")

    for (let i in buttons) {
        buttons[i].addEventListener("click", buttonListener)
        document.querySelector("#buttons").appendChild(buttons[i])
    }   
}

function getWeatherData() {
    fetch("/weather", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            celsius: tempDegree === "°F" ? false : true
        })
    }).then(res => res.json())
      .then((data) => {
        setWeatherData(data)
      })
      .catch(err => {
          return err
      })
}

function getForecastData() {
    fetch("/forecast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            celsius: tempDegree === "°F" ? false : true
        })
    }).then(res => res.json())
      .then((data) => {
        setForecastData(data)
      })
      .catch(err => {
          return err
      })
}

searchBox.addListener("places_changed", () => {
    place = searchBox.getPlaces()[0]
    if (place == null) { return }
    lat = place.geometry.location.lat()
    lng = place.geometry.location.lng()
})

todayButton = document.querySelector(".search-button")
todayButton.addEventListener("click", function() {
    if(lat && lng) {
        getWeatherData()
    }
})

forecastButton = document.querySelector(".forecast-button")
forecastButton.addEventListener("click", function() {
    if(lat && lng) {
        getForecastData()
    }
})

celsiusButton = document.querySelector(".celsius")
celsiusButton.addEventListener("click", function() {
    if(tempDegree === "°F") {
        tempDegree = "°C"
        speed = "km/h"
        celsiusButton.innerHTML = "°F/<u>°C</u>"
    } else if(tempDegree === "°C") {
        tempDegree = "°F"
        speed = "mi/h"
        celsiusButton.innerHTML = "<u>°F</u>/°C"
    }
})
 
