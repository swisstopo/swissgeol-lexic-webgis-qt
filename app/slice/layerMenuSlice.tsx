import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findLayerById } from '../utilities/LayerMenuUtilities';
import { FiltersType } from '../enum/filterTypeEnum';

export interface Filterable {
  filters?: Filter;
}

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

export interface Filter {
  filterByAttribute?: FilterByAttribute[];
  filterByTectoUnitsTerm?: FilterByTectoUnitsTermItem[];
  filterChronostratigraphyAge?: FilterChronostratigraphyAge[]
}

/* export interface LinkLabelItem {
  link: string;
  link_label: string;
  vocabulary_label: string;
} */

export interface AttributeOverride {
  column?: string;
  type?: 'text' | 'link';
  labelSourceForLink?: 'link' | 'vocabulary_label';
}

export interface AttributesConfiguration {
  attributes?: string[];
  attributeOverrides?: Record<string, AttributeOverride>;
}

export interface FilterByAttribute {
  key: string;
  value: string;
}
export interface FilterByTectoUnitsTermItem {
  term: string;
  includeNarrowers: boolean;
  narrowers?: string[];
}

export interface FilterTectoUnitsTerm {
  idVocabulary: string;
  queryNarrower: string;
  attributeToFilter: string[];
}

export interface FilterChronostratigraphyAge {
  idVocabulary: string;
  queryBetween: string;
  queryYounger: string;
  queryOlder: string
  idOlder: string;
  idYounger: string;
}

export interface FilterConfiguration {
  layerName: string;
  filterConfigurationByAttribute?: { key: string; label: string }[];
  filterConfigurationByTectoUnitsTerm?: FilterTectoUnitsTerm;
  filterChronostratigraphyAge?: FilterChronostratigraphyAge;
  filterLayer?: Layer;
}


export interface LayerState {
  layers: Layer[];
  iconFilterLayers: string | undefined;
  /* columnOverrideAttribute?: string[]; */
}

export interface Source {
  url: string,
  params: Record<string, string | boolean>,
  serverType: string,
  crossOrigin: string,
}

export interface Style {
  opacity: number;
}

/* iNTERFACCIA FILTER INITIAL STATE SENZA FILTRI */

const initialState: LayerState = {
  layers: [
    {
      id: 'TK500',
      label: 'TK500',
      isChecked: true,
      canFilter: false,
      canGetFeatureInfo: false,
      children: [{
        id: 'Tecto_Lines',
        label: 'Tectonic Lines',
        isChecked: false,
        canFilter: false,
        canGetFeatureInfo: false,
        source: {
          url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
          params: { 'LAYERS': 'Tecto_Lines', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 7,
      }, {
        id: 'Quat_Surfaces',
        label: 'Quat Surfaces',
        isChecked: false,
        canFilter: false,
        canGetFeatureInfo: false,
        source: {
          url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
          params: { 'LAYERS': 'Quat_Surfaces', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 6,
      }, {
        id: 'Tecto_Units_augm',
        label: 'Tectonic Units',
        isChecked: true,
        canFilter: true,
        filters: undefined,
        filterConfiguration: {
          layerName: 'Tecto_Units_augm_filtered',
          filterConfigurationByTectoUnitsTerm: {
            idVocabulary: 'TectonicUnits',
            queryNarrower: 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX ex: <https://lexic.swisstopo.demo.epsilon-italia.it/TectonicUnits/>\n\nSELECT ?narrowerConcept\n\nWHERE { \nex:${term} skos:narrower+ ?narrowerConcept.\n}',
            attributeToFilter: ['Tecto_lexic']
          },

          filterLayer: {
            id: 'Tecto_Units_augm_filtered',
            label: 'Tecto_Units_augm_filtered',
            isChecked: true,
            canFilter: false,
            canGetFeatureInfo: false,
            source: {
              url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
              params: {
                'LAYERS': 'Tecto_Units_augm_filtered', 'TILED': true,
                'FILTER': 'Tecto_Units_augm_filtered:1=0'
              },
              serverType: 'qgis',
              crossOrigin: 'anonymous',
            },
            style: {
              opacity: 0.3,
            },
            zIndex: 5,
          },
        },
        canGetFeatureInfo: true,
        source: {
          url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
          params: { 'LAYERS': 'Tecto_Units_augm', 'TILED': true },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 4,
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
        }
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
          filterLayer: {
            id: 'GC_BEDROCK_filtered',
            label: 'GC_BEDROCK_filtered',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false,
            source: {
              url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
              params: {
                'LAYERS': 'GC_BEDROCK_filtered', 'TILED': true,
                'FILTER': 'GC_BEDROCK_filtered:1=0'
              },
              serverType: 'qgis',
              crossOrigin: 'anonymous',
            },
            style: {
              opacity: 0.3,
            },
            zIndex: 3,
          },
        },
        canGetFeatureInfo: true,
        source: {
          url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
          params: {
            'LAYERS': 'GC_BEDROCK',
          },
          serverType: 'qgis',
          crossOrigin: 'anonymous',
        },
        style: {
          opacity: 0.3,
        },
        zIndex: 2,
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
          url: 'https://qgis.swisstopo.demo.epsilon-italia.it/qgis-server/',
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
    toggleCheck: (state, action: PayloadAction<string>) => {
      console.log("Toggling layer:", action.payload);

      const updateIndeterminateStatus = (layer: Layer): Layer => {
        if (!layer.children) return layer;

        const totalChildren = layer.children.length;
        const checkedChildren = layer.children.filter(child => child.isChecked).length;

        layer.isIndeterminate = checkedChildren > 0 && checkedChildren < totalChildren;

        layer.children.forEach(child => updateIndeterminateStatus(child));
        return layer;
      };

      const toggleLayerAndChildren = (layer: Layer): Layer => {
        if (layer.id === action.payload) {
          if (!layer.children) {
            return { ...layer, isChecked: !layer.isChecked };
          } else {
            const updatedLayer = {
              ...layer,
              isChecked: !layer.isChecked,
              children: layer.children.map(child => ({ ...child, isChecked: !layer.isChecked }))
            };
            return updatedLayer;
          }
        }

        if (layer.children) {
          const updatedChildren = layer.children.map(child => {
            if (child.id === action.payload) {
              return { ...child, isChecked: !child.isChecked };
            }
            return child;
          });

          const atLeastOneChildChecked = updatedChildren.some(child => child.isChecked);

          if (atLeastOneChildChecked) {
            return { ...layer, isChecked: true, children: updatedChildren };
          }

          return { ...layer, isChecked: false, children: updatedChildren };
        }

        return layer;
      };

      state.layers = state.layers.map(toggleLayerAndChildren).map(updateIndeterminateStatus);
    },
    toggleFilter: (state, action: PayloadAction<string | undefined>) => {
      state.iconFilterLayers = action.payload;
    },
    addFilter: (state, action: PayloadAction<{ layerId: string, filter: Filter, filterType: FiltersType }>) => {
      const { layerId, filter, filterType } = action.payload;
      console.log('Aggiunta filtro al layer con ID:', layerId);

      const layer = findLayerById(state.layers, layerId);

      if (layer && filter) {
        if (!layer.filters) {
          layer.filters = {};
        }

        switch (filterType) {
          case 'filterByAttribute':
            console.log('Aggiungendo filtroByAttribute al layer:', filter);
            if (!layer.filters.filterByAttribute) {
              layer.filters.filterByAttribute = [];
            }
            if (filter.filterByAttribute) {
              const filterByAttributeArray = filter.filterByAttribute as FilterByAttribute[];
              const existingFilterIndex = layer.filters.filterByAttribute.findIndex(f => f.key === filterByAttributeArray[0]?.key);

              if (existingFilterIndex !== -1) {
                layer.filters.filterByAttribute[existingFilterIndex].value = filter.filterByAttribute[0]?.value;
                console.log('Filtro aggiornato:', filter.filterByAttribute);
              } else {
                layer.filters.filterByAttribute.push(...filter.filterByAttribute);
                console.log('Filtro aggiunto:', filter.filterByAttribute);
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
          default:
            break;
        }

        /* if (layer.filterConfiguration?.filterLayer) {
          layer.filterConfiguration.filterLayer.isChecked = true;
        } */

      } else {
        console.error('Layer non trovato o filtro non valido');
      }
      return state;
    },

    removeFilter: (state, action: PayloadAction<{ layerId: string, filterKey: string }>) => {
      const { layerId, filterKey } = action.payload;

      const layerToUpdate = findLayerById(state.layers, layerId);

      if (layerToUpdate && layerToUpdate.filters) {
        if (layerToUpdate.filters.filterByAttribute) {
          layerToUpdate.filters.filterByAttribute = layerToUpdate.filters.filterByAttribute.filter(attr => attr.key !== filterKey);
        }

        if (layerToUpdate.filters.filterByTectoUnitsTerm) {
          layerToUpdate.filters.filterByTectoUnitsTerm = layerToUpdate.filters.filterByTectoUnitsTerm.filter(term => term.term !== filterKey);
        }

        /* if (layerToUpdate.filters.filterByAttribute.length === 0 && layerToUpdate.filterConfiguration?.filterLayer) {
          layerToUpdate.filterLayer.isChecked = false;
        } */
      }
    },

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

