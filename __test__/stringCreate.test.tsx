import { createQueryString } from '../app/utilities/StringCreateFilter';
import { Layer } from '../app/slice/layerMenuSlice';

/**
 * Test suite for the createQueryString function
 * 
 * These tests verify that the createQueryString function correctly generates
 * filter queries for different types of filters and their combinations.
 */
describe('String Create Query', () => {
    /**
     * Tests the behavior when no filter is defined
     */
    it('filter list undefined', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: undefined,
            label: 'layer',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe("''");
    });

    /**
     * Tests filtering by a single attribute value
     */
    it('FilterByAttribute with 1 Attribute', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ]
            },
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            label: 'layer',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\'');
    });

    /**
     * Tests filtering by multiple attribute values
     */
    it('FilterByAttribute with multiple Attributes', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' },
                    { key: 'Litho_EN', value: 'Molasse (Cenozoic)' },
                    { key: 'Shape_Area', value: '159457153.91848147' }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Litho_EN" = \'Molasse (Cenozoic)\' AND "Shape_Area" = \'159457153.91848147\'');
    });

    /**
     * Tests filtering by a tectonic unit term without narrowers
     */
    it('FilterByTecnoTerms with 1 Value without narrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByTectoUnitsTerm: [
                    { term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau', includeNarrowers: false }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' )');
    });

    /**
     * Tests filtering by a tectonic unit term with narrowers (hierarchical terms)
     */
    it('FilterByTecnoTerms with 1 Value with narrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByTectoUnitsTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau',
                        narrowers: [
                            'https://dev-lexic.swissgeol.ch/TectonicUnits/SilberenSlices',
                            'https://dev-lexic.swissgeol.ch/TectonicUnits/MonteRosaNappe'
                        ],
                        includeNarrowers: true
                    }
                ]
            },
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            label: 'layer',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/SilberenSlices\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/MonteRosaNappe\' )');
    });

    /**
     * Tests combination of attribute filter and tectonic unit filter without narrowers
     */
    it('FilterByAttribute with 1 Attribute and FilterByTecnoTerms with 1 Value without narrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ],
                filterByTectoUnitsTerm: [
                    { term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau', includeNarrowers: false }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' )');
    });

    /**
     * Tests combination of attribute filter and tectonic unit filter with narrowers
     */
    it('FilterByAttribute with 1 Attribute and FilterByTecnoTerms with 1 Value with narrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ],
                filterByTectoUnitsTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau',
                        narrowers: [
                            'https://dev-lexic.swissgeol.ch/TectonicUnits/HauteSaonePlatform'
                        ],
                        includeNarrowers: true
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/HauteSaonePlatform\' )');
    });

    /**
     * Tests combination of multiple attribute filters and tectonic unit filter without narrowers
     */
    it('FilterByAttribute with multiple Attributes and FilterByTecnoTerms with 1 Value without narrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' },
                    { key: 'Litho_EN', value: 'Molasse (Cenozoic)' },
                    { key: 'Shape_Area', value: '159457153.91848147' }
                ],
                filterByTectoUnitsTerm: [
                    { term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau', includeNarrowers: false }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Litho_EN" = \'Molasse (Cenozoic)\' AND "Shape_Area" = \'159457153.91848147\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' )');
    });

    /**
     * Tests combination of multiple attribute filters and tectonic unit filter with narrowers
     */
    it('FilterByAttribute with multiple Attributes and FilterByTecnoTerms with 1 Value with narrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' },
                    { key: 'Shape_Area', value: '3222452787.5111227' }
                ],
                filterByTectoUnitsTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/SouthGermanPlatform',
                        narrowers: [
                            'https://dev-lexic.swissgeol.ch/TectonicUnits/SouthGermanPlatform'
                        ],
                        includeNarrowers: true
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Shape_Area" = \'3222452787.5111227\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/SouthGermanPlatform\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/SouthGermanPlatform\' )');
    });

    /**
     * Tests tectonic unit filter with explicit queryNarrower for hierarchical term retrieval
     */
    it('FilterByTecnoTerms with explicit queryNarrower', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByTectoUnitsTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau',
                        includeNarrowers: true,
                        narrowers: [
                            'https://dev-lexic.swissgeol.ch/TectonicUnits/SilberenSlices',
                            'https://dev-lexic.swissgeol.ch/TectonicUnits/MonteRosaNappe'
                        ]
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'TectonicUnits',
                    queryNarrower: 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX ex: <https://dev-lexic.swissgeol.ch/TectonicUnits/>\n\nSELECT ?concept\n\nWHERE { \nex:${term} skos:narrower+ ?concept.\n}',
                    attributeToFilter: ['Tecto_lexic', 'tecto_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:( "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/SilberenSlices\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/MonteRosaNappe\' ) OR "tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/SilberenSlices\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/MonteRosaNappe\' ) )');
    });

    /**
     * Tests for chronostratigraphic age filters
     * These filters control the age-based filtering of geological features
     */
    describe('FilterChronostratigraphyAge', () => {
        /**
         * Tests the "old" (older than) filter type with specific terms
         */
        it('Type "old" with olderTerms', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterChronostratigraphyAge: [
                        {
                            type: 'old',
                            olderTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic', 'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Triassic']
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterChronostratigraphyAge: {
                        columnToFilterOld: 'Chrono_from_lexic',
                        columnToFilterYon: 'Chrono_to_lexic',
                        queryYounger_strict: 'some_query',
                        queryOlder_strict: 'some_query',
                        queryBetween_strict: 'some_query'
                    }
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Chrono_from_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' , \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Triassic\' )');
        });

        /**
         * Tests the "yon" (younger than) filter type with specific terms
         */
        it('Type "yon" with youngerTerms', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterChronostratigraphyAge: [
                        {
                            type: 'yon',
                            youngerTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Quaternary', 'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Neogene']
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterChronostratigraphyAge: {
                        columnToFilterOld: 'Chrono_from_lexic',
                        columnToFilterYon: 'Chrono_to_lexic',
                        queryYounger_strict: 'some_query',
                        queryOlder_strict: 'some_query',
                        queryBetween_strict: 'some_query'
                    }
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Chrono_to_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Quaternary\' , \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Neogene\' )');
        });

        /**
         * Tests the "bet" (between) filter type with specific terms
         * This filter selects features with age ranges that include the specified terms
         */
        it('Type "bet" with betweenTerms', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterChronostratigraphyAge: [
                        {
                            type: 'bet',
                            betweenTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic', 'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Cretaceous']
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterChronostratigraphyAge: {
                        columnToFilterOld: 'Chrono_from_lexic',
                        columnToFilterYon: 'Chrono_to_lexic',
                        queryYounger_strict: 'some_query',
                        queryOlder_strict: 'some_query',
                        queryBetween_strict: 'some_query'
                    }
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:( "Chrono_from_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' , \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Cretaceous\' ) AND "Chrono_to_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' , \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Cretaceous\' ) )');
        });

        /**
         * Tests the "old" filter type with an empty array, which should produce a special 'empty' value
         */
        it('Type "old" with empty olderTerms array', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterChronostratigraphyAge: [
                        {
                            type: 'old',
                            olderTerms: []
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterChronostratigraphyAge: {
                        columnToFilterOld: 'Chrono_from_lexic',
                        columnToFilterYon: 'Chrono_to_lexic',
                        queryYounger_strict: 'some_query',
                        queryOlder_strict: 'some_query',
                        queryBetween_strict: 'some_query'
                    }
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Chrono_from_lexic" IN ( \'empty\' )');
        });

        /**
         * Tests the "yon" filter type with an empty array, which should produce a special 'empty' value
         */
        it('Type "yon" with empty youngerTerms array', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterChronostratigraphyAge: [
                        {
                            type: 'yon',
                            youngerTerms: []
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterChronostratigraphyAge: {
                        columnToFilterOld: 'Chrono_from_lexic',
                        columnToFilterYon: 'Chrono_to_lexic',
                        queryYounger_strict: 'some_query',
                        queryOlder_strict: 'some_query',
                        queryBetween_strict: 'some_query'
                    }
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Chrono_to_lexic" IN ( \'empty\' )');
        });

        /**
         * Tests the "bet" filter type with an empty array, which should produce special 'empty' values
         * in both the from and to columns
         */
        it('Type "bet" with empty betweenTerms array', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterChronostratigraphyAge: [
                        {
                            type: 'bet',
                            betweenTerms: []
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterChronostratigraphyAge: {
                        columnToFilterOld: 'Chrono_from_lexic',
                        columnToFilterYon: 'Chrono_to_lexic',
                        queryYounger_strict: 'some_query',
                        queryOlder_strict: 'some_query',
                        queryBetween_strict: 'some_query'
                    }
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:( "Chrono_from_lexic" IN ( \'empty\' ) AND "Chrono_to_lexic" IN ( \'empty\' ) )');
        });
    });

    /**
     * Tests combination of attribute and chronostratigraphy filters
     */
    it('Combination of Attribute and ChronostratigraphyAge filters', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ],
                filterChronostratigraphyAge: [
                    {
                        type: 'old',
                        olderTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic']
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterChronostratigraphyAge: {
                    columnToFilterOld: 'Chrono_from_lexic',
                    columnToFilterYon: 'Chrono_to_lexic',
                    queryYounger_strict: 'some_query',
                    queryOlder_strict: 'some_query',
                    queryBetween_strict: 'some_query'
                }
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Chrono_from_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' )');
    });

    /**
     * Tests combination of all filter types: attribute, tectonic unit, and chronostratigraphy
     */
    it('Combination of all filter types: Attribute, TectonicUnit and ChronostratigraphyAge', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ],
                filterByTectoUnitsTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau',
                        includeNarrowers: false
                    }
                ],
                filterChronostratigraphyAge: [
                    {
                        type: 'old',
                        olderTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic']
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
                filterChronostratigraphyAge: {
                    columnToFilterOld: 'Chrono_from_lexic',
                    columnToFilterYon: 'Chrono_to_lexic',
                    queryYounger_strict: 'some_query',
                    queryOlder_strict: 'some_query',
                    queryBetween_strict: 'some_query'
                }
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' ) AND "Chrono_from_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' )');
    });

    /**
     * Tests multiple chronostratigraphy age filters applied simultaneously
     */
    it('Multiple ChronostratigraphyAge filters', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterChronostratigraphyAge: [
                    {
                        type: 'old',
                        olderTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic']
                    },
                    {
                        type: 'yon',
                        youngerTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Cretaceous']
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterChronostratigraphyAge: {
                    columnToFilterOld: 'Chrono_from_lexic',
                    columnToFilterYon: 'Chrono_to_lexic',
                    queryYounger_strict: 'some_query',
                    queryOlder_strict: 'some_query',
                    queryBetween_strict: 'some_query'
                }
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:( "Chrono_from_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' ) AND "Chrono_to_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Cretaceous\' ) )');
    });

    /**
     * Tests for lithostratigraphic filters
     * These filters control the rock unit-based filtering of geological features
     */
    describe('FilterByLithostratigraphyTerm', () => {
        /**
         * Tests filtering by a lithostratigraphic term without narrowers
         */
        it('FilterByLithostratigraphyTerm with 1 Value without narrower', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterByLithostratigraphyTerm: [
                        { term: 'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup', includeNarrowers: false }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterConfigurationByLithostratigraphyTerm: {
                        idVocabulary: 'Lithostratigraphy',
                        queryNarrower: '',
                        attributeToFilter: ['Litho_lexic']
                    },
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' )');
        });

        /**
         * Tests filtering by a lithostratigraphic term with narrowers (subordinate rock units)
         */
        it('FilterByLithostratigraphyTerm with 1 Value with narrower', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterByLithostratigraphyTerm: [
                        {
                            term: 'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup',
                            narrowers: [
                                'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse',
                                'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperFreshwaterMolasse'
                            ],
                            includeNarrowers: true
                        }
                    ]
                },
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterConfigurationByLithostratigraphyTerm: {
                        idVocabulary: 'Lithostratigraphy',
                        queryNarrower: '',
                        attributeToFilter: ['Litho_lexic']
                    },
                },
                label: 'layer',
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' , \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse\' , \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperFreshwaterMolasse\' )');
        });

        /**
         * Tests filtering by a lithostratigraphic term with multiple columns
         * This allows searching for the term in different attribute columns
         */
        it('FilterByLithostratigraphyTerm with multiple columns', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterByLithostratigraphyTerm: [
                        {
                            term: 'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup',
                            narrowers: [
                                'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse'
                            ],
                            includeNarrowers: true
                        }
                    ]
                },
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterConfigurationByLithostratigraphyTerm: {
                        idVocabulary: 'Lithostratigraphy',
                        queryNarrower: '',
                        attributeToFilter: ['Litho_lexic', 'litho_lexic']
                    },
                },
                label: 'layer',
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:( "Litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' , \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse\' ) OR "litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' , \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse\' ) )');
        });

        /**
         * Tests filtering by a lithostratigraphic term with explicit queryNarrower definition
         * This allows retrieving subordinate units using a SPARQL query
         */
        it('FilterByLithostratigraphyTerm with explicit queryNarrower', () => {
            const layer: Layer = {
                id: 'Tecto_Units_augm_filtered',
                filters: {
                    filterByLithostratigraphyTerm: [
                        {
                            term: 'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup',
                            includeNarrowers: true,
                            narrowers: [
                                'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse',
                                'https://dev-lexic.swissgeol.ch/Lithostratigraphy/LowerFreshwaterMolasse'
                            ]
                        }
                    ]
                },
                label: 'layer',
                filterConfiguration: {
                    layerName: 'Tecto_Units_augm_filtered',
                    filterConfigurationByLithostratigraphyTerm: {
                        idVocabulary: 'Lithostratigraphy',
                        queryNarrower: 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX ex: <https://dev-lexic.swissgeol.ch/Lithostratigraphy/>\n\nSELECT ?concept\n\nWHERE { \nex:${term} skos:narrower+ ?concept.\n}',
                        attributeToFilter: ['Litho_lexic']
                    },
                },
                isChecked: false,
                canFilter: false,
                canGetFeatureInfo: false
            };

            const queryString = createQueryString(layer);
            expect(queryString).toBe('Tecto_Units_augm_filtered:"Litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' , \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/UpperMarineMolasse\' , \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/LowerFreshwaterMolasse\' )');
        });
    });

    /**
     * Tests combination of attribute and lithostratigraphy filters
     */
    it('Combination of FilterByAttribute and FilterByLithostratigraphyTerm', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ],
                filterByLithostratigraphyTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup',
                        includeNarrowers: false
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByLithostratigraphyTerm: {
                    idVocabulary: 'Lithostratigraphy',
                    queryNarrower: '',
                    attributeToFilter: ['Litho_lexic']
                },
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' )');
    });

    /**
     * Tests combination of all filter types including lithostratigraphy
     * This is the most complex test case combining all possible filter types
     */
    it('Combination of all filter types including Lithostratigraphy', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ],
                filterByTectoUnitsTerm: [
                    { 
                        term: 'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau',
                        includeNarrowers: false 
                    }
                ],
                filterByLithostratigraphyTerm: [
                    {
                        term: 'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup',
                        includeNarrowers: false
                    }
                ],
                filterChronostratigraphyAge: [
                    {
                        type: 'old',
                        olderTerms: ['https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic']
                    }
                ]
            },
            label: 'layer',
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: {
                    idVocabulary: 'Tecto',
                    queryNarrower: '',
                    attributeToFilter: ['Tecto_lexic']
                },
                filterConfigurationByLithostratigraphyTerm: {
                    idVocabulary: 'Lithostratigraphy',
                    queryNarrower: '',
                    attributeToFilter: ['Litho_lexic']
                },
                filterChronostratigraphyAge: {
                    columnToFilterOld: 'Chrono_from_lexic',
                    columnToFilterYon: 'Chrono_to_lexic',
                    queryYounger_strict: 'some_query',
                    queryOlder_strict: 'some_query',
                    queryBetween_strict: 'some_query'
                }
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' ) AND "Chrono_from_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Chronostratigraphy/Jurassic\' ) AND "Litho_lexic" IN ( \'https://dev-lexic.swissgeol.ch/Lithostratigraphy/MolasseGroup\' )');
    });
});
