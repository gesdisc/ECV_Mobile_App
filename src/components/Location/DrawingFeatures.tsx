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

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useActionListener } from "../../hooks/useActionListener";
import { validateCoordinates } from "./helpers";

interface SpatialArea {
  type: SpatialAreaType;
  value: Coordinates | BoundingBox;
}

/**
 *
 * Restore default geometry based on spatial type.
 *
 */
function restoreDefaultSpatial(
  fg: any,
  spatialArea: SpatialArea,
  onError: (err: string | null) => void
) {
  // Clear any existing layers
  fg.clearLayers();

  if (spatialArea.type === SpatialAreaType.COORDINATES) {
    const { lat, lng } = spatialArea.value as Coordinates;

    const stringifiedCoords = `${lat},${lng}`;

    const { coords, error } = validateCoordinates(
      stringifiedCoords,
      SpatialAreaType.COORDINATES
    );

    onError(error);

    const marker = L.marker([parseFloat(lat), parseFloat(lng)]);
    fg.addLayer(marker);
  } else if (spatialArea.type === SpatialAreaType.BOUNDING_BOX) {
    // FIXME: MAP GOES BLANK!
    const { west, south, east, north } = spatialArea.value as BoundingBox;

    const stringifiedBounds = `${west},${south},${east},${north}`;

    const { coords, error } = validateCoordinates(
      stringifiedBounds,
      SpatialAreaType.BOUNDING_BOX
    );

    onError(error);

    const rectangle = L.rectangle([
      [parseFloat(south), parseFloat(west)],
      [parseFloat(north), parseFloat(east)],
    ]);
    fg.addLayer(rectangle);
  }
}

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

  // Restore marker|bbox UI after state change (eg. Tab Switch)
  useEffect(() => {
    // If user changed parameters
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
  }, []);

  // This will make sure marker|bbox reflects map input change
  useEffect(() => {
    if (staged.spatialArea) {
      const fg = featureGroupRef.current;
      if (!fg) return;

      restoreDefaultSpatial(fg, staged.spatialArea, onError);
      onMapDrawingOptionChange(staged.spatialArea.type);
    }
  }, [staged.spatialArea]);

  // listen to toast cancel action
  useActionListener(ActionType.CANCEL, () => {
    // Restore marker|bbox UI after user canceled modified parameters
    drawDefaultSpatial();
  });

  const drawPoint = (layer: L.Marker) => {
    // ...
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
    // ...
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
