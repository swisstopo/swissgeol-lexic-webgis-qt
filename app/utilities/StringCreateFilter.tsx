import { Layer } from '../slice/layerMenuSlice';

export const createQueryString = (layer: Layer): string => {
    let queryString = '\'\'';

    if (layer.filters) {
        const layerId = layer.filterConfiguration?.layerName;
        const byAttributeList = layer.filters?.filterByAttribute;
        const tectoTermsList = layer.filters?.filterByTectoUnitsTerm;

        const conditions: string[] = [];

        // Filtraggio per filterByAttribute
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


        // Filtraggio per filterByTectoUnitsTerm
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