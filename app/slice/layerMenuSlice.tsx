import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findLayerById } from '../utilities/LayerMenuUtilities';
import { FilterOptionChronostratigraphy, FiltersType } from '../enum/filterTypeEnum';
import { chronoQueries } from '../../queriesConfig';

/**
* Represents an object that can be filtered based on specific criteria.
*
* The `Filterable` interface is used to define objects that have filtering capabilities.
* It includes an optional `filters` property, which specifies the filtering criteria that can be applied to the object.
*
*/
export interface Filterable {
  filters?: Filter;
}

/**
*Defines the Layer to be added on the map with all the parameters that benefit the manipulation and updating of them:
* 
*Details:
* - isIndeterminate indicates whether all children are checked or not, modifying the check icon accordingly. 
*/
export interface Layer extends Filterable {
  id: string;
  label: string;
  isChecked: boolean;
  isIndeterminate?: boolean;
  canFilter: boolean;
  children?: Layer[];
  filters?: Filter;
  filterConfiguration?: FilterConfiguration;
  style?: Style;
  source?: Source;
  canGetFeatureInfo: boolean;
  zIndex?: number;
  attributesConfiguration?: AttributesConfiguration;
}
/**
* Defines the type of filter that can be applied to the layer.
*/
export interface Filter {
  filterByAttribute?: FilterByAttribute[];
  filterByTectoUnitsTerm?: FilterByTectoUnitsTermItem[];
  filterChronostratigraphyAge?: FilterChronostratigraphyAgeItem[]
}

/* export interface LinkLabelItem {
  link: string;
  link_label: string;
  vocabulary_label: string;
} */

/**
 * Interface representing an override for an attribute's configuration
 * 
 */
export interface AttributeOverride {
  column?: string;
  type?: 'text' | 'link';
  labelSourceForLink?: 'link' | 'vocabulary_label';
}

export interface FilterByTectoUnitsTermItem {
  term: string;
  includeNarrowers: boolean;
  narrowers?: string[];
}

/**
 * Interface representing a filter configuration for tectonic units
 * 
 * This interface defines the configuration for filtering based on tectonic units. 
 * It includes the vocabulary ID, a query for narrower terms, and a list of attributes to be filtered.
 * 
 * @property idVocabulary 
 * @property queryNarrower - The SPARQL query to find narrower terms
 * @property attributeToFilter
 */
export interface FilterTectoUnitsTerm {
  idVocabulary: string;
  queryNarrower: string;
  attributeToFilter: string[];
}
/**
 * Interface representing a filter configuration for chronostratigraphy age
 * 
 * This interface defines the configuration for filtering based on chronostratigraphy age. 
 * It includes the vocabulary ID, queries for different age ranges, and identifiers for older and younger ages.
 * 
 * @property idVocabulary 
 * @property queryBetween - The SPARQL query to filter between a range of ages
 * @property queryYounger - The SPARQL query to filter for younger ages
 * @property queryOlder - The SPARQL query to filter for older ages
 * @property idOlder
 * @property idYounger
 */
export interface FilterChronostratigraphyAgeItem {
  type: string;
  idOlder?: string;
  idYounger?: string;
  olderTerms?: string[];
  youngerTerms?: string[];
  betweenTerms?: string[];
}

export interface FilterChronostratigraphyAge {
  queryYounger_strict: string,
  queryOlder_strict: string,
  queryBetween_strict: string,
  columnToFilterYon: string,
  columnToFilterOld: string,
}
/**
 * Configuration for managing attributes in a layer.
 * 
 * The `AttributesConfiguration` interface defines how attributes are configured and overridden for a specific layer.
 * It includes the following properties:
 * 
 * - `attributes` (optional): An array of attribute names that are associated with the layer. These attributes define the properties
 *   or fields available in the layer.
 * 
 * - `attributeOverrides` (optional): A record where each key is an attribute name and each value is an `AttributeOverride` object.
 *   This allows for customization or overriding of attribute settings, such as changing display labels or specifying different types
 *   for attributes.
 * 
 * This interface is used to provide detailed configuration options for attributes, including default attributes and any customizations
 * required for specific use cases or display requirements.
 * 
 */
export interface AttributesConfiguration {
  attributes?: string[];
  attributeOverrides?: Record<string, AttributeOverride>;
}
/**
* Filter type characterized by key and value.
*/
export interface FilterByAttribute {
  key: string;
  value: string;
}
/**
* Defines properties for adding a filter to a layer.
*/
export interface FilterConfiguration {
  layerName: string;
  filterConfigurationByAttribute?: { key: string; label: string }[];
  filterConfigurationByTectoUnitsTerm?: FilterTectoUnitsTerm;
  filterChronostratigraphyAge?: FilterChronostratigraphyAge;
  filterLayer?: Layer;
}
/**
* Defines layer state properties at the application level.
*/
export interface LayerState {
  layers: Layer[];
  iconFilterLayers: string | undefined;
  /* columnOverrideAttribute?: string[]; */
}
/**
* Defines the properties that make up the sources to call up the various layers to be displayed on the map.
*/
export interface Source {
  url: string,
  params: Record<string, string | boolean>,
  serverType: string,
  crossOrigin: string,
}
/**
* Defines the style of the layers. 
*/
export interface Style {
  opacity: number;
}

/* INTERFACE FILTER INITIAL STATE WITHOUT FILTERS */
/**
*Initial status of the application:
* Contains:
* - layer
* - source of the layers.
* - initial style of the layers.
*/
const initialState: LayerState = {
  layers: [
    {
      id: 'TK500',
      label: 'TK500',
      isChecked: true,
      canFilter: false,
      canGetFeatureInfo: false,
      isIndeterminate: true,
      children: [{
        id: 'Tecto_Lines',
        label: 'Tectonic Lines',
        isChecked: false,
        canFilter: false,
        canGetFeatureInfo: false,
        source: {
          url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
          params: { 'LAYERS': 'Tecto_Lines', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 9,
      }, {
        id: 'Quat_Surfaces',
        label: 'Quat Surfaces',
        isChecked: false,
        canFilter: false,
        canGetFeatureInfo: false,
        source: {
          url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
          params: { 'LAYERS': 'Quat_Surfaces', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 8,
      }, {
        id: 'Tecto_Units_augm',
        label: 'Tectonic Units',
        isChecked: true,
        canFilter: true,
        filters: undefined,
        filterConfiguration: {
          layerName: 'Tecto_Units_augm_filtered',
          filterChronostratigraphyAge: {
            columnToFilterOld: 'Chrono_from_lexic',
            columnToFilterYon: 'Chrono_to_lexic',
            queryYounger_strict: chronoQueries.queryYounger,
            queryOlder_strict: chronoQueries.queryOlder,
            queryBetween_strict: chronoQueries.queryBetween,
          },
          filterConfigurationByTectoUnitsTerm: {
            idVocabulary: 'TectonicUnits',
            queryNarrower: 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX ex: <https://dev-lexic.swissgeol.ch/TectonicUnits/>\n\nSELECT ?concept\n\nWHERE { \nex:${term} skos:narrower+ ?concept.\n}',
            attributeToFilter: ['Tecto_lexic']
          },
          filterLayer: {
            id: 'Tecto_Units_augm_filtered',
            label: 'Tecto_Units_augm_filtered',
            isChecked: true,
            canFilter: false,
            canGetFeatureInfo: false,
            source: {
              url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
              params: {
                'LAYERS': 'Tecto_Units_augm_filtered', 'TILED': true,
                'FILTER': 'Tecto_Units_augm_filtered:1=0'
              },
              serverType: 'qgis',
              crossOrigin: 'anonymous',
            },
            style: {
              opacity: 1.0,
            },
            zIndex: 7,
          },
        },
        canGetFeatureInfo: true,
        source: {
          url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
          params: { 'LAYERS': 'Tecto_Units_augm', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 6,
        attributesConfiguration: {
          attributeOverrides: {
            Tecto_lexic: {
              column: 'Tecto_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
            Chrono_from_lexic: {
              column: 'Chrono_from_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
            Chrono_to_lexic: {
              column: 'Chrono_to_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
          },
        },
      }],
    },
    {
      id: 'geocover',
      label: 'GeoCover - Vektordaten',
      isChecked: false,
      canFilter: false,
      isIndeterminate: false,
      canGetFeatureInfo: false,
      children: [{
        id: 'GC_BEDROCK',
        label: 'GC_BEDROCK',
        isChecked: false,
        canFilter: true,
        filters: undefined,
        filterConfiguration: {
          layerName: 'GC_BEDROCK_filtered',
          filterChronostratigraphyAge: {
            columnToFilterOld: 'chrono_from_lexic',
            columnToFilterYon: 'chrono_to_lexic',
            queryYounger_strict: chronoQueries.queryYounger,
            queryOlder_strict: chronoQueries.queryOlder,
            queryBetween_strict: chronoQueries.queryBetween,
          },
          filterConfigurationByTectoUnitsTerm: {
            idVocabulary: 'TectonicUnits',
            queryNarrower: 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX ex: <https://dev-lexic.swissgeol.ch/TectonicUnits/>\n\nSELECT ?concept\n\nWHERE { \nex:${term} skos:narrower+ ?concept.\n}',
            attributeToFilter: ['tecto_lexic']
          },
          filterLayer: {
            id: 'GC_BEDROCK_filtered',
            label: 'GC_BEDROCK_filtered',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false,
            source: {
              url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
              params: {
                'LAYERS': 'GC_BEDROCK_filtered', 'TILED': true,
                'FILTER': 'GC_BEDROCK_filtered:1=0'
              },
              serverType: 'qgis',
              crossOrigin: 'anonymous',
            },
            style: {
              opacity: 1.0,
            },
            zIndex: 5,
          },
        },
        canGetFeatureInfo: true,
        source: {
          url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
          params: {
            'LAYERS': 'GC_BEDROCK',
          },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 4,
        attributesConfiguration: {
          attributeOverrides: {
            tecto_lexic: {
              column: 'tecto_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
            chrono_from_lexic: {
              column: 'chrono_from_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
            chrono_to_lexic: {
              column: 'chrono_to_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
          },
        },
      }, {
        id: 'GC_UNCO_DEPOSITS',
        label: 'GC_UNCO_DEPOSITS',
        isChecked: false,
        canFilter: true,
        filters: undefined,
        filterConfiguration: {
          layerName: 'GC_UNCO_DEPOSITS_filtered',
          filterChronostratigraphyAge: {
            columnToFilterOld: 'chrono_from_lexic',
            columnToFilterYon: 'chrono_to_lexic',
            queryYounger_strict: chronoQueries.queryYounger,
            queryOlder_strict: chronoQueries.queryOlder,
            queryBetween_strict: chronoQueries.queryBetween,
          },
          filterLayer: {
            id: 'GC_UNCO_DEPOSITS_filtered',
            label: 'GC_UNCO_DEPOSITS_filtered',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false,
            source: {
              url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
              params: {
                'LAYERS': 'GC_UNCO_DEPOSITS_filtered', 'TILED': true,
                'FILTER': 'GC_UNCO_DEPOSITS_filtered:1=0'
              },
              serverType: 'qgis',
              crossOrigin: 'anonymous',
            },
            style: {
              opacity: 1.0,
            },
            zIndex: 3,
          },
        },
        canGetFeatureInfo: true,
        source: {
          url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
          params: {
            'LAYERS': 'GC_UNCO_DEPOSITS',
          },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 2,
        attributesConfiguration: {
          attributeOverrides: {
            Tecto_lexic: {
              column: 'Tecto_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
            Chrono_from_lexic: {
              column: 'Chrono_from_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
            Chrono_to_lexic: {
              column: 'Chrono_to_lexic',
              type: 'link',
              labelSourceForLink: 'vocabulary_label',
            },
          },
        },
      },],
    },
    {
      id: 'fgdi',
      label: 'Federal Geo Data Infrastructure',
      isChecked: true,
      canFilter: false,
      canGetFeatureInfo: false,
      children: [{
        id: 'geologie-geocover',
        label: 'geologie-geocover',
        isChecked: true,
        canFilter: false,
        canGetFeatureInfo: false,
        source: {
          url: 'https://dev-ogcservices.swissgeol.ch/qgis-server/',
          params: { 'LAYERS': 'GeoCover-Vektordaten', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 1,
      }],
    },
    {
      id: 'osm',
      label: 'OpenStreetMap (OSM)',
      isChecked: false,
      canFilter: false,
      isIndeterminate: false,
      canGetFeatureInfo: false,
      style: {
        opacity: 0.3,
      },
      zIndex: 0,
    }
  ],
  iconFilterLayers: undefined,
};

export const layerMenuSlice = createSlice({
  name: 'layersMenuSlice',
  initialState,
  reducers: {
    /**
     *  Manages and updates the state of checked layers by cycling on both parent and child layers.
     * 
     * @param state state of layer 
     * @param action payloadAction is the data passed by the component
     */
    toggleCheck: (state, action: PayloadAction<string>) => {
      console.log("Toggling layer:", action.payload);

      const updateIndeterminateStatus = (layer: Layer): Layer => {
        if (!layer.children) return layer;
        const totalChildren = layer.children.length;
        const checkedChildren = layer.children.filter(child => child.isChecked).length;
        layer.isIndeterminate = checkedChildren > 0 && checkedChildren < totalChildren;
        layer.children = layer.children.map(updateIndeterminateStatus);
        return layer;
      };

      const updateFilterLayer = (layer: Layer, isChecked: boolean): Layer => {
        if (layer.canFilter && layer.filterConfiguration && layer.filterConfiguration.filterLayer) {
          layer.filterConfiguration.filterLayer.isChecked = isChecked;
        }
        return layer;
      };

      const toggleLayerAndChildren = (layer: Layer, targetId: string): Layer => {
        if (layer.id === targetId) {
          const newIsChecked = !layer.isChecked;
          let updatedLayer = updateFilterLayer(layer, newIsChecked);

          if (!updatedLayer.children) {
            return { ...updatedLayer, isChecked: newIsChecked };
          } else {
            return {
              ...updatedLayer,
              isChecked: newIsChecked,
              children: updatedLayer.children.map(child => {
                const updatedChild = { ...child, isChecked: newIsChecked };
                return updateFilterLayer(updatedChild, newIsChecked);
              })
            };
          }
        }

        if (layer.children) {
          const updatedChildren = layer.children.map(child => toggleLayerAndChildren(child, targetId));
          const atLeastOneChildChecked = updatedChildren.some(child => child.isChecked);

          return {
            ...layer,
            isChecked: atLeastOneChildChecked,
            children: updatedChildren
          };
        }

        return layer;
      };

      state.layers = state.layers.map(layer => toggleLayerAndChildren(layer, action.payload))
        .map(updateIndeterminateStatus);
    },
    /**
     * Changes the status that allows the filter icon to update appropriately if there are active filters on a given layer.
     * 
     * @param state state of layer 
     * @param action payloadAction is the data passed by the component 
     */
    toggleFilter: (state, action: PayloadAction<string | undefined>) => {
      state.iconFilterLayers = action.payload;
    },

    /**
     * ASllows a filter to be added to a given layer found by id
     * 
     * @param state state of layer 
     * @param action payloadAction is the data passed by the component 
     * @returns the updated state
     */
    addFilter: (state, action: PayloadAction<{ layerId: string, filter: Filter, filterType: FiltersType }>) => {
      const { layerId, filter, filterType } = action.payload;
      console.log('Add filter on layer with ID:', layerId, 'Filter details:', filter, 'Filter type:', filterType);

      const layer = findLayerById(state.layers, layerId);

      if (layer && filter) {
        if (!layer.filters) {
          layer.filters = {};
        }

        switch (filterType) {
          case 'filterByAttribute':
            if (!layer.filters.filterByAttribute) {
              layer.filters.filterByAttribute = [];
            }
            if (filter.filterByAttribute) {
              const filterByAttributeArray = filter.filterByAttribute as FilterByAttribute[];
              const existingFilterIndex = layer.filters.filterByAttribute.findIndex(f => f.key === filterByAttributeArray[0]?.key);

              if (existingFilterIndex !== -1) {
                layer.filters.filterByAttribute[existingFilterIndex].value = filter.filterByAttribute[0]?.value;
                console.log('Filter Update:', filter.filterByAttribute, ', Layer id:', layerId);
              } else {
                layer.filters.filterByAttribute.push(...filter.filterByAttribute);
                console.log('Add Filter:', filter.filterByAttribute, ', on layer id: ', layerId);
              }
            }
            break;
          case 'filterByTectoUnitsTerm':
            console.log('Aggiungendo filterByTectoUnitsTerm al layer:', filter);
            if (!layer.filters.filterByTectoUnitsTerm) {
              layer.filters.filterByTectoUnitsTerm = [];
            }
            if (filter.filterByTectoUnitsTerm) {
              const filterByTectoUnitsTermArray = filter.filterByTectoUnitsTerm as FilterByTectoUnitsTermItem[];
              const existingFilterIndex = layer.filters.filterByTectoUnitsTerm.findIndex(f => f.term === filterByTectoUnitsTermArray[0]?.term);

              if (existingFilterIndex !== -1) {
                layer.filters.filterByTectoUnitsTerm[existingFilterIndex] = filterByTectoUnitsTermArray[0];
                console.log('Filtro aggiornato:', filter.filterByTectoUnitsTerm);
              } else {
                layer.filters.filterByTectoUnitsTerm.push(...filterByTectoUnitsTermArray);
                console.log('Filtro aggiunto:', filter.filterByTectoUnitsTerm);
              }
            }
            break;
          case 'filterByChronostratigraphy':
            console.log('Aggiungendo filterByChronostratigraphy al layer:', filter);
            if (!layer.filters.filterChronostratigraphyAge) {
              layer.filters.filterChronostratigraphyAge = [];
            }

            if (filter.filterChronostratigraphyAge) {
              const filterChronostratigraphyAgeArray = filter.filterChronostratigraphyAge as FilterChronostratigraphyAgeItem[];
              const existingFilterIndex = layer.filters.filterChronostratigraphyAge.findIndex(f =>
                f.idYounger === filterChronostratigraphyAgeArray[0]?.idYounger &&
                f.idOlder === filterChronostratigraphyAgeArray[0]?.idOlder
              );

              if (existingFilterIndex !== -1) {
                layer.filters.filterChronostratigraphyAge[existingFilterIndex] = filterChronostratigraphyAgeArray[0];
                console.log('Filtro aggiornato:', filter.filterChronostratigraphyAge);
              } else {
                layer.filters.filterChronostratigraphyAge.push(...filterChronostratigraphyAgeArray);
                console.log('Filtro aggiunto:', filter.filterChronostratigraphyAge);
              }
            }
            break;
          default:
            break;
        }

      } else {
        console.error('Layer not found or filter is incorrect.');
      }
      return state;
    },

    /**
     * Allows a filter to be removed from a given layer by id
     * 
     * @param state state of layer 
     * @param action payloadAction is the data passed by the component 
     */
    removeFilter: (
      state,
      action: PayloadAction<{
        layerId: string;
        filterKey?: string;
        idYounger?: string;
        idOlder?: string;
        filterType?: FiltersType;
        type?: string;
      }>
    ) => {
      const { layerId, filterKey, idYounger, idOlder, filterType, type } = action.payload;
      const layerToUpdate = findLayerById(state.layers, layerId);

      if (layerToUpdate && layerToUpdate.filters) {
        if (filterType === FiltersType.FilterByChronostratigraphy) {
          if (layerToUpdate.filters.filterChronostratigraphyAge) {
            layerToUpdate.filters.filterChronostratigraphyAge = layerToUpdate.filters.filterChronostratigraphyAge.filter(attr =>
              (type === FilterOptionChronostratigraphy.Older && attr.type === FilterOptionChronostratigraphy.Older && attr.idOlder === idOlder) ||
                (type === FilterOptionChronostratigraphy.Younger && attr.type === FilterOptionChronostratigraphy.Younger && attr.idYounger === idYounger) ||
                (type === FilterOptionChronostratigraphy.Between && attr.type === FilterOptionChronostratigraphy.Between && attr.idOlder === idOlder && attr.idYounger === idYounger) ? false : true
            );
          }
        } else if (filterType === FiltersType.FilterByAttribute) {
          if (layerToUpdate.filters.filterByAttribute) {
            layerToUpdate.filters.filterByAttribute = layerToUpdate.filters.filterByAttribute.filter(attr => attr.key !== filterKey);
          }
        } else if (filterType === FiltersType.FilterByTectoUnitsTerm) {
          if (layerToUpdate.filters.filterByTectoUnitsTerm) {
            layerToUpdate.filters.filterByTectoUnitsTerm = layerToUpdate.filters.filterByTectoUnitsTerm.filter(term => term.term !== filterKey);
          }
        }
      }
    },
    /**
     * Updates with values passed by the component the opacity value of a given layer found by id
     * 
     * @param state state of layer 
     * @param action payloadAction is the data passed by the component 
     */
    updateOpacity(state, action: PayloadAction<{ layerId: string; opacity: number }>) {
      const { layerId, opacity } = action.payload;

      const updateOpacityRecursive = (layers: Layer[]): void => {
        for (const layer of layers) {
          if (layer.id === layerId) {
            if (layer.style) {
              layer.style.opacity = opacity;
            }
            return;
          }
          if (layer.filterConfiguration?.filterLayer && layer.filterConfiguration.filterLayer.id === layerId) {
            if (layer.filterConfiguration.filterLayer.style) {
              layer.filterConfiguration.filterLayer.style.opacity = opacity;
            }
            return;
          }
          if (layer.children) {
            updateOpacityRecursive(layer.children);
          }
        }
      };
      updateOpacityRecursive(state.layers);
    },
    /**
     * Action to update the attributes configuration for a specific layer
     * 
     * This action updates the `attributesConfiguration` of a layer in the Redux store state. 
     * It first retrieves the layer using `findLayerById` based on the provided `layerId`. 
     * If the layer is found, it initializes the `attributesConfiguration` object if it doesn't already exist,
     * and updates its `attributes` property with the new array of attributes provided in the action payload.
     * If the layer is not found, an error message is logged to the console.
     * 
     */
    setAttributesConfiguration: (
      state,
      action: PayloadAction<{ layerId: string; attributes: string[] }>
    ) => {
      const { layerId, attributes } = action.payload;
      const layer = findLayerById(state.layers, layerId);

      if (layer) {
        if (!layer.attributesConfiguration) {
          layer.attributesConfiguration = { attributes: [], attributeOverrides: {} };
        }

        layer.attributesConfiguration.attributes = attributes;
      } else {
        console.error('Layer non trovato');
      }
    },
  }
});

export const { toggleCheck, addFilter, removeFilter, toggleFilter, updateOpacity, setAttributesConfiguration } = layerMenuSlice.actions;

export default layerMenuSlice.reducer;