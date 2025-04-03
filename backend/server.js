const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan')
const mongoURL = process.env.MONGO_URL;

dotenv.config();

const app = express();

console.log(process.env.PORT)
console.log(process.env.MONGO_URL)


mongoose.connect(mongoURL).then(() => {
    console.log('connected')
    app.listen(process.env.PORT,() => {
        console.log('app is running on localhost:'+process.env.PORT);
        })
}).catch((error) => {console.log(error)});

app.use(cors(
    {
        origin : "https://quake-track.vercel.app",
        credentials : true
    }
));
app.use(morgan('dev'));

app.get('/api/earthquakes', async (req, res) => {
    try {
        const myanmarCoordinates = [
            { lat: 21.0, lon: 95.0, radius: 5.0 },
            { lat: 15.509, lon: 95.637, radius: 5.0 }
        ];
        const myanmarApiRequests = myanmarCoordinates.map(({ lat, lon, radius }) => 
            axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradius=${radius}&limit=100&orderby=time`)
        );
        const thailandApiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-01-01&endtime=2025-04-01&minlatitude=5.5&maxlatitude=20.5&minlongitude=97.5&maxlongitude=106.5&minmagnitude=4`;
  
        const [myanmarResponse, thailandResponse] = await Promise.all([
            Promise.all(myanmarApiRequests),
            axios.get(thailandApiUrl),
        ]);


        // Check if the responses contain valid 'features' arrays
        const myanmarEarthquakes = flatMap(response => response.data?.features || []);
        const thailandEarthquakes = thailandResponse.data && Array.isArray(thailandResponse.data.features) ? thailandResponse.data.features : [];

        // Merge both arrays in json
        const combinedEarthquakes = {
            myanmarEarthquakes,
            thailandEarthquakes,
        }

        if (!!combinedEarthquakes) {
            res.json(combinedEarthquakes);
        } else {
            console.log('Error: No valid earthquake data found.');
            res.status(500).json({ msg: 'No earthquake data found' });
        }

    }catch(error) {
        res.status(500).json({msg : error.message})
    }
})