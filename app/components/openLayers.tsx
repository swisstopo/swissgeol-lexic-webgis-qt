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


interface LayerTileMap {
    [layerId: string]: TileLayer<TileWMS> | TileLayer<OSM>;
}
interface LayerFilters {
    [layerId: string]: string;
}

const MapComponent: React.FC = () => {
    const [newMap, setMap] = useState<Map | null>(null);

    const [layerTilesMap, setLayerTilesMap] = useState<LayerTileMap>({});
    const [addedLayerId, setAddedLayerId] = useState<string[]>([]);

    const layerData = useSelector((state: RootState) => state.layerMenuSlice.layers);
    const expandedLayerList = createExpansLayersList(layerData, false);
    const expandedLayerListFiltered = createExpansLayersList(layerData, true);

    const checkedLayers = expandedLayerListFiltered.filter(layer => layer.isChecked);

    const filterableLayers = expandedLayerList.filter(layer => layer.canFilter);
    const [layerFiltersMap, setLayerFiltersMap] = useState<LayerFilters>({});


    const mapElementRef = useRef<HTMLDivElement>(null);
    const infoElementRef = useRef<HTMLDivElement>(null);


    const [hasFetched, setHasFetched] = useState(false);
    const featuredFilterableLayers = expandedLayerListFiltered.filter(layer => layer.canGetFeatureInfo);
    const dispatch = useDispatch();

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
                }
            }
        });

        setLayerTilesMap(tileLayers);
    }, []);

    useEffect(() => {//bisognerà aggiungere un altro layer per i filtri con source diversa
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

    useEffect(() => {
        if (!mapElementRef.current) return;

        const newMap = new Map({
            target: mapElementRef.current,
            layers: [],
            view: new View({
                center: [919690.25, 5964019.75],
                zoom: 8,
                minZoom: 0,
                maxZoom: 28,
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
                    extent: new View({
                        center: [919690.25, 5964019.75],
                        zoom: 5,
                    }).getViewStateAndExtent().extent
                }),
                new Rotate(),
            ]),
        });

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

    useEffect(() => {
        if (!newMap) return;

        checkedLayers.forEach(layer => {
            const tileLayer = layerTilesMap[layer.id];
            if (tileLayer) {
                tileLayer.setOpacity(layer.style?.opacity ?? 1);
            }
        });

    }, [newMap, checkedLayers, layerTilesMap]);

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
                'EPSG:3857',
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
