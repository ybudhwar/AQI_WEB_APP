import { BASE_URL } from "helpers/config";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./HereMaps.module.scss";
import LOCATIONS from "./locations";

const H = window.H;
const apikey = process.env.REACT_APP_HERE_API_KEY;

const HereMaps = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [showPm, setShowPm] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(0);
  const [singleRoute, setSingleRoute] = useState(false);
  const mapObjects = useRef([]);

  const addMarkersToMap = useCallback((map, locations = []) => {
    if (!map) return;
    locations.forEach((location) => {
      const locationMarker = new H.map.Marker(location);
      map.addObject(locationMarker);
    });
  }, []);

  const addPolylineToMap = (
    map,
    linestring,
    lineWidth = 1,
    color = "#ff00ff",
    arrow = false
  ) => {
    let routeLine;
    if (arrow) {
      const routeOutline = new H.map.Polyline(linestring, {
        style: {
          lineWidth,
          strokeColor: color,
          lineTailCap: "arrow-tail",
          lineHeadCap: "arrow-head",
        },
      });
      const routeArrows = new H.map.Polyline(linestring, {
        style: {
          lineWidth,
          fillColor: "white",
          strokeColor: "rgba(255, 255, 255, 1)",
          lineDash: [0, 2],
          lineTailCap: "arrow-tail",
          lineHeadCap: "arrow-head",
        },
      });
      routeLine = new H.map.Group();
      routeLine.addObjects([routeOutline, routeArrows]);
    } else {
      routeLine = new H.map.Polyline(linestring, {
        style: { strokeColor: color, lineWidth },
      });
    }
    mapObjects.current = [...mapObjects.current, routeLine];
    map.addObjects([routeLine]);
  };
  const clearMap = useCallback(() => {
    const filteredValues = mapObjects.current.filter((value) =>
      map.getObjects().includes(value)
    );
    console.log(filteredValues);
    map.removeObjects(filteredValues);
    mapObjects.current = [];
  }, [map]);

  const showSingleRoute = () => {
    if (!map || !singleRoute) return;
    clearMap();
    routes[currentRoute].forEach((section) => {
      let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
      addPolylineToMap(
        map,
        linestring,
        10,
        showPm ? section.pmColor : section.congestionColor,
        !showPm
      );
    });
  };

  const updateMap = () => {
    if (!routes || !map) return;
    clearMap();
    routes.forEach((route) => {
      route.forEach((section) => {
        let linestring = H.geo.LineString.fromFlexiblePolyline(
          section.polyline
        );
        addPolylineToMap(
          map,
          linestring,
          10,
          showPm ? section.pmColor : section.congestionColor,
          !showPm
        );
      });
    });
  };

  const fetchAndAddRoutes = () => {
    if (!map) return;
    const origin = LOCATIONS.rajivChowk;
    const dest = LOCATIONS.okhla;
    const url = `${BASE_URL}/gettraveldata/origin=${origin.lat},${origin.lng}&dest=${dest.lat},${dest.lng}`;
    addMarkersToMap(map, [origin, dest]); // plot origin and destination on map
    fetch(url)
      .then((res) => res.json())
      .then((routes) => {
        setRoutes(routes);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(fetchAndAddRoutes, [map, addMarkersToMap]);
  useEffect(updateMap, [routes, map, showPm, singleRoute, clearMap]);
  useEffect(showSingleRoute, [
    routes,
    map,
    showPm,
    singleRoute,
    currentRoute,
    clearMap,
  ]);
  useLayoutEffect(() => {
    if (!mapRef.current) return;

    const platform = new H.service.Platform({
      apikey: apikey,
    });
    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: LOCATIONS.rajivChowk,
      zoom: 12,
      pixelRatio: window.devicePixelRatio || 1,
    });
    setMap(map);
    window.addEventListener("resize", map.getViewPort().resize);
    const behavior = new window.H.mapevents.Behavior(
      new window.H.mapevents.MapEvents(map)
    );

    console.log(behavior);
    return () => {
      window.removeEventListener("resize", map.getViewPort().resize);
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Congestion and PM2.5</h1>
        <button
          onClick={() => {
            return setShowPm((prevState) => {
              return !prevState;
            });
          }}
        >
          {showPm ? "Show Congestion" : "Show PM2.5"}
        </button>
        <br />
        {routes ? (
          <>
            <button
              onClick={() => {
                setSingleRoute((prevState) => !prevState);
              }}
            >
              {singleRoute ? "Show All Routes" : "Show Individual Routes"}
            </button>
            <br />
            {singleRoute
              ? routes.map((route, index) => {
                  return (
                    <button
                      onClick={() => {
                        setCurrentRoute(index);
                      }}
                      key={index}
                      disabled={currentRoute === index}
                    >
                      {`Show Route ${index + 1}`}
                    </button>
                  );
                })
              : null}{" "}
          </>
        ) : null}
      </div>
      <div id="demo-map" ref={mapRef} className={styles.hereMaps}></div>
    </>
  );
};

export default HereMaps;
