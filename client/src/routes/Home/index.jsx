import React, { useEffect, useRef, useState } from 'react';
import L from './js/leaflet-custom';
import { Map, TileLayer, useLeaflet, Marker } from 'react-leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import 'esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css';
//import places from './places.json';
import "leaflet-geosearch/dist/geosearch.css"
import "leaflet-geosearch/assets/css/leaflet.css"
//import axios from "axios";
//import { Series, Dataframes } from "pandas-js";
//import { DataFrame } from 'pandas-js/dist/core';
//import DataFrame from "dataframe-js";
import Search from "./search.js"
import "leaflet.idw/src/leaflet-idw";
//import latlng from "react-leaflet"
//import { latLng } from 'leaflet';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import HereMaps from "routes/HereMaps";

delete L.Icon.Default.prototype._getIconUrl;

// Importing images from locally stored assets to address a bug
// in CodeSandbox: https://github.com/codesandbox/codesandbox-client/issues/3845

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('./images/marker-icon-2x.png'),
    iconUrl: require('./images/marker-icon.png'),
    shadowUrl: require('./images/marker-shadow.png')
});

const token = "516b6b62876af81c27811d5b120aa26e1a34c43d";
var lat1 = 28.086520, lat2 = 28.921631, long1 = 76.730347, long2 = 77.631226;
const url = `https://api.waqi.info/map/bounds/?latlng=${lat1},${long1},${lat2},${long2}&token=${token}`

let item;
let userData

let aqiGradient = {
    0: "#69B34C",
    50: "green",
    100: "yellow",
    200: "orange",
    300: "red",
    400: "#FF2626",
    500: "#DD0000",
    600: "#CD853F",
    700: "#D2691E",
    800: "#A0522D",
    900: "#8B4513",
    1000: "black"
};

let aqiGradient1 = {
    0.0: '#69B34C',
    0.05: 'green',
    0.1: 'yellow',
    0.15: '#FFD700',
    0.2: 'orange',
    0.25: '#FF8C00',
    0.3: 'red',
    0.4: '#FF2626',
    0.5: '#DD0000',
    0.6: '#CD853F',
    0.7: '#D2691E',
    0.8: '#A0522D',
    0.9: '#8B4513',
    1.0: 'brown'
};

let IDWOptions = {
    // opacity  - the opacity of the IDW layer
    // cellSize - height and width of each cell, 25 by default
    // exp      - exponent used for weighting, 1 by default
    // max      - maximum point values, 1.0 by default
    // gradient - color gradient config, e.g. {0.4: 'blue', 0.65: 'lime', 1: 'red'}
    opacity: 0.4,
    position: "topleft",
    // maxZoom: 10,
    // minZoom: 10,
    cellSize: 1,
    //exp: 5,
    gradient: aqiGradient,
    // dataType: 2,
    // station_range: 10,
    minVal: 0.0,
    maxVal: 1000.0,
    unit: ""
};

const Home = () => {
    const mapRef = useRef();
    let rows = [], columns;

    //console.log(obj[0].Lat);

    //document.write(rows[0][2]);
    //const df = new DataFrame(rows, columns = ['lat', 'lon', 'aqi', 'name']);
    // const [timer, setTimer] = useState(null);
    const [show, setshow] = useState(false);
    const [counter, setCounter] = useState(0);
    const timer = useRef(null);


    const fetchdata = async () => {
        const response = await fetch(url);
        const data = await response.json();
        userData = data.data;

        //console.log(userData);
    }

    let test1;
    useEffect(() => {
        const { current = {} } = mapRef;
        const { leafletElement: map } = current;


        // if(!query) return;
        test1 = fetchdata().then(() => {
            // console.log(userData);
            for (let i in userData) {
                if (!isNaN(userData[i].aqi)) {
                    rows.push([userData[i].lat, userData[i].lon, parseInt(userData[i].aqi)]);
                }
            }

            if (!map) return;
            console.log(rows);

            var idw = L.idwLayer(rows, {
                opacity: 0.6,
                // maxZoom: 18,
                cellSize: 1,
                exp: 2,
                max: 1000,
                //station_range:10,
                gradient: aqiGradient1,
            }).addTo(map);
            // idw.addTo(map);
            /*  for (let j in rows){
                  // latLng.lat=rows[j][0];
                   ///latLng.lng=rows[j][1];
                  //  L.marker([parseFloat(rows[j][0]),parseFloat(rows[j][1])]).addTo(map);
                    //L.idwMarker([parseFloat(rows[j][0]),parseFloat(rows[j][1])]).addTo(map);
                   //console.log(rows[j][0]);
                  };*/
            let idwMarker = undefined;
            let idwDisplay = undefined;
            map.on('click',
                function mapClickListen(event) {
                    let pos = event.latlng;
                    if (idwMarker) {
                        idwDisplay.remove();
                        idwMarker.setLatLng(pos);
                    } else {
                        idwMarker = new L.idwMarker(
                            pos, {
                            ranges: [1000],
                            //dataOptions: [[2, 0.0]],
                            p: 2,
                            radius: 5,
                            points: [rows]
                        }).addTo(map);
                    }
                    idwDisplay = L.control.displayIDW(idwMarker.getIDW(), {
                        position: "topleft"
                    }).addTo(map);
                    // close button function
                    document.getElementById("idw-display-close-button").onclick = function (event) {
                        // avoid click on the map again
                        map.off('click', mapClickListen);
                        idwMarker.remove();
                        idwDisplay.remove();
                        idwMarker = undefined;
                        idwDisplay = undefined;
                        // turn on the map click function
                        setTimeout(() => {
                            map.on('click', mapClickListen);
                        }, 100);
                    };
                });

            // L.marker(rows[0][0],rows[0][1]).addTo(map);


        })
        // setInterval(test1,5000);
        //window.setInterval(App,5000);
        L.control.IDWLegend(aqiGradient, IDWOptions).addTo(map);

    }, [])


    // console.log(rows);

    return (
        <div className="App">
            <Map ref={mapRef} center={[28.7041, 77.1025]} zoom={9} maxZoom={9} minZoom={9} >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors" />
                <Search />
            </Map>
            <div id="navigation"
                onclick={() => {
                    <Router>
                        <Switch>
                            <Route exact path="/map" render={() => <HereMaps />} />
                        </Switch>
                    </Router>
                }}><div id="icon1"><img src={"/Vector.png"}></img>
                </div>
                <div id="text"><p id="text1">Directions</p></div>
            </div>

        </div>
    );
}

export default Home;