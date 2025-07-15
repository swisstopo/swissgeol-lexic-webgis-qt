"use client";

import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import TileWMS from "ol/source/TileWMS";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { boundingExtent } from "ol/extent";
import {
  Attribution,
  FullScreen,
  Rotate,
  ScaleLine,
  ZoomToExtent,
  defaults,
} from "ol/control";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  configurePostWMS,
  createExpansLayersList,
  getFeaturesLayers,
  getSourceById,
} from "../utilities/LayerMenuUtilities";
import { createQueryString } from "../utilities/StringCreateFilter";
import FeatureInfoPopup from "./featureInfoPopup";
import { setAttributesConfiguration } from "../slice/layerMenuSlice";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";

proj4.defs(
  "EPSG:2056",
  "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

/**
 * The map that contains layer ids and tileLayer
 */
interface LayerTileMap {
  [layerId: string]: TileLayer<TileWMS> | TileLayer<OSM> | TileLayer<WMTS>;
}

/**
 * The map containing layer ids and query(string) for filters.
 */
interface LayerFilters {
  [layerId: string]: string;
}

/**
 * Manages the map and its layers:
 * - creates the map
 * - constantly updates itself with every change on layer configurations(change of checked layers, opacity...)
 * - displays the checked layers
 * - displays filter layers
 */
const MapComponent: React.FC = () => {
  const [newMap, setMap] = useState<Map | null>(null);
  /**
   * map that contains for each layer id the source dl tileLayer
   */
  const [layerTilesMap, setLayerTilesMap] = useState<LayerTileMap>({});
  const [addedLayerId, setAddedLayerId] = useState<string[]>([]);
  const layerData = useSelector(
    (state: RootState) => state.layerMenuSlice.layers
  );
  /**
   * contains all layers.
   */
  const expandedLayerList = createExpansLayersList(layerData, false);
  /**
   * contains all layers that are filterable True.
   */
  const expandedLayerListFiltered = createExpansLayersList(layerData, true);
  /**
   * contains the list of layers that are checked.
   */
  const checkedLayers = expandedLayerListFiltered.filter(
    (layer) => layer.isChecked
  );
  /**
   * contains the list of layers that can be filtered.
   */
  const filterableLayers = expandedLayerList.filter((layer) => layer.canFilter);
  /**
   * State holding a map of layer IDs to their corresponding filter queries.
   */
  const [layerFiltersMap, setLayerFiltersMap] = useState<LayerFilters>({});
  const mapElementRef = useRef<HTMLDivElement>(null);
  const infoElementRef = useRef<HTMLDivElement>(null);
  /**
   * State indicating whether the data has been successfully fetched.
   *
   * This boolean flag is used to track whether the initial data fetching process has been completed.
   * It helps in managing the state and controlling conditional rendering or data fetching operations.
   */
  const [hasFetched, setHasFetched] = useState(false);
  /**
   * List of layers that can be queried for feature information, filtered from the expanded layer list.
   */
  const featuredFilterableLayers = expandedLayerListFiltered.filter(
    (layer) => layer.canGetFeatureInfo
  );
  const dispatch = useDispatch();
  const defaultExtend = [
    2479999.9701, 1061999.6351, 2865002.5601, 1302018.7201,
  ];
  /**
   * Creates the expanded list of layers by setting the layerTilesMap.
   *
   * This effect runs when the component mounts.
   * It builds the `tileLayers` object by first loading OSM and WMS layers synchronously,
   * then fetching WMTS capabilities asynchronously before updating the state once.
   *
   * Use a custom load function ('setTileLoadFunction' located in the configurePostWMS function)
   * to turn the default GET into a POST request for WMS.
   */
  useEffect(() => {
    const loadTileLayers = async () => {
      const tileLayers: LayerTileMap = {};

      // --- Load OSM layer if present ---
      // Find and create the OpenStreetMap tile layer, then add it to the tileLayers map
      const osmLayer = expandedLayerList.find((layer) => layer.id === "osm");
      if (osmLayer) {
        const osmTileLayer = new TileLayer<OSM>({ source: new OSM() });
        tileLayers["osm"] = osmTileLayer;
      }
      // --- Load all WMS layers synchronously ---
      // Iterate through layers that are not OSM and have no WMTS URL,
      // configure any TileWMS sources, create their TileLayer, and store it
      expandedLayerList.forEach((layer) => {
        if (layer.id !== "osm" && !layer.source?.urlWMTS) {
          const source = getSourceById(expandedLayerList, layer.id);
          if (source) {
            if (source instanceof TileWMS) {
              configurePostWMS(source);
            }
            const tileLayer = new TileLayer<TileWMS>({
              source,
              opacity: layer.style?.opacity ?? 1,
            });
            if (layer.zIndex) {
              tileLayer.setZIndex(layer.zIndex);
            }
            tileLayers[layer.id] = tileLayer;
            console.log("WMS", tileLayer);
          }
        }
      });
      // --- Prepare and start loading WMTS layers asynchronously ---
      // Build an array of Promises where each Promise fetches the WMTS capabilities,
      // parses them, creates a TileLayer, and stores it. Push each Promise into wmtsPromises.
      const wmtsPromises: Promise<void>[] = [];

      expandedLayerList.forEach((layer) => {
        if (layer.id === "osm") return;

        const sourceConf = layer.source;
        if (!sourceConf || !sourceConf.urlWMTS || !sourceConf.paramsWMTS)
          return;

        const wmtsPromise = (async () => {
          try {
            const resp = await fetch(sourceConf.urlWMTS as string);
            const text = await resp.text();
            const caps = new WMTSCapabilities().read(text);

        const wmtsOpts = optionsFromCapabilities(caps, {
          ...sourceConf.paramsWMTS,
          crossOrigin: sourceConf.crossOrigin,
        });

        const {
          layer: wmtsLayer,
          style,
          matrixSet,
          format: desiredFormat,
        } = sourceConf.paramsWMTS as {
          layer: string;
          style: string;
          matrixSet: string;
          format: string;
        };

        if (!wmtsOpts) return;

        wmtsOpts.style = style;

            if (wmtsOpts) {
              const wmtsSource = new WMTS(wmtsOpts);
              const tileLayer = new TileLayer({
                source: wmtsSource,
                opacity: layer.style?.opacity ?? 1,
              });
              if (layer.zIndex) {
                tileLayer.setZIndex(layer.zIndex);
              }
              tileLayers[layer.id] = tileLayer;
            }
          } catch (error) {
            console.error(
              `Errore caricamento WMTS per layer ${layer.id}:`,
              error
            );
          }
        })();

        wmtsPromises.push(wmtsPromise);
      });
      // --- Wait for all WMTS fetches to complete, then update state once ---
      // Pause until every wmtsPromise resolves, then set the full tileLayers map into component state
      await Promise.all(wmtsPromises);
      setLayerTilesMap(tileLayers);
    };

    loadTileLayers();
  }, []);
  /**
   * Creates the filterLayerMap by setting a filter string for each id.
   *
   * List dependencies:
   * - {Layers[]} filterableLayers the list of filterable layers.
   * - {LayerFilters} layerFiltersMap the map containing layer ids and query(string) for the filters.
   */
  useEffect(() => {
    const newLayerFiltersMap: LayerFilters = {};

    filterableLayers.forEach((layer) => {
      console.log("Inizio ciclo inserimento filtri...");
      if (
        layer.filters &&
        layer.filterConfiguration?.filterLayer &&
        layer.id !== layer.filterConfiguration.filterLayer.id
      ) {
        console.log("Creazione della stringa...");
        const filterString = createQueryString(layer);
        /* const filterParam = `${filterString} `; */
        console.log("openLayer.tsx, query string: " + filterString);
        newLayerFiltersMap[layer.filterConfiguration.filterLayer.id] =
          filterString;
      }
    });

    if (
      JSON.stringify(newLayerFiltersMap) !== JSON.stringify(layerFiltersMap)
    ) {
      setLayerFiltersMap(newLayerFiltersMap);
    }
  }, [filterableLayers, layerFiltersMap]);
  /**
   * Does Params update of layers to apply filters.
   *
   * List dependencies:
   * - {LayerFilters} layerFiltersMap the map that contains layer id and query(string).
   * - {LayerTileMap} layerTilesMap the map that contains layer id and tileLayer.
   */
  useEffect(() => {
    Object.entries(layerFiltersMap).forEach(([layerId, filterString]) => {
      const tileLayer = layerTilesMap[layerId];
      if (tileLayer) {
        const source = tileLayer.getSource();
        if (source instanceof TileWMS) {
          console.log(
            "LayerId: " + layerId + " Filter String: " + filterString
          );
          source.updateParams({ CQL_FILTER: filterString });
          source.refresh();
        }
      }
    });
  }, [layerFiltersMap, layerTilesMap]);
  /**
   * Creates the map by loading the layers that are inserted into the layerTilesMap map.
   *
   * List dependencies:
   * - {LayerTileMap} layerTilesMap the map that contains layer id and tileLayer.
   */
  useEffect(() => {
    if (!mapElementRef.current) return;

    const newMap = new Map({
      target: mapElementRef.current,
      layers: [],
      view: new View({
        //in order: longitude, latitude
        center: [2660013.54, 1185171.98],
        zoom: 8.6,
        minZoom: 0,
        maxZoom: 28,
        projection: "EPSG:2056",
      }),
      controls: defaults({ attribution: false }).extend([
        new Attribution({
          collapsed: true,
          collapsible: true,
        }),
        new FullScreen(),
        new ScaleLine(),
        new ZoomToExtent({
          label: "D",
          extent: defaultExtend,
        }),
        new Rotate(),
      ]),
    });
    newMap.getView().fit(defaultExtend);
    setMap(newMap);

    const layersToAdd = checkedLayers.filter((layer) => {
      const tileLayer = layerTilesMap[layer.id];
      return tileLayer && !addedLayerId.includes(layer.id);
    });

    layersToAdd.forEach((layer) => {
      const tileLayer = layerTilesMap[layer.id];
      if (tileLayer && !addedLayerId.includes(layer.id)) {
        newMap.addLayer(tileLayer);
        setAddedLayerId((prevIds) => [...prevIds, layer.id]);
      }
    });

    newMap.on("pointermove", function (evt) {
      if (evt.dragging) {
        return;
      }

      const originalEvent = evt.originalEvent as PointerEvent;
      const layer = checkedLayers.find((layer) => layer.canGetFeatureInfo);

      let layerFeatures:
        | TileLayer<TileWMS>
        | TileLayer<OSM>
        | TileLayer<WMTS>
        | null = null;

      if (layer) {
        const activeLayerId = layer.id;
        layerFeatures = layerTilesMap[activeLayerId];
      }

      if (layerFeatures) {
        const data = layerFeatures.getData(evt.pixel) as unknown as
          | number[]
          | undefined;
        const hit = data && data.length >= 4 && data[3] > 0;

        if (originalEvent.pointerType === "mouse") {
          newMap.getTargetElement().style.cursor = hit ? "pointer" : "";
        }
      }
    });

    return () => {
      newMap.setTarget(undefined);
    };
  }, [layerTilesMap]);
  /**
   * Here we check whether layers have been added to the map or not by avoiding adding layers that have already been added to the map
   *
   * Dependencies list:
   * - {Layers[]} checkedLayers contains the checked layers.
   * - {LayerTileMap} layerTilesMap the map that contains layer ids and tileLayers.
   * - {Map} newMap the map of open layers.
   */
  useEffect(() => {
    if (!newMap) return;

    const layersToAdd = checkedLayers.filter((layer) => {
      const tileLayer = layerTilesMap[layer.id];
      return tileLayer && !addedLayerId.includes(layer.id);
    });

    layersToAdd.forEach((layer) => {
      const tileLayer = layerTilesMap[layer.id];
      if (tileLayer && !addedLayerId.includes(layer.id)) {
        newMap.addLayer(tileLayer);
        setAddedLayerId((prevIds) => [...prevIds, layer.id]);
      }
    });
  }, [newMap, checkedLayers, layerTilesMap]);
  /**
   * Deletes layers from the map if they are no longer present in the array of checked layers.
   *
   * Dependencies list:
   * - {Layers[]} checkedLayers contains the checked layers.
   * - {LayerTileMap} layerTilesMap the map that contains layer ids and tileLayers.
   * - {Map} newMap the map of open layers.
   */
  useEffect(() => {
    if (!newMap) return;

    addedLayerId.forEach((layerId) => {
      const layerExists = checkedLayers.some(
        (checkedLayer) => checkedLayer.id === layerId
      );
      if (!layerExists) {
        const tileLayer = layerTilesMap[layerId];
        if (tileLayer) {
          newMap.removeLayer(tileLayer);
          setAddedLayerId((prevIds) => prevIds.filter((id) => id !== layerId));
        }
      }
    });
  }, [newMap, checkedLayers, layerTilesMap]);
  /**
   * Checks whether tileLayers of checked layers changes by dynamically updating opacity.
   *
   * Dependencies list:
   * - {Layers[]} checkedLayers contains the checked layers.
   * - {LayerTileMap} layerTilesMap the map that contains layer ids and tileLayers.
   * - {Map} newMap the map of open layers.
   */
  useEffect(() => {
    if (!newMap) return;

    checkedLayers.forEach((layer) => {
      const tileLayer = layerTilesMap[layer.id];
      if (tileLayer) {
        tileLayer.setOpacity(layer.style?.opacity ?? 1);
      }
    });
  }, [newMap, checkedLayers, layerTilesMap]);
  /**
   * Retrieves and stores attribute names for each feature-enabled layer.
   *
   * For every layer that supports feature info, this function builds a WFS
   * DescribeFeatureType URL, fetches the XML schema, parses out all element
   * names (excluding "geom" and "id"), and dispatches them to Redux under
   * attributesConfiguration.
   */
  const fetchAndStoreAttributeNames = () => {
    if (!newMap) return;

    featuredFilterableLayers.forEach((layerConfig) => {
      const src = layerConfig.source;
      if (!src?.url || !src.params?.LAYERS) return;

      const layerName = src.params.LAYERS as string;
      const baseWmsUrl = src.url;

      const urlObj = new URL(baseWmsUrl);

      urlObj.pathname = urlObj.pathname.replace(/\/?wms\/?$/, "/wfs");

      urlObj.search = "";
      urlObj.searchParams.set("service", "WFS");
      urlObj.searchParams.set("version", "1.1.0");
      // For each feature-info-enabled layer, constructs a WFS DescribeFeatureType request URL.
      // More robust method than simulating clicking on the center of the map.
      urlObj.searchParams.set("request", "DescribeFeatureType");
      urlObj.searchParams.set("typeName", layerName);

      const describeUrl = urlObj.toString();
      console.log(`[DFT] URL per ${layerName}:`, describeUrl);

      fetch(describeUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          return res.text();
        })
        .then((xmlText) => {
          const xmlDoc = new DOMParser().parseFromString(
            xmlText,
            "application/xml"
          );
          const seq = xmlDoc.getElementsByTagName("xsd:sequence")[0];
          const elements = seq
            ? Array.from(seq.getElementsByTagName("xsd:element"))
            : [];
          const attributeNames = elements
            .map((el) => el.getAttribute("name") || "")
            // we extract from the XML schema all feature names except "geom" and "id"
            .filter((n) => n && !["geom", "id", "color_id"].includes(n));

          console.log(`[DFT] Attributi ${layerName}:`, attributeNames);
          if (attributeNames.length) {
            dispatch(
              setAttributesConfiguration({
                layerId: layerConfig.id,
                attributes: attributeNames,
              })
            );
          }
        })
        .catch((err) => {
          console.error(`DFT error per ${layerName}:`, err);
        });
    });

    setHasFetched(true);
  };

  /**
   * Effect hook to manage the fetching and storing of attribute names.
   *
   * This hook is responsible for triggering the `fetchAndStoreAttributeNames` function, but only if the attributes have
   * not yet been fetched (`hasFetched` is false). It ensures that attribute names are fetched and stored when the `newMap`
   * object changes, but avoids redundant fetch operations if the data has already been retrieved.
   *
   * The `hasFetched` flag is used to prevent unnecessary fetches. Once the attribute names have been successfully fetched,
   * `hasFetched` is set to true, ensuring that the `fetchAndStoreAttributeNames` function is not called again unnecessarily.
   * This behavior helps in optimizing performance by avoiding duplicate requests and ensuring efficient data management.
   */
  useEffect(() => {
    if (!hasFetched) {
      fetchAndStoreAttributeNames();
    }
  }, [newMap, hasFetched, featuredFilterableLayers]);


  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapElementRef} style={{ width: "100%", height: "100%" }} />
      <FeatureInfoPopup
        map={newMap}
        checkedLayerListFeatures={checkedLayers}
        layers={expandedLayerList}
      />
    </div>
  );
};

export default MapComponent;
