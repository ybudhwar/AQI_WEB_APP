import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Map, TileLayer, useLeaflet } from 'react-leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import 'esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css';
import places from './places.json';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import "leaflet-geosearch/dist/geosearch.css"
import "leaflet-geosearch/assets/css/leaflet.css"
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;

// Importing images from locally stored assets to address a bug
// in CodeSandbox: https://github.com/codesandbox/codesandbox-client/issues/3845

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('./images/marker-icon-2x.png'),
  iconUrl: require('./images/marker-icon.png'),
  shadowUrl: require('./images/marker-shadow.png')
});


// When importing into your own app outside of CodeSandbox, you can import directly
// from the leaflet package like below
//
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// });

const Search = (props) => {
  const { map } = useLeaflet() // access to leaflet map
  

  useEffect(() => {
      const searchControl = new GeoSearchControl({
          provider: new OpenStreetMapProvider(),
          style: 'bar',
          showMarker: true,
          showPopup: true,
          autoClose: true,
          retainZoomLevel: false,
          animateZoom: true,
          keepResult: true,
          searchLabel: 'search',
      })

      map.addControl(searchControl) // this is how you add a control in vanilla leaflet
      return () => map.removeControl(searchControl)
  }, [])

  return null // don't want anything to show up from this comp
}
async function data(lat,long) {
  const url = `https://api.waqi.info/feed/geo:${lat};${long}/?token=516b6b62876af81c27811d5b120aa26e1a34c43d`;
  const response = await fetch(url);
  const aqidata=await response.json();
  return aqidata.data.aqi;
}

function news() {
console.log(data(28.8834956663,77.089083701));
}



function App() {
  const mapRef = useRef();
  news();
  let aqiGradient = {
    0: "#F9F9F9",

    10: "#CCCCFF",
    30: "#BBBBEE",
    60: "#AAAADD",
    80: "#9999CC",
    100: "#8888BB",

    120: "#90FA96",
    140: "#82EA64",
    160: "#66DA36",
    180: "#50CA2C",
    200: "#4ABA26",

    220: "#FAFA5D",
    240: "#EAEA46",
    260: "#DADA4D",
    280: "#CACA42",
    300: "#BABA36",

    320: "#FF7777",
    340: "#EE6666",
    360: "#DD5555",
    380: "#CC4444",
    400: "#BB3333",

    420: "#E046E0",
    440: "#D03DD0",
    460: "#C032C0",
    480: "#B026B0",
    500: "#A01DA0"
  };
  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if ( !map ) return;

    const placesGeoJson = new L.GeoJSON(places, {
      style: function (feature) {
        var mag=feature.properties.DN;
        if (mag>=0 && mag<51 )
        {
          return {color: 'green'};
        }
        else if (mag>50 && mag<101 )
        {
          return {color: 'yellow'};
        }
        else if (mag>100 && mag<151 )
        {
          return {color: 'orange'};
        }
        else if (mag>150 && mag<201 )
        {
          return {color: 'red'};
        }
        else 
        {
          return {color: 'green'};
        }
      },
  
        onEachFeature: function (feature, layer) {
          var popupText = "<b>AQI:</b> " + feature.properties.DN ;
  
        layer.bindPopup(popupText, {
          closeButton: true,
          offset: L.point(0, 0)
        });
        layer.on('click', function() {
          layer.openPopup();
        });
      } 
    });

    placesGeoJson.addTo(map);

    

  }, [])


  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;
   // if(!query) return;
   fetchdata().then()
    // setUserData(fetchdata2())
   // fetchdata();
    console.log(userData);
    //let obj = userData;

    for (let i in userData) {
     
      rows.push([userData[i].lat, userData[i].lon, parseInt(userData[i].aqi)]);
     
    }

    if (!map) return;
    
    console.log(rows[0]);

    var idw = L.idwLayer(rows, {  
      opacity: 0.3,
     // maxZoom: 18,
      cellSize: 10,
      exp: 5,
      max: 300,
    });
    idw.addTo(map);
console.log(rows);
for (let j in rows)
{
  L.marker(rows[j][0],rows[j][1]).addTo(map);
  console.log(rows[j][0]);
};
  }, [])

  return (
    <div className="App">
    <h1 style={{textAlign: "center"}}>Aqi Map</h1>
      <Map  ref={mapRef} center={[28.7041, 77.1025]} zoom={10} style={{height:"85vh"}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors" />
        <Search/>
      </Map>
    </div>
  );
}

export default App;







// real code


function App() {
  const mapRef = useRef();
  let rows = [], columns;
  let aqiGradient = {
    0: "#F9F9F9",
    10: "#CCCCFF",
    30: "#BBBBEE",
    60: "#AAAADD",
    80: "#9999CC",
    100: "#8888BB",

    120: "#90FA96",
    140: "#82EA64",
    160: "#66DA36",
    180: "#50CA2C",
    200: "#4ABA26",

    220: "#FAFA5D",
    240: "#EAEA46",
    260: "#DADA4D",
    280: "#CACA42",
    300: "#BABA36",

    320: "#FF7777",
    340: "#EE6666",
    360: "#DD5555",
    380: "#CC4444",
    400: "#BB3333",

    420: "#E046E0",
    440: "#D03DD0",
    460: "#C032C0",
    480: "#B026B0",
    500: "#A01DA0"
  };
  //console.log(obj[0].Lat);

  //document.write(rows[0][2]);
  //const df = new DataFrame(rows, columns = ['lat', 'lon', 'aqi', 'name']);
 
const fetchdata=async()=> {
  const response=await fetch(url);
  const data= await response.json();
  userData = data.data
  //console.log(userData);
}



  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;
   // if(!query) return;
   fetchdata().then(() => {
    console.log(userData);
    for (let i in userData) {
      if(!isNaN(userData[i].aqi)) {
        rows.push([userData[i].lat, userData[i].lon, parseInt(userData[i].aqi)]);
      }
    }

    if (!map) return;
    console.log(rows);

    var idw = L.idwLayer(rows, {
      opacity: 0.4,
     // maxZoom: 18,
      cellSize: 1,
      exp: 5,
      max: 300,
     // gradient: aqiGradient,
    }).addTo(map);
    // idw.addTo(map);
    for (let j in rows){
        // latLng.lat=rows[j][0];
         ///latLng.lng=rows[j][1];
         L.circleMarker([parseFloat(rows[j][0]),parseFloat(rows[j][1])]).addTo(map);
       
       //console.log(rows[j][0]);
     };
    // L.marker(rows[0][0],rows[0][1]).addTo(map);

   })
   .finally( () => {
     setInterval(fetchdata,10000);
   })

    
  }, [])

  console.log(rows);

  
  return (
    <div className="App">
      <Map ref={mapRef} center={[28.7041, 77.1025]} zoom={9} >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors" />
        <Search />
        
      </Map>
      <div id="navigation"><div id="icon1"><img src={"/Vector.png"}></img>
      </div> 
      <div id="text"><p id="text1">Directions</p></div>
      </div>

    </div>
  );
} 

export default App;
