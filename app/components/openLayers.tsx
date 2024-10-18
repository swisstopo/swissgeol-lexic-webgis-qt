'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { boundingExtent } from 'ol/extent';
import { Attribution, FullScreen, Rotate, ScaleLine, ZoomToExtent, defaults } from 'ol/control';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { createExpansLayersList, getFeaturesLayers, getSourceById } from '../utilities/LayerMenuUtilities';
import { createQueryString } from '../utilities/StringCreateFilter';
import FeatureInfoPopup from './featureInfoPopup';
import { setAttributesConfiguration } from '../slice/layerMenuSlice';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';


proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

/**
 * The map that contains layer ids and tileLayer
 */
interface LayerTileMap {
    [layerId: string]: TileLayer<TileWMS> | TileLayer<OSM>;
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
    const layerData = useSelector((state: RootState) => state.layerMenuSlice.layers);
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
    const checkedLayers = expandedLayerListFiltered.filter(layer => layer.isChecked);
    /**
     * contains the list of layers that can be filtered.
     */
    const filterableLayers = expandedLayerList.filter(layer => layer.canFilter);
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
    const featuredFilterableLayers = expandedLayerListFiltered.filter(layer => layer.canGetFeatureInfo);
    const dispatch = useDispatch();
    const defaultExtend = [2479999.9701, 1061999.6351, 2865002.5601, 1302018.7201];
    /**
    * Creates the expanded list of layers by setting the layerTilesMap.
    * 
    * This effect runs whenever the dependencies change. It initializes the `tileLayers` object
    * based on the filtered list of layers and their ability to provide feature information. 
    */
    useEffect(() => {
        const tileLayers: LayerTileMap = {};

        const osmLayer = expandedLayerList.find(layer => layer.id === 'osm');
        if (osmLayer) {
            const osmTileLayer = new TileLayer<OSM>({ source: new OSM() });
            tileLayers['osm'] = osmTileLayer;
        }

        expandedLayerList.forEach(layer => {
            if (layer.id !== 'osm') {
                const source = getSourceById(expandedLayerList, layer.id);
                if (source) {
                    const tileLayer = new TileLayer<TileWMS>({ source, opacity: layer.style?.opacity ?? 1 });
                    if (layer.zIndex) {
                        tileLayer.setZIndex(layer.zIndex);
                    }
                    tileLayers[layer.id] = tileLayer;
                    console.log(tileLayer);
                }
            }
        });

        setLayerTilesMap(tileLayers);
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

        filterableLayers.forEach(layer => {
            console.log('Inizio ciclo inserimento filtri...')
            if (layer.filters && layer.filterConfiguration?.filterLayer && layer.id !== layer.filterConfiguration.filterLayer.id) {
                console.log('Creazione della stringa...')
                const filterString = createQueryString(layer);
                /* const filterParam = `${filterString} `; */
                console.log('openLayer.tsx, query string: ' + filterString)
                newLayerFiltersMap[layer.filterConfiguration.filterLayer.id] = filterString;
            }
        });

        if (JSON.stringify(newLayerFiltersMap) !== JSON.stringify(layerFiltersMap)) {
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
                    console.log('LayerId: ' + layerId + ' Filter String: ' + filterString)
                    source.updateParams({ FILTER: filterString });
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
                projection: 'EPSG:2056'
            }),
            controls: defaults({ attribution: false }).extend([
                new Attribution({
                    collapsed: true,
                    collapsible: true,
                }),
                new FullScreen(),
                new ScaleLine(),
                new ZoomToExtent({
                    label: 'D',
                    extent: defaultExtend,
                }),
                new Rotate(),
            ]),
        });
        newMap.getView().fit(defaultExtend);
        setMap(newMap);

        const layersToAdd = checkedLayers.filter(layer => {
            const tileLayer = layerTilesMap[layer.id];
            return tileLayer && !addedLayerId.includes(layer.id);
        });

        layersToAdd.forEach(layer => {
            const tileLayer = layerTilesMap[layer.id];
            if (tileLayer && !addedLayerId.includes(layer.id)) {
                newMap.addLayer(tileLayer);
                setAddedLayerId(prevIds => [...prevIds, layer.id]);
            }
        });

        newMap.on('pointermove', function (evt) {
            if (evt.dragging) {
                return;
            }

            const originalEvent = evt.originalEvent as PointerEvent;
            const layer = checkedLayers.find(layer => layer.canGetFeatureInfo);

            let layerFeatures: TileLayer<TileWMS> | TileLayer<OSM> | null = null;

            if (layer) {
                const activeLayerId = layer.id;
                layerFeatures = layerTilesMap[activeLayerId];
            }

            if (layerFeatures) {
                const data = layerFeatures.getData(evt.pixel) as unknown as number[] | undefined;
                const hit = data && data.length >= 4 && data[3] > 0;

                if (originalEvent.pointerType === 'mouse') {
                    newMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
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

        const layersToAdd = checkedLayers.filter(layer => {
            const tileLayer = layerTilesMap[layer.id];
            return tileLayer && !addedLayerId.includes(layer.id);
        });

        layersToAdd.forEach(layer => {
            const tileLayer = layerTilesMap[layer.id];
            if (tileLayer && !addedLayerId.includes(layer.id)) {
                newMap.addLayer(tileLayer);
                setAddedLayerId(prevIds => [...prevIds, layer.id]);
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

        addedLayerId.forEach(layerId => {
            const layerExists = checkedLayers.some(checkedLayer => checkedLayer.id === layerId);
            if (!layerExists) {
                const tileLayer = layerTilesMap[layerId];
                if (tileLayer) {
                    newMap.removeLayer(tileLayer);
                    setAddedLayerId(prevIds => prevIds.filter(id => id !== layerId));
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

        checkedLayers.forEach(layer => {
            const tileLayer = layerTilesMap[layer.id];
            if (tileLayer) {
                tileLayer.setOpacity(layer.style?.opacity ?? 1);
            }
        });

    }, [newMap, checkedLayers, layerTilesMap]);
    /**
     * Function to retrieve and store attribute names from feature layers.
     * 
     * It identifies the features of the layers that are filterable by generating a 
     * `GetFeatureInfo` URL request to take this information about each layer. The function retrieves the XML response,
     * parses it, and extracts the attribute names from the features. 
     * the attribute names from the features. If the attribute names are found, they are sent to the archive 
     * and the status is updated to indicate that the attributes have been retrieved.
     * 
     * Feature layers refer to data associated with specific points on the map. Some layers are configured to return detailed 
     * data about the terrain or other attributes when queried, such as geological information, tectonic units, or chronological 
     * data. 
     * In conclusion, feature layers are the layers that have the possibility of requesting getFeatureInfo,
     * and which therefore have associated attributes for each feature.
     */
    const fetchAndStoreAttributeNames = () => {
        if (!newMap) return;

        const view = newMap.getView();
        const viewResolution = view.getResolution();
        if (!viewResolution) return;

        const sources = getFeaturesLayers(featuredFilterableLayers);

        sources.forEach(source => {
            const center = newMap.getView().getCenter() || [0, 0];
            const url = source.getFeatureInfoUrl(
                center,
                viewResolution,
                'EPSG:2056',
                { 'INFO_FORMAT': 'text/xml' }
            );
            if (!url) return;

            fetch(url)
                .then(response => response.text())
                .then(xmlText => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
                    const featureElements = xmlDoc.getElementsByTagName('Feature');
                    const attributeNames: string[] = [];

                    for (let i = 0; i < featureElements.length; i++) {
                        console.log('creazione del popup fake')
                        const attributes = featureElements[i].getElementsByTagName('Attribute');
                        for (let j = 0; j < attributes.length; j++) {
                            const attributeName = attributes[j].getAttribute('name');
                            if (attributeName && !attributeNames.includes(attributeName)) {
                                attributeNames.push(attributeName);
                            }
                        }
                    }
                    console.log(attributeNames)
                    if (attributeNames.length > 0) {
                        console.log('creazione del popup fake entrato nell if')
                        const layerId = source.getParams().LAYERS;
                        dispatch(setAttributesConfiguration({ layerId, attributes: attributeNames }));
                        setHasFetched(true);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        });
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
    }, [newMap]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div ref={mapElementRef} style={{ width: '100%', height: '100%' }} />
            <FeatureInfoPopup map={newMap} checkedLayerListFeatures={checkedLayers} layers={expandedLayerList} />
        </div>
    );
};

export default MapComponent;
