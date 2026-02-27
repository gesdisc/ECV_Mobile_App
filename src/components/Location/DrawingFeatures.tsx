import React, { useEffect, useRef } from "react";
import { FeatureGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { EditControl } from "react-leaflet-draw";

import { ActionType, useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";

import {
  BoundingBox,
  Coordinates,
  SpatialAreaType,
} from "../../types/time-series.types";

// Import the marker images
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useActionListener } from "../../hooks/useActionListener";

// Fix default marker icon issues
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

interface SpatialArea {
  type: SpatialAreaType;
  value: Coordinates | BoundingBox;
}

/**
 *
 * Restore default geometry based on spatial type.
 *
 */
function restoreDefaultSpatial(fg: any, spatialArea: SpatialArea) {
  // Clear any existing layers
  fg.clearLayers();

  if (spatialArea.type === SpatialAreaType.COORDINATES) {
    const { lat, lng } = spatialArea.value as Coordinates;

    const marker = L.marker([parseFloat(lat), parseFloat(lng)]);
    fg.addLayer(marker);
  } else if (spatialArea.type === SpatialAreaType.BOUNDING_BOX) {
    // FIXME: MAP GOES BLANK!
    console.log("RESTORE BOUNDING BOX");
    const { west, south, east, north } = spatialArea.value as BoundingBox;

    console.log(spatialArea.value);
    const rectangle = L.rectangle([
      [parseFloat(south), parseFloat(west)],
      [parseFloat(north), parseFloat(east)],
    ]);
    fg.addLayer(rectangle);
  }
}

interface DrawingFeaturesProps {
  onMapOptionChange: (option: SpatialAreaType) => void;
}

const DrawingFeatures: React.FC<DrawingFeaturesProps> = ({
  onMapOptionChange,
}) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  const drawDefaultSpatial = () => {
    const fg = featureGroupRef.current;
    if (!fg) return;
    restoreDefaultSpatial(fg, ctxParams.spatialArea);
    onMapOptionChange(ctxParams.spatialArea.type);
  };

  // Restore marker|bbox UI after state change (eg. Tab Switch)
  useEffect(() => {
    // If user changed parameters
    if (staged.spatialArea) {
      const fg = featureGroupRef.current;
      if (!fg) return;

      restoreDefaultSpatial(fg, staged.spatialArea);
      onMapOptionChange(staged.spatialArea.type);

      return;
    }

    // default state (no staged/changed parameters)
    // Draw Initial marker
    drawDefaultSpatial();
  }, []);

  const handleCreated = (e: L.DrawEvents.Created) => {
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
  // const handleDeleted = (e: L.DrawEvents.Deleted) => {
  //   // e.layers contains all deleted layers
  //   console.log("Deleted layers:", e.layers.getLayers());

  //   const fg = featureGroupRef.current;
  //   if (!fg) return;

  //   // remove everything manually
  //   // fg.clearLayers();

  //   // Restore default point
  //   // const { lat, lng } = ctxParams.spatialArea.value as Coordinates;

  //   // const defaultMarker = L.marker([parseFloat(lat), parseFloat(lng)]);

  //   // fg.addLayer(defaultMarker);
  // };

  // listen to toast cancel action
  useActionListener(ActionType.CANCEL, () => {
    // Restore marker|bbox UI after user canceled modified parameters
    drawDefaultSpatial();
  });

  const handleEdited = (e: L.DrawEvents.Edited) => {
    const layerArray = e.layers.getLayers();
    const layer = layerArray[0]; // only one layer exists

    if (layer instanceof L.Marker) {
      const { lat, lng } = layer.getLatLng();
      // console.log(lat, lng);
      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.COORDINATES,
          value: {
            lat: convertToFixedFloat(lat, 4).toString(),
            lng: convertToFixedFloat(lng, 4).toString(),
          },
        },
      });
    }

    if (layer instanceof L.Rectangle) {
      const bounds = layer.getBounds();
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
        onEdited={handleEdited}
        // onDeleted={handleDeleted}
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
          remove: false, // hides the built-in trash button
        }}
      />
    </FeatureGroup>
  );
};

export default DrawingFeatures;
