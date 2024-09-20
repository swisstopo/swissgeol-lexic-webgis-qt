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
            const columns = getColumnNamesFromFilterConfiguration(layer);
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
                    conditions.push(`(${tectoConditions.join(' OR ')})`);
                } else {
                    conditions.push(tectoConditions[0]);
                }
            }
        }

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
const getColumnNamesFromFilterConfiguration = (layer: Layer): string[] => {
    const columns: string[] = [];

    if (layer.filterConfiguration && layer.filterConfiguration.filterConfigurationByTectoUnitsTerm) {
        const filterConfigurationByTectoUnitsTerm = layer.filterConfiguration.filterConfigurationByTectoUnitsTerm;

        if (filterConfigurationByTectoUnitsTerm.attributeToFilter && filterConfigurationByTectoUnitsTerm.attributeToFilter.length > 0) {
            columns.push(...filterConfigurationByTectoUnitsTerm.attributeToFilter);
        }
    }

    return columns;
};
