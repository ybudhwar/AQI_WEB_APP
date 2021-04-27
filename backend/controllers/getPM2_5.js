const { default: axios } = require("axios");

let database = [];

exports.updateDatabase = async () => {
  let newData = [];
  const locations = [
    "delhi/Alipur",
    "delhi/anand-vihar",
    "delhi/aya-nagar",
    "delhi/mandir-marg",
    "delhi/jawaharlal-nehru-stadium",
    "delhi/mundka",
    "india/ghaziabad/indirapuram",
    "india/new-delhi/us-embassy",
    "delhi/pusa",
    "india/noida/sector-125",
    "delhi/dite-okhla",
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
  console.log(database);
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

  for (let i = 0; i < database.length; i++) {
    const x2 = database[i].latitude;
    const y2 = database[i].longitude;

    dist = distance(x1, y1, x2, y2);

    top += database[i].pm / Math.pow(dist, 2);
    bot += 1 / Math.pow(dist, 2);

    // console.log(x2, y2, database[i].pm, dist);
  }
  let pm2_5;
  if (bot == 0) {
    pm2_5 = top;
  } else {
    pm2_5 = top / bot;
  }

  return pm2_5;
};
