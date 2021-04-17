import { BASE_URL } from "helpers/config";
import React, { useEffect } from "react";
import styles from "./HereMaps.module.scss";
import LOCATIONS from "./locations";

const HereMaps = () => {
  const addMarkersToMap = (map, locations = []) => {
    locations.forEach((location) => {
      const locationMarker = new window.H.map.Marker(location);
      map.addObject(locationMarker);
    });
  };

  const addPolylineToMap = (map, locations = [], lineWidth = 1, color) => {
    let lineString = new window.H.geo.LineString();
    locations.forEach((loc) => {
      lineString.pushPoint(loc);
    });
    map.addObject(
      new window.H.map.Polyline(lineString, { style: { lineWidth: lineWidth+2 , strokeColor:'black'} })
    ); // add border to the polyline
    map.addObject(
      new window.H.map.Polyline(lineString, { style: { lineWidth: lineWidth , strokeColor:color} })
    );
  };

  

  useEffect(() => {
    const apikey = process.env.REACT_APP_HERE_API_KEY;
    const platform = new window.H.service.Platform({
      apikey: apikey,
    });
    const defaultLayers = platform.createDefaultLayers();
    const mapContainer = document.getElementById("demo-map");
    const map = new window.H.Map(
      mapContainer,
      defaultLayers.vector.normal.map,
      {
        center: LOCATIONS.delhi,
        zoom: 11,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );
    window.addEventListener("resize", map.getViewPort().resize);
    const behavior = new window.H.mapevents.Behavior(
      new window.H.mapevents.MapEvents(map)
    );

    console.log(behavior);

    const fetchAndAddRoutes = (map) => {
      const origin = LOCATIONS.rajivChowk;
      const dest = LOCATIONS.okhla;
      
      addMarkersToMap(map,[origin, dest]) // plot origin and destination on map
  
      const url = `${BASE_URL}/gettraveldata/origin=${origin.lat},${origin.lng}&dest=${dest.lat},${dest.lng}`;
      fetch(url)
        .then((res) => res.json())
        .then((routes) => {
          routes.forEach(route => {
            route.forEach(section => {
              const line = [section.begin, section.end];
              addPolylineToMap(map,line, 5, section.color)
            })
          })
        })
        .catch((err) => {
          console.log(err);
        });
    };
    
    fetchAndAddRoutes(map);

    return () => {
      window.removeEventListener("resize", map.getViewPort().resize);
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Here Maps Demo</h1>
      </div>
      <div id="demo-map" className={styles.hereMaps}></div>
    </>
  );
};

export default HereMaps;
