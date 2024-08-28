import { Filter, Layer, LayerState, Source } from "../slice/layerMenuSlice";
import TileWMS from "ol/source/TileWMS";
import { createQueryString } from "./StringCreateFilter";

//seearch id layer sia nei layer padri che figli
export const findLayerById = (layers: Layer[], id: string): Layer | undefined => {
    for (const layer of layers) {
        if (layer.id === id) {
            return layer;
        }
        if (layer.children) {
            const foundLayer = findLayerById(layer.children, id);
            if (foundLayer) {
                return foundLayer;
            }
        }
    }
    return undefined;
};

//crea una lista espansa dei layers
export const createExpansLayersList = (layers: Layer[], removeDisabledFilterLayers: boolean): Layer[] => {
    const expandedLayers: Layer[] = [];

    const layersListExpands = (layer: Layer) => {
        expandedLayers.push(layer);

        if (layer.filterConfiguration?.filterLayer) {
            if (removeDisabledFilterLayers) {
                if (filtersNotEmpty(layer.filters)) {
                    expandedLayers.push(layer.filterConfiguration.filterLayer)
                }
            } else {
                expandedLayers.push(layer.filterConfiguration.filterLayer)
            };
        }

        if (layer.children && layer.children.length > 0) {
            layer.children.forEach(child => layersListExpands(child));
        }
    };

    layers.forEach(layer => layersListExpands(layer));

    return expandedLayers;
};

//contorlla se la lista dei filters è piena
export const filtersNotEmpty = (filters: Filter | undefined): boolean => {
    return filters != undefined &&
        (
            (filters.filterByAttribute != undefined && filters.filterByAttribute.length > 0) ||
            (filters.filterByTectoUnitsTerm != undefined && filters.filterByTectoUnitsTerm.length > 0)
        );
}


// prende la source data una lista di layer ed un id 
export const getSourceById = (layers: Layer[], id: string): TileWMS | undefined => {
    const layer = layers.find(layer => layer.id === id);
    if (!layer || !layer.source) {
        return undefined;
    }

    const sourceConfig = layer.source;
    if (sourceConfig.serverType !== 'qgis') {
        throw new Error('Il serverType della source non è corretto');
    }

    let params = { ...sourceConfig.params };
    const filterNoEmpty = filtersNotEmpty(layer.filters)

    if (filterNoEmpty) {
        const filterString = createQueryString(layer);
        const filterParam = `${layer.filterConfiguration?.layerName}:${filterString}`;
        params = {
            ...params,
            'FILTER': filterParam,
        };
    }

    return new TileWMS({
        url: sourceConfig.url,
        params: params,
        serverType: sourceConfig.serverType,
        crossOrigin: sourceConfig.crossOrigin,
    });
};


//crea una lista di source sui layer che hanno la possibilità delle features
export const getFeaturesLayers = (layers: Layer[]): TileWMS[] => {
    const infoLayers = layers.filter(layer => layer.canGetFeatureInfo);
    const sources: TileWMS[] = [];

    infoLayers.forEach(layer => {
        const source = getSourceById(layers, layer.id);
        if (source instanceof TileWMS) {
            sources.push(source);
        }
    });

    return sources;
};
