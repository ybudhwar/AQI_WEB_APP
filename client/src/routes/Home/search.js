import { useLeaflet } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useEffect } from 'react';
import "leaflet-geosearch/dist/geosearch.css"
import "leaflet-geosearch/assets/css/leaflet.css"
import L from './js/leaflet-custom';
import { latLng } from 'leaflet';

const Search = (props) => {
    const { map } = useLeaflet() // access to leaflet map
  
  
    useEffect(() => {
      const searchControl = new GeoSearchControl({
        provider: new OpenStreetMapProvider(),
        style: 'bar',
        autoComplete: true,
        
   //     marker: {icon: L.Icon.idwMarker(latLng,)},
        //showPopup: true,
       // autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        //keepResult: true,
        searchLabel: 'Search places',
        updateMap: false,
      })
  
      map.addControl(searchControl) // this is how you add a control in vanilla leaflet
      return () => map.removeControl(searchControl)
    }, [])
  
    return null // don't want anything to show up from this comp
  }

  export default Search