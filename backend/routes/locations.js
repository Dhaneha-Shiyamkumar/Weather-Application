const express = require('express');
const router = express.Router();
const Location = require('../models/locationModel'); //Connects to the Database
require('dotenv/config');
const fetch = require("node-fetch");

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;


//Fetching location according to name/ latitude or longitude
router.get('/', async (req, res) => {
    const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');

    console.log('GET (VIA NAME / LAT & LON): received query at location');
    try {
        if (req.query.locationName) {
            weatherUrl.searchParams.set('q', req.query.locationName);
        }
        else {
            weatherUrl.searchParams.set('lat', req.query.lat);
            weatherUrl.searchParams.set('lon', req.query.lon);
        }
        weatherUrl.searchParams.set('units', 'metric');
        weatherUrl.searchParams.set('appid', WEATHER_API_KEY);

        const response = await fetch(weatherUrl.href);
        const resJson = await response.json();
        console.log(resJson);
        if (resJson.cod == 200) { // Its SuccessFul
            await saveOrUpdateToDB(resJson.name);
            res.send(resJson);
        }
        else { // Error, The requested city cannot be found
            res.send(err);
        }
    }
    catch (err) {
        res.send(err + ',\nGET-LOCATION: This is an Internal error');
    }
});

var saveOrUpdateToDB = async (locationName) => {
    const location = new Location({ locationName: locationName });
    try {
        const findLocation = await Location.find({ locationName: locationName });

        if (findLocation.length > 0) { // Already exists in the database
            await Location.findOneAndUpdate(
                { locationName: findLocation[0].locationName },
                { count: findLocation[0].count + 1 },
            );
        }
        else {
            await location.save();
        }
    }
    catch (err) {
        console.log(err + '\nSAVE/UPDATE TO DB: This is an Internal error');
    }
}


router.get('/all', async (req, res) => {
    console.log('GET-ALL: received query at location/all');
    try {
        const allLocations = await Location.find();
        res.send(allLocations);
    }
    catch (err) {
        res.send(err.message + ' Could not find any rows in DB');
    }
});

module.exports = router; // Export this as a module, so we can use it in our index.