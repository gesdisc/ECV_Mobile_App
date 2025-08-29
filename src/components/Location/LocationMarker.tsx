import React from "react";
import { useMapEvents, Marker } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";

const LocationMarker: React.FC = () => {
  const { latitude, longitude, setLatitude, setLongitude } = useDataParams();
  useMapEvents({
    click(e) {
      setLatitude(e.latlng.lat); // update latitude on map click
      setLongitude(e.latlng.lng); // update longitude on map click
    },
  });

  return <Marker position={[latitude, longitude]}></Marker>; // place marker at current location
};

export default LocationMarker;
