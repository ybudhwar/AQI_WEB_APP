import React, { useEffect } from "react";
import styles from "./HereMaps.module.scss";
import LOCATIONS from "./locations";

const HereMaps = () => {
  const addMarkersToMap = (map, locations=[]) => {
    locations.forEach((location)=>{
      const locationMarker = new window.H.map.Marker(location);
      map.addObject(locationMarker);
    })
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         

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

    console.log(behavior)

    addMarkersToMap(map,[LOCATIONS.delhi])

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
