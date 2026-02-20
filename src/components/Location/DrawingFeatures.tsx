import React, { useRef } from "react";
import { FeatureGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { EditControl } from "react-leaflet-draw";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";

import { Coordinates, SpatialAreaType } from "../../types/time-series.types";

// Import the marker images
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix default marker icon issues
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

interface DrawingFeaturesProps {
  onMapOptionChange: (option: SpatialAreaType) => void;
}

const DrawingFeatures: React.FC<DrawingFeaturesProps> = ({
  onMapOptionChange,
}) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const { params: ctxParams, requestUpdateParams } = useDataParams();

  //   useMapEvents({
  //     click(e) {
  //       console.log("User selected POINT", e);
  //     },
  //   });

  // Initial marker
  //   useEffect(() => {
  //     console.log("This loaded");
  //     const fg = featureGroupRef.current;
  //     if (!fg) return;

  //     // add default marker
  //     // Restore default point
  //     const { lat, lng } = ctxParams.spatialArea.value as Coordinates;

  //     const marker = L.marker([parseFloat(lat), parseFloat(lng)]);
  //     fg.addLayer(marker);
  //   }, []);

  const handleCreated = (e: L.DrawEvents.Created) => {
    console.log("handleCreated");
    const fg = featureGroupRef.current;
    if (!fg) return;

    // REMOVE ALL EXISTING DRAWINGS
    fg.clearLayers();

    // add the new layer
    fg.addLayer(e.layer);

    if (e.layerType === "marker") {
      const { lat, lng } = (e.layer as L.Marker).getLatLng();

      onMapOptionChange(SpatialAreaType.COORDINATES);

      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.COORDINATES,
          value: {
            lat: convertToFixedFloat(lat, 4).toString(),
            lng: convertToFixedFloat(lng, 4).toString(),
          },
        },
      });
    } else if (e.layerType === "rectangle") {
      const bounds = (e.layer as L.Rectangle).getBounds();
      console.log(bounds);
      onMapOptionChange(SpatialAreaType.BOUNDING_BOX);

      const value = {
        west: convertToFixedFloat(bounds.getWest(), 4).toString(),
        south: convertToFixedFloat(bounds.getSouth(), 4).toString(),
        east: convertToFixedFloat(bounds.getEast(), 4).toString(),
        north: convertToFixedFloat(bounds.getNorth(), 4).toString(),
      };

      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.BOUNDING_BOX,
          value,
        },
      });
    }
  };

  // override leaflet-draw "clear-all" method
  const handleDeleted = (e: L.DrawEvents.Deleted) => {
    // e.layers contains all deleted layers
    console.log("Deleted layers:", e.layers.getLayers());

    const fg = featureGroupRef.current;
    if (!fg) return;

    // remove everything manually
    // fg.clearLayers();

    // Restore default point
    const { lat, lng } = ctxParams.spatialArea.value as Coordinates;

    const defaultMarker = L.marker([parseFloat(lat), parseFloat(lng)]);

    fg.addLayer(defaultMarker);
  };

  // EditControl props (MIGHT BE USEFUL LATER)
  //     onEdited?: (v: DrawEvents.Edited) => void;
  //     onDrawStart?: (v: DrawEvents.DrawStart) => void;
  //     onDrawStop?: (v: DrawEvents.DrawStop) => void;
  //     onDrawVertex?: (v: DrawEvents.DrawVertex) => void;
  //     onEditStart?: (v: DrawEvents.EditStart) => void;
  //     onEditMove?: (v: DrawEvents.EditMove) => void;
  //     onEditResize?: (v: DrawEvents.EditResize) => void;
  //     onEditVertex?: (v: DrawEvents.EditVertex) => void;
  //     onEditStop?: (v: DrawEvents.EditStop) => void;
  //     onDeleted?: (v: DrawEvents.Deleted) => void;
  //     onDeleteStart?: (v: DrawEvents.DeleteStart) => void;
  //     onDeleteStop?: (v: DrawEvents.DeleteStop) => void;
  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topleft"
        onCreated={handleCreated}
        // onEdited={handleEdited}
        onDeleted={handleDeleted}
        draw={{
          rectangle: true,
          polygon: false,
          polyline: false,
          circle: false,
          marker: true,
          circlemarker: false,
        }}
        edit={{
          featureGroup: featureGroupRef.current!,
        }}
      />
    </FeatureGroup>
  );
};

export default DrawingFeatures;
