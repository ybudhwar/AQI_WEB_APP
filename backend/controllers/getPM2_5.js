const { default: axios } = require("axios");
const getColorForPercentage = require("../utils/getColorForPercentage");

let database = [];

exports.updateDatabase = async () => {
  let newData = [];
  const locations = [
    "delhi/Alipur",
    "delhi/anand-vihar",
    "delhi/aya-nagar",
    "delhi/delhi-institute-of-tool-engineering--wazirpur", //new
    "delhi/dite-okhla",
    "delhi/iti-jahangirpuri", //new
    "delhi/iti-shahdra--jhilmil-industrial-area", //new
    "delhi/jawaharlal-nehru-stadium",
    "delhi/major-dhyan-chand-national-stadium", //new
    "delhi/mandir-marg",
    "delhi/mother-dairy-plant--parparganj", //new
    "delhi/mundka",
    "delhi/narela", //new
    "delhi/pgdav-college--sriniwaspuri", //new
    "delhi/pooth-khurd--bawana", //new
    "delhi/punjabi-bagh", //new
    "delhi/pusa",
    "delhi/r.k.-puram", //new
    "delhi/satyawati-college", //new
    "delhi/shaheed-sukhdev-college-of-business-studies--rohini", //new
    "delhi/sonia-vihar-water-treatment-plant-djb", //new
    "delhi/sri-auribindo-marg", //new
    "india/ghaziabad/indirapuram",
    "india/ghaziabad/loni", //new
    "india/new-delhi/us-embassy",
    "india/noida/sector-1", //new
    "india/noida/sector-125",
  ]; // available locations for pm2.5 data

  const getData = async (location, api_url) => {
    await axios
      .get(api_url)
      .then((res) => {
        const arr = res.data.data.city.geo;
        if (arr[0] < arr[1]) {
          var latitude = arr[0];
          var longitude = arr[1];
        } else {
          var latitude = arr[1];
          var longitude = arr[0];
        }

        const pm = res.data.data.iaqi.pm25.v;

        newData = [...newData, { location, latitude, longitude, pm }];
      })
      .catch((err) => {
        console.log(err);
      });
  };

  for (var i = 0; i < locations.length; i++) {
    const api_url = `https://api.waqi.info/feed/${locations[i]}/?token=${process.env.waqi_api_key}`;
    await getData(locations[i], api_url);
  }

  database = newData;
  console.log("Updated Database!");
  // console.log(database);
};

exports.getPM2_5 = (lat, lng) => {
  const x1 = lat;
  const y1 = lng;

  let top = 0;
  let bot = 0;

  function distance(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }
  const currentDatabase = [...database]; // use contant value for a particular calculation as database is updated every 10 seconds
  for (let i = 0; i < currentDatabase.length; i++) {
    const x2 = currentDatabase[i].latitude;
    const y2 = currentDatabase[i].longitude;

    dist = distance(x1, y1, x2, y2);

    top += currentDatabase[i].pm / Math.pow(dist, 2);
    bot += 1 / Math.pow(dist, 2);
  }
  let pm2_5;
  if (bot == 0) {
    pm2_5 = top;
  } else {
    pm2_5 = top / bot;
  }

  return pm2_5;
};

exports.getPMColor = (routes = [], minPm, maxPm) => {
  let colorizedPmRoutes = [];
  // console.log(minPm, maxPm);
  routes.forEach((route) => {
    colorizedPmRoutes = [
      ...colorizedPmRoutes,
      route && route.length > 0
        ? route.map((section) => {
            const normalizedPm =
              maxPm > minPm ? (section.pmValue - minPm) / (maxPm - minPm) : -1;
            return {
              ...section,
              normalizedPm,
              pmColor: getColorForPercentage(normalizedPm),
            };
          })
        : {},
    ];
  });
  // console.log(colorizedPmRoutes)
  return colorizedPmRoutes;
};
