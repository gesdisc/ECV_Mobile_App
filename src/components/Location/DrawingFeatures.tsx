import React, { useEffect, useRef } from "react";
import { FeatureGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { EditControl } from "react-leaflet-draw";

import { ActionType, useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import { useActionListener } from "../../hooks/useActionListener";
import { restoreDefaultSpatial, validateCoordinates } from "./helpers";
import { SpatialAreaType } from "../../types/time-series.types";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface DrawingFeaturesProps {
  onMapDrawingOptionChange: (option: SpatialAreaType) => void;
  onError: (err: string | null) => void;
}

const DrawingFeatures: React.FC<DrawingFeaturesProps> = ({
  onMapDrawingOptionChange,
  onError,
}) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  // This will make sure marker|bbox reflects map input change and other state changes (eg. Tab Switch)
  useEffect(() => {
    if (staged.spatialArea) {
      const fg = featureGroupRef.current;
      if (!fg) return;

      restoreDefaultSpatial(fg, staged.spatialArea, onError);
      onMapDrawingOptionChange(staged.spatialArea.type);

      return;
    }

    // default state (no staged/changed parameters)
    // Draw Initial marker
    drawDefaultSpatial();
  }, [staged.spatialArea]);

  useEffect(() => {
    drawDefaultSpatial();
    // if (staged.spatialArea) {
    //   const fg = featureGroupRef.current;
    //   if (!fg) return;
    //   restoreDefaultSpatial(fg, staged.spatialArea, onError);
    //   onMapDrawingOptionChange(staged.spatialArea.type);
    //   return;
    // }
    // // default state (no staged/changed parameters)
    // // Draw Initial marker
    // drawDefaultSpatial();
  }, [ctxParams.spatialArea.value]);

  // listen to toast cancel action
  useActionListener(ActionType.CANCEL, () => {
    // Restore marker|bbox UI after user canceled modified parameters
    drawDefaultSpatial();
  });

  const drawPoint = (layer: L.Marker) => {
    const { lat, lng } = layer.getLatLng();

    onMapDrawingOptionChange(SpatialAreaType.COORDINATES);

    const stringifiedCoords = `${lat},${lng}`;

    const { coords, error } = validateCoordinates(
      stringifiedCoords,
      SpatialAreaType.COORDINATES
    );

    onError(error);

    requestUpdateParams({
      spatialArea: {
        type: SpatialAreaType.COORDINATES,
        value: {
          lat: convertToFixedFloat(lat, 4).toString(),
          lng: convertToFixedFloat(lng, 4).toString(),
        },
      },
    });
  };

  const drawBbox = (layer: L.Rectangle) => {
    const bounds = layer.getBounds();

    onMapDrawingOptionChange(SpatialAreaType.BOUNDING_BOX);

    const stringifiedBounds = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

    const { coords, error } = validateCoordinates(
      stringifiedBounds,
      SpatialAreaType.BOUNDING_BOX
    );

    onError(error);

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
  };

  const drawDefaultSpatial = () => {
    const fg = featureGroupRef.current;
    if (!fg) return;
    restoreDefaultSpatial(fg, ctxParams.spatialArea, onError);
    onMapDrawingOptionChange(ctxParams.spatialArea.type);
  };

  const handleCreated = (e: L.DrawEvents.Created) => {
    const fg = featureGroupRef.current;
    if (!fg) return;

    // REMOVE ALL EXISTING DRAWINGS
    fg.clearLayers();

    // add the new layer
    fg.addLayer(e.layer);

    if (e.layer instanceof L.Marker) {
      drawPoint(e.layer);
    } else if (e.layer instanceof L.Rectangle) {
      drawBbox(e.layer);
    }
  };

  const handleEdited = (e: L.DrawEvents.Edited) => {
    const layerArray = e.layers.getLayers();
    const layer = layerArray[0]; // only one layer exists

    if (layer instanceof L.Marker) {
      drawPoint(layer);
    } else if (layer instanceof L.Rectangle) {
      drawBbox(layer);
    }
  };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topleft"
        onCreated={handleCreated}
        onEdited={handleEdited}
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
