import L from 'leaflet';
import { popup } from 'leaflet';


L.IdwMarker = L.CircleMarker.extend({
  options: {
    range: 1000,
    // [[dataType, min]]
    dataOptions: [[2, 0.0]],
    p: 2,
    // points: [[lat, lon, value]]
  },
  getIDW: function() {
    let numberOfDataType = this.options.dataOptions.length;
    let IDWValues = [[this._latlng.lat, this._latlng.lng]];
    for(let i = 0; i < numberOfDataType; i++) {
      IDWValues.push(this._IDW(i));
    }
    return IDWValues;
  },
  _filter: function(dataOptionIndex) {
    return this.options.points[dataOptionIndex].filter(point => {
      let coordinate = new L.latLng(point[0], point[1]);
      let distance = coordinate.distanceTo(this._latlng) / 1000.0;
      return distance < this.options.ranges[dataOptionIndex];
    });
  },
  _IDW: function(dataOptionIndex) {
    let min = this.options.dataOptions[dataOptionIndex][1] || 0.0;
    let dataType = this.options.dataOptions[dataOptionIndex][0] || 2;
    let p = this.options.p;
    let cellsn = 0.0;
    let cellsd = 0.0;
    let inCell = this._filter(dataOptionIndex);
    // Inverse Distance Weighting (IDW)
    //       Σ (1 / (di ^ p)) * vi
    // V = -------------------------
    //          Σ (1 / (di ^ p))
    // Reference:
    // http://www.gitta.info/ContiSpatVar/de/html/Interpolatio_learningObject2.xhtml
    
    // cellsn = Σ (1 / (di ^ p)) * vi
    // cellsd = Σ (1 / (di ^ p))
    if(inCell.length === 0) return "N/A";
    for (let i = inCell.length - 1; i >= 0; i--) {
      let destCoor = new L.latLng(inCell[i][0], inCell[i][1]);
      let distance = destCoor.distanceTo(this._latlng) / 1000.0;
      // A station locates here
      if(distance === 0.0) {
        return inCell[i][dataType];
      }
      let distanceRev = 1.0 / Math.pow(distance, p);
      if(distanceRev !== Infinity) {
        if(inCell[i][dataType] >= min) {
          cellsn += distanceRev * inCell[i][dataType];
          cellsd += distanceRev;
        }
      }
    }
    return Math.round(cellsn / cellsd * 10.0) / 10.0;
  }
});
L.idwMarker = function(latlng, options) {
  return new L.IdwMarker(latlng, options);
};


L.Control.DisplayIDW = L.Control.extend({
  initialize: function(values, options) {
    this.values = values;
    L.setOptions(this, options);
  },
  onAdd: function() {
    let container = L.DomUtil.create('div', 'idw-display leaflet-control-layers');
    container.innerHTML = 
      `<div class="leaflet-control-layers-base">
        <table>
          <tr>
            <td>GPS: </td>
            <td>${Math.round(this.values[0][0] * 1000.0) / 1000.0}, ${Math.round(this.values[0][1] * 1000.0) / 1000.0}</td>
          </tr>
          <tr>
            <td>AQI: </td>
            <td>${this.values[1]}</td>
          </tr>
        </table>
      </div>
      <div>
        <a id="idw-display-close-button" class="leaflet-popup-close-button" href="#close">×</a>
      </div>`;
    return container;
  }
});

L.control.displayIDW = function(values, options) {
  return new L.Control.DisplayIDW(values, options);
};

L.Control.IDWLegend = L.Control.extend({
  initialize: function(gradients, options) {
    this.gradients = this._transformGradient(gradients);
    this.unit = options.unit;
    L.Util.setOptions(this, options);
  },

  onAdd: function(map) {
    let container = L.DomUtil.create('div', 'idw-legend leaflet-control-layers'),
      gradesLabels = '',
      gradientsLength = this.gradients.length;
    let numLength = 0;
    for(let i = 0; i < gradientsLength; i++) {
      let length = this.gradients[i].key.toString().length;
      if(numLength < length) numLength = length;
    }
    // loop through our density intervals and 
    // generate a label with a colored square for each interval
    for(let i = 0; i < gradientsLength; i++) {
      let color = this.gradients[i].value;
        gradesLabels +=
          `<i style="background:${color};">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;` + 
          `${this._formatNumber(numLength, this.gradients[i].key)}` + 
          `${(this.gradients[i + 1] ? 
            `&nbsp;~&nbsp;${this._formatNumber(numLength, this.gradients[i + 1].key)}` : '+')}<br>`;
    }
    container.innerHTML =
      `<div class="leaflet-control-layers-base">
        <table>
          <tr>
            <td>${gradesLabels}</td>
          </tr>
          <tr>
            <td>${this.unit}</td>
          </tr>
        </table>
      </div>`;

    return container;
  },
  _transformGradient: function(gradients) {
    let newGradients = [];
    for(let i in gradients) {
      newGradients.push({key: +i, value: gradients[i]});
    }
    return newGradients.sort((item1, item2) => {
      return +item1.key - +item2.key;
    });
  },
  _formatNumber: function(length, number) {
    let result = number.toString();
    let numLength = result.length;
    result = result.replace("-", `&ndash;`);
    if(numLength < length) {
      for(let i = 0; i < length - numLength; i++) {
        result = "&nbsp;&nbsp;" + result;
      }
    }
    return result;
  }
});

L.control.IDWLegend = function(gradients, options) {
  return new L.Control.IDWLegend(gradients, options);
};




/*let airboxStations = new L.layerGroup();
      for (var i = airboxPoints.length - 1; i >= 0; i--) {
        // find calibrated airbox
        let calStation = calPoints.find(calPoint => {
          return airboxPoints[i][0].toFixed(3) == calPoint[0].toFixed(3) &&
             airboxPoints[i][1].toFixed(3) == calPoint[1].toFixed(3);
        });
      }*/

      
      
export default L