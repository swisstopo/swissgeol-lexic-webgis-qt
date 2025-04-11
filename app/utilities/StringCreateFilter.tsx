import { FiltersType } from '../enum/filterTypeEnum';
import { Layer } from '../slice/layerMenuSlice';
/**
 * Create the query string for each filter to be added, even concatenating multiple filters.
 * 
 * @param layer layer on which the query string will be inserted
 * @returns query string for filter
 */
export const createQueryString = (layer: Layer): string => {
    let queryString = '\'\'';

    if (layer.filters) {
        const layerId = layer.filterConfiguration?.layerName;
        const byAttributeList = layer.filters?.filterByAttribute;
        const tectoTermsList = layer.filters?.filterByTectoUnitsTerm;
        const lithostratigraphyTermsList = layer.filters?.filterByLithostratigraphyTerm;
        const lithologyTermsList = layer.filters?.filterByLithologyTerm;
        const chronostratigraphyTermsList = layer.filters?.filterChronostratigraphyAge;

        const conditions: string[] = [];



        // Filtering by value/key attributes
        if (byAttributeList && byAttributeList.length > 0) {
            const attributeConditions = byAttributeList.map(attr =>
                `"${attr.key}" = \'${attr.value}\'`
            );
            conditions.push(...attributeConditions);
        }
        /*  if (layer.filters.filterByAttribute && layer.filters.filterByAttribute.length > 0) {
             const attributeConditions = layer.filters.filterByAttribute.map(attr =>
                 `"${attr.key}" = '${attr.value}'`
             );
             conditions.push(...attributeConditions);
         } */


        // Filtering by tecto units term
        if (tectoTermsList && tectoTermsList.length > 0) {
            const columns = getColumnNamesFromFilterConfiguration(layer, FiltersType.FilterByTectoUnitsTerm);
            const filterConfiguration = layer.filterConfiguration?.filterConfigurationByTectoUnitsTerm;

            if (columns && columns.length > 0 && filterConfiguration) {
                const tectoConditions: string[] = [];

                columns.forEach((column) => {
                    const values = tectoTermsList.flatMap(termItem =>
                        termItem.narrowers ? [termItem.term, ...termItem.narrowers] : [termItem.term]
                    );
                    const formattedValues = values.map(value => `\'${value}\'`).join(' , ');
                    tectoConditions.push(`"${column}" IN ( ${formattedValues} )`);
                });

                if (tectoConditions.length > 1) {
                    conditions.push(`( ${tectoConditions.join(' OR ')} )`);
                } else {
                    conditions.push(tectoConditions[0]);
                }
            }
        }

        // Filtering by chronostratigraphy term
        if (chronostratigraphyTermsList && chronostratigraphyTermsList.length > 0) {
            const chronoConditions: string[] = [];
            const columnOld = layer.filterConfiguration?.filterChronostratigraphyAge?.columnToFilterOld;
            const columnYon = layer.filterConfiguration?.filterChronostratigraphyAge?.columnToFilterYon;

            chronostratigraphyTermsList.forEach(termItem => {
                const { type, olderTerms, youngerTerms, betweenTerms } = termItem;

                if (type === 'old' && olderTerms) {
                    if (olderTerms.length > 0) {
                        const formattedOlderTerms = olderTerms.map(term => `\'${term}\'`).join(' , ');
                        chronoConditions.push(`"${columnOld}" IN ( ${formattedOlderTerms} )`);
                    } else {
                        chronoConditions.push(`"${columnOld}" IN ( 'empty' )`);
                    }
                } else if (type === 'yon' && youngerTerms) {
                    if (youngerTerms.length > 0) {
                        const formattedYoungerTerms = youngerTerms.map(term => `\'${term}\'`).join(' , ');
                        chronoConditions.push(`"${columnYon}" IN ( ${formattedYoungerTerms} )`);
                    } else {
                        chronoConditions.push(`"${columnYon}" IN ( 'empty' )`);
                    }

                } else if (type === 'bet' && betweenTerms) {
                    if (betweenTerms.length > 0) {
                        const formattedBetweenTerms = betweenTerms.map(term => `\'${term}\'`).join(' , ');
                        chronoConditions.push(`"${columnOld}" IN ( ${formattedBetweenTerms} )`);
                        chronoConditions.push(`"${columnYon}" IN ( ${formattedBetweenTerms} )`);
                    } else {
                        chronoConditions.push(`"${columnOld}" IN ( 'empty' )`);
                        chronoConditions.push(`"${columnYon}" IN ( 'empty' )`);
                    }
                }
            });

            if (chronoConditions.length > 1) {
                conditions.push(`( ${chronoConditions.join(' AND ')} )`);
            } else {
                conditions.push(chronoConditions[0]);
            }
        }

        // Filtering by lithostratigraphy term
        if (lithostratigraphyTermsList && lithostratigraphyTermsList.length > 0) {
            const columns = getColumnNamesFromFilterConfiguration(layer, FiltersType.FilterByLithostratigraphyTerm);
            const filterConfiguration = layer.filterConfiguration?.filterConfigurationByLithostratigraphyTerm;

            if (columns && columns.length > 0 && filterConfiguration) {
                const lithostratigraphyConditions: string[] = [];

                columns.forEach((column) => {
                    const values = lithostratigraphyTermsList.flatMap(termItem =>
                        termItem.narrowers ? [termItem.term, ...termItem.narrowers] : [termItem.term]
                    );
                    const formattedValues = values.map(value => `\'${value}\'`).join(' , ');
                    lithostratigraphyConditions.push(`"${column}" IN ( ${formattedValues} )`);
                });

                if (lithostratigraphyConditions.length > 1) {
                    conditions.push(`( ${lithostratigraphyConditions.join(' OR ')} )`);
                } else {
                    conditions.push(lithostratigraphyConditions[0]);
                }
            }
        }
        
        // Filtering by lithology term
        if (lithologyTermsList && lithologyTermsList.length > 0) {
            const columns = getColumnNamesFromFilterConfiguration(layer, FiltersType.FilterByLithologyTerm);
            const filterConfiguration = layer.filterConfiguration?.filterConfigurationByLithologyTerm;

            if (columns && columns.length > 0 && filterConfiguration) {
                const lithologyConditions: string[] = [];

                columns.forEach((column) => {
                    const values = lithologyTermsList.flatMap(termItem =>
                        termItem.narrowers ? [termItem.term, ...termItem.narrowers] : [termItem.term]
                    );
                    const formattedValues = values.map(value => `\'${value}\'`).join(' , ');
                    lithologyConditions.push(`"${column}" IN ( ${formattedValues} )`);
                });

                if (lithologyConditions.length > 1) {
                    conditions.push(`( ${lithologyConditions.join(' OR ')} )`);
                } else {
                    conditions.push(lithologyConditions[0]);
                }
            }
        }

        console.log('Layer filters:', layer.filters);
        console.log('Chrono terms:', chronostratigraphyTermsList);
        console.log('Conditions:', conditions);
        queryString = conditions.length > 0 ? `${layerId}:${conditions.join(' AND ')}` : '';
    }



    console.log('CREATESTRINGQUERY: ' + queryString);
    return queryString;
};
/**
 * Function to extract column names from a layer's filter configuration
 * 
 * This function retrieves column names that are specified in the filter configuration of a given layer. 
 * It checks if the layer has a filter configuration and if it includes filter settings based on tectonic units terms. 
 * If such settings are present and include attributes to filter, those attribute names are added to the result array.
 * 
 * @param layer - The layer object containing filter configuration
 * @returns An array of column names extracted from the filter configuration
 */
const getColumnNamesFromFilterConfiguration = (layer: Layer, filterType: FiltersType): string[] => {
    const columns: string[] = [];

    if (filterType == FiltersType.FilterByTectoUnitsTerm) {
        if (layer.filterConfiguration && layer.filterConfiguration.filterConfigurationByTectoUnitsTerm) {
            const filterConfigurationByTectoUnitsTerm = layer.filterConfiguration.filterConfigurationByTectoUnitsTerm;

            if (filterConfigurationByTectoUnitsTerm.attributeToFilter && filterConfigurationByTectoUnitsTerm.attributeToFilter.length > 0) {
                columns.push(...filterConfigurationByTectoUnitsTerm.attributeToFilter);
            }
        }
    } else if (filterType == FiltersType.FilterByLithostratigraphyTerm) {
        if (layer.filterConfiguration && layer.filterConfiguration.filterConfigurationByLithostratigraphyTerm) {
            const filterConfigurationByLithostratigraphyTerm = layer.filterConfiguration.filterConfigurationByLithostratigraphyTerm;

            if (filterConfigurationByLithostratigraphyTerm.attributeToFilter && filterConfigurationByLithostratigraphyTerm.attributeToFilter.length > 0) {
                columns.push(...filterConfigurationByLithostratigraphyTerm.attributeToFilter);
            }
        }
    } else if (filterType == FiltersType.FilterByLithologyTerm) {
        if (layer.filterConfiguration && layer.filterConfiguration.filterConfigurationByLithologyTerm) {
            const filterConfigurationByLithologyTerm = layer.filterConfiguration.filterConfigurationByLithologyTerm;

            if (filterConfigurationByLithologyTerm.attributeToFilter && filterConfigurationByLithologyTerm.attributeToFilter.length > 0) {
                columns.push(...filterConfigurationByLithologyTerm.attributeToFilter);
            }
        }
    }

    return columns;
};
