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

  const addPolylineToMap = (
    map,
    linestring,
    lineWidth = 1,
    color = "#ff00ff",
    arrow = false
  ) => {
    let routeLine;
    if (arrow) {
      const routeOutline = new window.H.map.Polyline(linestring, {
        style: {
          lineWidth,
          strokeColor: color,
          lineTailCap: "arrow-tail",
          lineHeadCap: "arrow-head",
        },
      });
      const routeArrows = new window.H.map.Polyline(linestring, {
        style: {
          lineWidth,
          fillColor: "white",
          strokeColor: "rgba(255, 255, 255, 1)",
          lineDash: [0, 2],
          lineTailCap: "arrow-tail",
          lineHeadCap: "arrow-head",
        },
      });
      routeLine = new window.H.map.Group();
      routeLine.addObjects([routeOutline, routeArrows]);
    } else {
      routeLine = new window.H.map.Polyline(linestring, {
        style: { strokeColor: color, lineWidth },
      });
    }

    map.addObjects([routeLine]);
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
        center: LOCATIONS.rajivChowk,
        zoom: 12,
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

      addMarkersToMap(map, [origin, dest]); // plot origin and destination on map

      const url = `${BASE_URL}/gettraveldata/origin=${origin.lat},${origin.lng}&dest=${dest.lat},${dest.lng}`;
      fetch(url)
        .then((res) => res.json())
        .then((routes) => {
          routes.forEach((route) => {
            route.forEach((section) => {
              let linestring = window.H.geo.LineString.fromFlexiblePolyline(
                section.polyline
              );
              addPolylineToMap(map, linestring, 10, section.color, true);
            });
          });
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
