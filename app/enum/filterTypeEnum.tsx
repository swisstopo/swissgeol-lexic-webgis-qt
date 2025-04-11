/* Filter type Enum */
/**
 * This enum is used to specify the type of filter to be applied.
 */
export enum FiltersType {
    FilterByAttribute = 'filterByAttribute', //Identifies a filter type based on attributes.
    FilterByTectoUnitsTerm = 'filterByTectoUnitsTerm', //Identifies a filter type based on tectonic units terms.
    FilterByChronostratigraphy= 'filterByChronostratigraphy', //Identifies a filter type based on chronostratigraphy terms.
    FilterByLithostratigraphyTerm = 'filterByLithostratigraphyTerm', //Identifies a filter type based on lithostratigraphy terms.
    FilterByLithologyTerm = 'filterByLithologyTerm', //Identifies a filter type based on lithology terms.
    
}

/**
 * This enum is used to specify the type of filter Chronostratigraphy.
 */
export enum FilterOptionChronostratigraphy {
    Younger = "yon",
    Between = "bet",
    Older = "old",
}