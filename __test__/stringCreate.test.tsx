import { createQueryString } from '../app/utilities/StringCreateFilter';
import { Layer } from '../app/slice/layerMenuSlice';

describe('String Create Query ', () => {
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

    it('FilterByAttribute con 1 Attributo', () => {
        const layer: Layer = {
            id: 'Tecto_Units_augm_filtered',
            filters: {
                filterByAttribute: [
                    { key: 'Origin_EN', value: 'European continental platform' }
                ]
            },
            filterConfiguration: {
                layerName: 'Tecto_Units_augm_filtered',
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            label: 'layer',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\'');
    });

    it('FilterByAttribute con + Attributi', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Litho_EN" = \'Molasse (Cenozoic)\' AND "Shape_Area" = \'159457153.91848147\'');
    });

    it('FilterByTecnoTerms con 1 Valore senza narrower', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' )');
    });

    it('FilterByTecnoTerms con 1 Valore con narrower', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            label: 'layer',
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/SilberenSlices\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/MonteRosaNappe\' )');
    });

    it('FilterByAttribute con 1 Attributo e FilterByTecnoTerms con 1 Valore senza narrower', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' )');
    });

    it('FilterByAttribute con 1 Attributo e FilterByTecnoTerms con 1 Valore con narrower', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/HauteSaonePlatform\' )');
    });

    it('FilterByAttribute con + Attributi e FilterByTecnoTerms con 1 Valore senza narrower', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Litho_EN" = \'Molasse (Cenozoic)\' AND "Shape_Area" = \'159457153.91848147\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/InternalFoldedJuraAndForelandPlateau\' )');
    });

    it('FilterByAttribute con + Attributi e FilterByTecnoTerms con 1 Valore con narrower', () => {
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
                filterConfigurationByTectoUnitsTerm: [
                    {
                        idVocabulary: 'Tecto',
                        queryNarrower: '',
                        attributeToFilter: ['Tecto_lexic']
                    }
                ],
            },
            isChecked: false,
            canFilter: false,
            canGetFeatureInfo: false
        };

        const queryString = createQueryString(layer);
        expect(queryString).toBe('Tecto_Units_augm_filtered:"Origin_EN" = \'European continental platform\' AND "Shape_Area" = \'3222452787.5111227\' AND "Tecto_lexic" IN ( \'https://dev-lexic.swissgeol.ch/TectonicUnits/SouthGermanPlatform\' , \'https://dev-lexic.swissgeol.ch/TectonicUnits/SouthGermanPlatform\' )');
    });
});
