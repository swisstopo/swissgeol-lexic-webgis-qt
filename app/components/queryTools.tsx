import React, { useEffect, useState } from 'react';
import "../css/styleQueryTools.css";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addFilter, Layer, removeFilter, toggleFilter } from '../slice/layerMenuSlice';

//gluestack
import { AddIcon, Card, ChevronDownIcon, Icon, Text, Input, InputField, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger, TrashIcon, CircleIcon, Badge, BadgeText, BadgeIcon, CloseIcon, Box, Tooltip, InfoIcon, TooltipContent, TooltipText } from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonIcon, ButtonSpinner, ButtonGroup } from '@gluestack-ui/themed';
/* import { Select } from '@gluestack-ui/themed'; */
import { findLayerById } from '../utilities/LayerMenuUtilities';
import { FiltersType, FilterOptionChronostratigraphy } from '../enum/filterTypeEnum';
import { RadioGroup } from '@gluestack-ui/themed';
import { HStack } from '@gluestack-ui/themed';
import { Radio } from '@gluestack-ui/themed';
import { RadioIndicator } from '@gluestack-ui/themed';
import { RadioIcon } from '@gluestack-ui/themed';
import { RadioLabel } from '@gluestack-ui/themed';
import { Checkbox } from '@gluestack-ui/themed';
import { CheckboxIndicator } from '@gluestack-ui/themed';
import { CheckboxIcon } from '@gluestack-ui/themed';
import { CheckIcon } from '@gluestack-ui/themed';
import { CheckboxLabel } from '@gluestack-ui/themed';
import Select from 'react-select';

interface QueryToolsProps {
    cache: { [key: string]: { label: string; value: string }[] };
}

/**
 * QueryTool deals with rendering a panel that allows you to enter parameters to filter the 
 * BY ATTRIBUTE, CHRONOSTRATIGRAPHY AGE, and LITHOSTRATIGRAPHY TERM layers
 */
const QueryTools: React.FC<QueryToolsProps> = ({ cache }) => {
    /**
    * iconFilterLayerId:
    * sets the variable that will be read by the treeview and treenodes to render the correct filter icon.
    * icon that changes in case there are active filters.
    */
    const iconFilterLayerId = useSelector((state: RootState) => state.layerMenuSlice.iconFilterLayers);
    const layers = useSelector((state: RootState) => state.layerMenuSlice.layers);
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState<string>('');
    const [inputValue, setInputValue] = useState('');
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const currentLayer = findLayerById(layers, selectedLayerId || '');
    const tecto = cache['TectonicUnits'] || [];
    const chronostratigraphy = cache['Chronostratigraphy'] || [];
    const [filterOption, setFilterOption] = useState("bet");
    const [selectedTectonicUnitTerm, setSelectedTectonicUnitTerm] = useState<string>('');
    const [includeNarrowers, setIncludeNarrowers] = useState<boolean>(true);
    const [selectedOlderTermChronos, setSelectedOlderTermChronos] = useState('');
    const [selectedYoungerTermChronos, setSelectedYoungerTermChronos] = useState('');
    const [selectedTermChronos, setSelectedTermChronos] = useState('');

    const handleChange = (isChecked: boolean) => {
        setIncludeNarrowers(isChecked);
    };
    // Function to extract label from a term
    const extractLabel = (term: string) => {
        const parts = term.split('#');
        if (parts.length > 1) {
            return parts[1];
        } else {
            return term;
        }
    };
    // Function for set value of filterOption
    const handleRadioChange = (value: React.SetStateAction<string>) => {
        setFilterOption(value);
    };
    /**
    * Update filter icon if osno stait insert filters.
    * @param {string} selectedLayerId selected layerid.
    */
    useEffect(() => {
        if (iconFilterLayerId && iconFilterLayerId !== selectedLayerId) {
            setSelectedLayerId(iconFilterLayerId);
        }
    }, [iconFilterLayerId, selectedLayerId]);

    /**
     * Function for close the component.
     */
    const handleClose = () => {
        dispatch(toggleFilter(undefined));
        setSelectedLayerId(null);
    };
    /**
    * Does not render the component in the case where there is no layer or the layer is not filterable 
    * Returns null because it should not renbderize the component.
    */
    if (!currentLayer || !currentLayer.isChecked) {
        return null;
    }
    /**
     * Adds a filter to a specified layer and updates the state in Redux.
     * This function handles two types of filters based on the provided `filterType`:
     * 
     * - **FilterByAttribute**: If the `filterType` is `FilterByAttribute`, and the required parameters (`selectedFilter`, `inputValue`, `selectedLayerId`) are provided,
     *   it constructs a filter object with the attribute and value, then dispatches an action to add this filter to the Redux state.
     * 
     * - **FilterByTectoUnitsTerm**: If the `filterType` is `FilterByTectoUnitsTerm`, and the `selectedTectonicUnitTerm` and `selectedLayerId` are provided,
     *   it prepares a query using the tectonic unit term and optionally fetches additional data if `includeNarrowers` is true. The fetched data is then used to
     *   construct a filter object which is dispatched to the Redux state. If no additional data is needed, it dispatches the filter directly.
     * 
     * The `filterType` determines which type of filter is applied and how the filter data is processed.
     * 
     * @param {FiltersType} filterType - The type of filter to add (`FilterByAttribute` or `FilterByTectoUnitsTerm`).
     */
    const handleAddFilter = (filterType: FiltersType) => {
        console.log('Adding filter:', { selectedFilter, inputValue, selectedLayerId, selectedTectonicUnitTerm, includeNarrowers, selectedOlderTermChronos, selectedTermChronos, selectedYoungerTermChronos });

        if (filterType === FiltersType.FilterByAttribute && selectedFilter && inputValue && selectedLayerId) {
            const filter = {
                filterByAttribute: [{ key: selectedFilter, value: inputValue }]
            };
            console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByAttribute' });
            dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByAttribute }));
        }

        if (filterType === FiltersType.FilterByTectoUnitsTerm && selectedTectonicUnitTerm && selectedLayerId) {
            const vocab = currentLayer.filterConfiguration?.filterConfigurationByTectoUnitsTerm;
            const formattedTerm = selectedTectonicUnitTerm.replace('#', '/').split('/').pop() || '';
            const query = vocab?.queryNarrower.replace('${term}', formattedTerm);
            console.log(query)
            if (vocab) {
                if (includeNarrowers) {
                    fetch(`/api/graphDb?vocabulary=${vocab.idVocabulary}`,
                        {
                            method: "POST",
                            body: query
                        }
                    )
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Fetched data:', data);
                            let narrowers: string[] = data;
                            const filter = {
                                filterByTectoUnitsTerm: [{ term: selectedTectonicUnitTerm, includeNarrowers, narrowers: narrowers }]
                            };

                            console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByTectoUnitsTerm' });
                            dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByTectoUnitsTerm }));
                        })
                        .catch(error => {
                            console.error('Failed to fetch data from GraphDB:', error);
                        });
                } else {
                    const filter = {
                        filterByTectoUnitsTerm: [{ term: selectedTectonicUnitTerm, includeNarrowers }]
                    };
                    console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByTectoUnitsTerm' });
                    dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByTectoUnitsTerm }));
                }
            }
        }

        if (filterType === FiltersType.FilterByChronostratigraphy && selectedLayerId) {
            if (filterOption == FilterOptionChronostratigraphy.Younger) {
                const vocab = currentLayer.filterConfiguration?.filterChronostratigraphyAge;
                const formattedTerm = selectedTermChronos.replace('#', '/').split('/').pop() || '';
                const query = vocab?.queryYouger_strict.replace('${term}', formattedTerm);
                console.log(query)
                fetch(`/api/graphDb?vocabulary=Chronostratigraphy`,
                    {
                        method: "POST",
                        body: query
                    }
                )
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Fetched data:', data);
                        let yongerTerms: string[] = data;
                        const filter = {
                            filterChronostratigraphyAge: [{ type: FilterOptionChronostratigraphy.Younger, idYounger: selectedTermChronos, youngerTerms: yongerTerms }]
                        };
                        console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByChronostratigraphy' });
                        dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByChronostratigraphy }));
                    })
                    .catch(error => {
                        console.error('Failed to fetch data from GraphDB:', error);
                    });
            }
            if (filterOption == FilterOptionChronostratigraphy.Between) {
                const vocab = currentLayer.filterConfiguration?.filterChronostratigraphyAge;
                const formattedTermOlder = selectedOlderTermChronos.replace('#', '/').split('/').pop() || '';
                const formattedTermYounger = selectedYoungerTermChronos.split('/').pop() || '';
                const query = vocab?.queryBetween_stricty
                    .replace('${termOlder}', formattedTermOlder)
                    .replace('${termYounger}', formattedTermYounger);
                console.log(query)
                fetch(`/api/graphDb?vocabulary=Chronostratigraphy`,
                    {
                        method: "POST",
                        body: query
                    }
                )
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Fetched data:', data);
                        let betweenTerms: string[] = data;
                        const filter = {
                            filterChronostratigraphyAge: [{ type: FilterOptionChronostratigraphy.Between, idYounger: selectedYoungerTermChronos, idOlder: selectedOlderTermChronos, betweenTerms: betweenTerms }]
                        };
                        console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByChronostratigraphy' });
                        dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByChronostratigraphy }));
                    })
                    .catch(error => {
                        console.error('Failed to fetch data from GraphDB:', error);
                    });

            }
            if (filterOption == FilterOptionChronostratigraphy.Older) {
                const vocab = currentLayer.filterConfiguration?.filterChronostratigraphyAge;
                const formattedTerm = selectedTermChronos.replace('#', '/').split('/').pop() || '';
                const query = vocab?.queryOlder_strict.replace('${term}', formattedTerm);
                console.log(query)
                fetch(`/api/graphDb?vocabulary=Chronostratigraphy`,
                    {
                        method: "POST",
                        body: query
                    }
                )
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Fetched data:', data);
                        let olderTerms: string[] = data;
                        const filter = {
                            filterChronostratigraphyAge: [{ type: FilterOptionChronostratigraphy.Older, idOlder: selectedTermChronos, olderTerms: olderTerms }]
                        };
                        console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByChronostratigraphy' });
                        dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByChronostratigraphy }));
                    })
                    .catch(error => {
                        console.error('Failed to fetch data from GraphDB:', error);
                    });
            }
        }
    };
    /**
    * Removes a filter to the layer by updating the state in redux.
    * slice: layerMenuSlice
    */
    const handleRemoveFilter = (
        layerId: string,
        filterKey?: string,
        filterType?: FiltersType,
        type?: string,
        idYounger?: string,
        idOlder?: string,
    ) => {
        console.log('sto mandando allo slice i seguenti parametri:', { layerId, filterKey, idYounger, idOlder, filterType, type });
        dispatch(removeFilter({ layerId, filterKey, idYounger, idOlder, filterType, type }));
    };


    //for take the vocabulary labal for terms
    const getVocabularyLabel = (processedValue: string) => {
        for (const [key, vocabularyItems] of Object.entries(cache)) {
            const vocabularyItem = vocabularyItems.find((item: { value: string; }) => item.value === processedValue);
            if (vocabularyItem) {
                return vocabularyItem.label;
            }
        }
        return '';
    };
    /**
    * Renders the list of filters applied to the layer or shows 'no filter selected...' if there are no filters applied.
    * 
    * @param layer the layer on which to create the list of filters. 
    * @param filtersType type of filter. 
    * @returns the list of applied filters.
    */
    const renderFilterList = (layer: Layer, filtersType: FiltersType): JSX.Element[] => {
        const filterList: JSX.Element[] = [];

        if (layer.filters && layer.filterConfiguration) {
            const { filters, filterConfiguration } = layer;

            switch (filtersType) {
                case FiltersType.FilterByAttribute:
                    console.log(filters.filterByAttribute);
                    if (filters.filterByAttribute && filters.filterByAttribute.length > 0) {
                        filters.filterByAttribute.forEach((filter, index) => {
                            const { key, value } = filter;

                            let label = key;

                            filterList.push(
                                <div className='flex containerFilter' key={index}>
                                    <div className='flex justify_between divFilter'>
                                        <div>
                                            <p className='fontSize_0_8rem text_center'>{label}:</p>
                                        </div>
                                        <div>
                                            <p className='fontSize_0_8rem text_center'>{value}</p>
                                        </div>
                                        <div className='' onClick={() => handleRemoveFilter(layer.id, key, FiltersType.FilterByAttribute)}>
                                            <Icon as={TrashIcon} m="$2" w="$4" h="$4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    }
                    break;
                case FiltersType.FilterByTectoUnitsTerm:
                    console.log(filters.filterByTectoUnitsTerm);
                    if (filters.filterByTectoUnitsTerm && filters.filterByTectoUnitsTerm.length > 0) {
                        filters.filterByTectoUnitsTerm.forEach((filter, index) => {
                            const { term, includeNarrowers, narrowers } = filter;
                            const label = getVocabularyLabel(term);

                            if (label) {
                                filterList.push(
                                    <div className='flex containerFilter' key={index}>
                                        <div className='flex justify_between divFilter'>
                                            <div>
                                                <p className='fontSize_0_8rem text_center'>{label}</p>
                                            </div>
                                            <div>
                                                <p className='fontSize_0_8rem text_center'>{includeNarrowers}</p>
                                            </div>
                                            {includeNarrowers && (
                                                <div>
                                                    <Badge size="md" variant="solid" action="success" rounded={'$full'}>
                                                        <BadgeText>N</BadgeText>
                                                        {/* <BadgeIcon as={CheckIcon} ml={2} /> */}
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className='' onClick={() => handleRemoveFilter(layer.id, term, FiltersType.FilterByTectoUnitsTerm)}>
                                                <Icon as={TrashIcon} m="$2" w="$4" h="$4" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                console.error('Etichetta non trovata per la chiave:', term);
                            }
                        });
                    }
                    break;
                case FiltersType.FilterByChronostratigraphy:
                    console.log(filters.filterChronostratigraphyAge);
                    if (filters.filterChronostratigraphyAge && filters.filterChronostratigraphyAge.length > 0) {
                        filters.filterChronostratigraphyAge.forEach((filter, index) => {
                            const { idYounger, idOlder, type } = filter;
                            const labelYounger = idYounger !== undefined ? getVocabularyLabel(idYounger) : null;
                            const labelOlder = idOlder !== undefined ? getVocabularyLabel(idOlder) : null;

                            if (labelYounger || labelOlder) {
                                let displayText = '';

                                if (labelOlder && labelYounger) {
                                    displayText = `From ${labelOlder} To ${labelYounger}`;
                                } else {
                                    if (labelOlder) {
                                        displayText += `Older than: ${labelOlder}`;
                                    }

                                    if (labelYounger) {
                                        if (displayText) {
                                            displayText += ' - ';
                                        }
                                        displayText += `Younger than: ${labelYounger}`;
                                    }
                                }

                                filterList.push(
                                    <div className='flex containerFilter' key={index}>
                                        <div className='flex justify_between divFilter'>
                                            <div>
                                                <p className='fontSize_0_8rem text_center'>{displayText}</p>
                                            </div>
                                            <div className='' onClick={() => {
                                                handleRemoveFilter(layer.id, undefined, FiltersType.FilterByChronostratigraphy, type, idYounger, idOlder);
                                            }}>
                                                <Icon as={TrashIcon} m="$2" w="$4" h="$4" />
                                            </div>
                                        </div>
                                    </div >
                                );

                            } else {
                                console.log('Filtro non valido, manca idYounger o idOlder:', filter);
                            }
                        });
                    }
                    break;
                default:
                    break;
            }
        }

        if (filterList.length == 0) {
            filterList.push(
                <div className='flex containerFilter'>
                    <div className='flex justify_between divFilter'>
                        <div>
                            <p className='fontSize_0_8rem text_center'>No filter selected ...</p>
                        </div>
                    </div>
                </div>
            );
        }

        return filterList;
    };

    const excludeColumns = [
        ...(currentLayer?.filterConfiguration?.filterConfigurationByTectoUnitsTerm?.attributeToFilter || []),
        currentLayer?.filterConfiguration?.filterChronostratigraphyAge?.columnToFilterOld,
        currentLayer?.filterConfiguration?.filterChronostratigraphyAge?.columnToFilterYon
    ]
    const attributeOptions = currentLayer.attributesConfiguration?.attributes?.map(attr => ({
        value: attr,
        label: currentLayer.attributesConfiguration?.attributeOverrides?.[attr]?.column || attr
    })) || [];
    const filteredAttributeOptions = attributeOptions.filter(option => !excludeColumns.includes(option.value));
    const optionsTectounits = [...tecto].sort((a, b) => a.label.localeCompare(b.label));
    const chronostratigraphyOptions = [...chronostratigraphy]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(term => ({
            value: term.value, label: term.label
        }));

    return (
        <form >
            <div id='containerQueryTools' className="bgGrey textBlack">
                <div>
                    <div className='flex justify_between'>
                        <p className='fontSize_1_5rem font_bold'>Search box</p>
                        <Button
                            size="sm"
                            variant="link"
                            action="primary"
                            isDisabled={false}
                            isFocusVisible={false}
                            onPress={handleClose}
                        >
                            <ButtonIcon as={CloseIcon} />
                        </Button>
                    </div>
                    <p className='fontSize_0_7rem '>Selected layer: {currentLayer.label}</p>
                    <Box mt={10}>
                        <Text fontWeight='$semibold' italic fontSize={11}>"The Search Box lets you filter map territories by specific attributes or terms for Chronostratigraphy and Tectonic Units.{'\n'}Features in whitch filters are met for all attributes and vocabulary terms simultaneously will be highlighted."</Text>
                    </Box>
                </div>
                {/* FILTER BY ATTRIBUTE */}
                <div className='mTop4'>
                    <Card>
                        <Box flex={1}>
                            <Box flexDirection='row'>
                                <p className='fontSize_1rem font_bold mButtom2'>Filter by Attribute </p>
                                <Tooltip
                                    placement="top left"
                                    trigger={(triggerProps) => {
                                        return (
                                            <Box {...triggerProps}>
                                                <Icon as={InfoIcon} ml={2} w="$3" h="$3" />
                                            </Box>

                                        )
                                    }}
                                >
                                    <TooltipContent>
                                        <TooltipText fontSize={12}>Filter by Attribute</TooltipText>
                                    </TooltipContent>
                                </Tooltip>
                            </Box>
                            <Text fontWeight='$semibold' italic fontSize={11}>"Filter by values ​​and by attributes of all features"</Text>
                        </Box>
                        <div className='mTop4'>
                            {currentLayer && renderFilterList(currentLayer, FiltersType.FilterByAttribute)}
                        </div>
                        <div className='flex mTop4 w100 justify_between'>
                            <div className='w65'>
                                <div>
                                    <Text fontWeight='$semibold' fontSize={13}>Attribute:</Text>
                                    <Select
                                        value={filteredAttributeOptions.find(option => option.value === selectedFilter)}
                                        onChange={(selectedOption) => setSelectedFilter(selectedOption ? selectedOption.value : '')}
                                        options={filteredAttributeOptions}
                                        placeholder="Select Attribute"
                                        isSearchable={true}
                                        classNamePrefix="react-select"
                                        menuPortalTarget={document.body}
                                        maxMenuHeight={240}
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                color: 'black',
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                fontSize: '12px',
                                                color: 'black',
                                            }),
                                            option: (provided) => ({
                                                ...provided,
                                                fontSize: '12px',
                                                color: 'black',
                                            }),
                                        }}
                                    />
                                </div>
                                <div className='mTop4'>
                                    <Text fontWeight='$semibold' fontSize={13}>Value:</Text>
                                    <Input variant="rounded" size="sm" >
                                        <InputField
                                            placeholder='Enter value...'
                                            value={inputValue || ''}
                                            onChange={(e) => setInputValue(e.nativeEvent.text)}
                                        />
                                    </Input>
                                </div>
                            </div>
                            <div className='p8'>
                                <Button size="xs" variant="solid" bg="$backgroundLight400" action="primary" isDisabled={false} isFocusVisible={false} onPress={() => handleAddFilter(FiltersType.FilterByAttribute)} style={{ width: 70, height: 50, borderRadius: 15, }}>
                                    <ButtonText>Add </ButtonText>
                                    <ButtonIcon as={AddIcon} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* FILTER BY CHRONOSTRATIGRAPHY AGE */}
                {
                    currentLayer.filterConfiguration?.filterChronostratigraphyAge &&
                    <>
                        <Box w={'100%'} mt={'2%'} alignItems='center'>
                            <Text mb={0} fontSize={12} textAlign='center'>AND</Text>
                        </Box>
                        <div className='mTop2'>
                            <Card>
                                <Box flex={1} mb={'2%'}>
                                    <Box flexDirection='row'>
                                        <p className='fontSize_1rem font_bold mButtom2'>Filter by Chronostratigraphy Age </p>
                                        <Tooltip
                                            placement="top left"
                                            trigger={(triggerProps) => {
                                                return (
                                                    <Box {...triggerProps}>
                                                        <Icon as={InfoIcon} ml={2} w="$3" h="$3" />
                                                    </Box>

                                                )
                                            }}
                                        >
                                            <TooltipContent>
                                                <TooltipText fontSize={12}>Filter by Chronostratigraphy Age</TooltipText>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Box>
                                    <Text fontWeight='$semibold' italic fontSize={11}>"Filter by a Chronostratigraphy term."</Text>
                                </Box>
                                <Text italic fontSize={10}>(*) Broader terms are excluded from query results if they are not strictly included into interval</Text>
                                <div className='mTop4'>
                                    {currentLayer && renderFilterList(currentLayer, FiltersType.FilterByChronostratigraphy)}
                                </div>
                                <div className='mTop4'>
                                    <RadioGroup value={filterOption} onChange={handleRadioChange}>
                                        <HStack space="sm">
                                            <Radio value={FilterOptionChronostratigraphy.Younger} size="sm">
                                                <RadioIndicator mr="$2">
                                                    <RadioIcon as={CircleIcon} />
                                                </RadioIndicator>
                                                <RadioLabel>Younger <Tooltip
                                                    placement="top left"
                                                    trigger={(triggerProps) => {
                                                        return (
                                                            <Box {...triggerProps}>
                                                                <Icon as={InfoIcon} w="$3" h="$3" />
                                                            </Box>

                                                        )
                                                    }}
                                                >
                                                    <TooltipContent>
                                                        <TooltipText fontSize={12}>Returns all terms in the hierarchy younger than the provided term</TooltipText>
                                                    </TooltipContent>
                                                </Tooltip></RadioLabel>

                                            </Radio>
                                            <Radio value={FilterOptionChronostratigraphy.Between} size="sm">
                                                <RadioIndicator mr="$2">
                                                    <RadioIcon as={CircleIcon} />
                                                </RadioIndicator>
                                                <RadioLabel>From/To <Tooltip
                                                    placement="top left"
                                                    trigger={(triggerProps) => {
                                                        return (
                                                            <Box {...triggerProps}>
                                                                <Icon as={InfoIcon} w="$3" h="$3" />
                                                            </Box>

                                                        )
                                                    }}
                                                >
                                                    <TooltipContent>
                                                        <TooltipText fontSize={12}>Returns all terms in the hierarchy older than from and younger than to</TooltipText>
                                                    </TooltipContent>
                                                </Tooltip></RadioLabel>
                                            </Radio>
                                            <Radio value={FilterOptionChronostratigraphy.Older} size="sm">
                                                <RadioIndicator mr="$2">
                                                    <RadioIcon as={CircleIcon} />
                                                </RadioIndicator>
                                                <RadioLabel>Older <Tooltip
                                                    placement="top left"
                                                    trigger={(triggerProps) => {
                                                        return (
                                                            <Box {...triggerProps}>
                                                                <Icon as={InfoIcon} w="$3" h="$3" />
                                                            </Box>

                                                        )
                                                    }}
                                                >
                                                    <TooltipContent>
                                                        <TooltipText fontSize={12}>Returns all terms in the hierarchy older than the provided term</TooltipText>
                                                    </TooltipContent>
                                                </Tooltip></RadioLabel>

                                            </Radio>
                                        </HStack>
                                    </RadioGroup>
                                </div>

                                <div className='flex mTop4 w100 justify_between'>
                                    {filterOption === 'bet' && (
                                        <div className='w65'>
                                            <div>
                                                <Text fontWeight='$semibold' fontSize={13}>Older than (*):</Text>
                                                <Select
                                                    value={chronostratigraphyOptions.find(option => option.value === selectedOlderTermChronos)}
                                                    onChange={(selectedOption) => setSelectedOlderTermChronos(selectedOption ? selectedOption.value : '')}
                                                    options={chronostratigraphyOptions}
                                                    placeholder="Select start option"
                                                    isSearchable={true}
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                        }),
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Text fontWeight='$semibold' fontSize={13}>Younger than (*):</Text>
                                                <Select
                                                    value={chronostratigraphyOptions.find(option => option.value === selectedYoungerTermChronos)}
                                                    onChange={(selectedOption) => setSelectedYoungerTermChronos(selectedOption ? selectedOption.value : '')}
                                                    options={chronostratigraphyOptions}
                                                    placeholder="Select end option"
                                                    isSearchable={true}
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {filterOption !== 'bet' && (
                                        <div className='w65'>
                                            <div>
                                                <Text fontWeight='$semibold' fontSize={13}>{filterOption === 'old' ? 'Older than' : 'Younger than'} :</Text>
                                                <Select
                                                    value={chronostratigraphyOptions.find(option => option.value === selectedTermChronos)}
                                                    onChange={(selectedOption) => setSelectedTermChronos(selectedOption ? selectedOption.value : '')}
                                                    options={chronostratigraphyOptions}
                                                    placeholder={filterOption === 'old' ? 'Select end option' : 'Select end option'}
                                                    isSearchable={true}
                                                    classNamePrefix="react-select"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            fontSize: '12px',
                                                            color: 'black',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className='p8'>
                                        <Button ml={20} size="xs" variant="solid" bg="$backgroundLight400" action="primary" isDisabled={false} isFocusVisible={false} onPress={() => handleAddFilter(FiltersType.FilterByChronostratigraphy)} style={{ width: 70, height: 50, borderRadius: 15, }}>
                                            <ButtonText>Add </ButtonText>
                                            <ButtonIcon as={AddIcon} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div >
                    </>
                }


                {/* FILTER BY TECTO TERM */}
                {
                    currentLayer.filterConfiguration?.filterConfigurationByTectoUnitsTerm &&
                    <>
                        <Box w={'100%'} mt={'2%'}>
                            <Text mb={0} fontSize={12} textAlign='center'>AND</Text>
                        </Box>
                        <div className='mTop2'>
                            <Card>
                                <Box flex={1}>
                                    <Box flexDirection='row'>
                                        <p className='fontSize_1rem font_bold mButtom2'>Filter by Tectonic Units term</p>
                                        <Tooltip
                                            placement="top left"
                                            trigger={(triggerProps) => {
                                                return (
                                                    <Box {...triggerProps}>
                                                        <Icon as={InfoIcon} ml={2} w="$3" h="$3" />
                                                    </Box>

                                                )
                                            }}
                                        >
                                            <TooltipContent>
                                                <TooltipText fontSize={12}>Filter by Tectonic Units term</TooltipText>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Box>
                                    <Text fontWeight='$semibold' italic fontSize={11}>"Filter for Tectonic Units term and their narrowers"</Text>
                                </Box>
                                <div className='mTop4'>
                                    {currentLayer && renderFilterList(currentLayer, FiltersType.FilterByTectoUnitsTerm)}
                                </div>
                                <div className='flex mTop4 w100 justify_between'>
                                    <div className='w65'>
                                        <div>
                                            <Text fontWeight='$semibold' fontSize={13}>Term:</Text>
                                            <Select
                                                value={optionsTectounits.find(option => option.value === selectedTectonicUnitTerm)}
                                                onChange={(selectedOption) => setSelectedTectonicUnitTerm(selectedOption ? selectedOption.value : '')}
                                                options={optionsTectounits}
                                                placeholder="Select Tecto Term"
                                                isSearchable={true}
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                maxMenuHeight={240}
                                                menuPlacement='top'
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (provided) => ({
                                                        ...provided,
                                                        fontSize: '12px',
                                                        color: 'black',
                                                    }),
                                                    option: (provided) => ({
                                                        ...provided,
                                                        fontSize: '12px',
                                                        color: 'black',
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                    }),
                                                }}
                                            />
                                        </div>
                                        <div className='mTop4 mLeft5'>
                                            <Checkbox size="sm" isInvalid={false} isDisabled={false}
                                                value={includeNarrowers.toString()}
                                                isChecked={includeNarrowers}
                                                onChange={handleChange}>
                                                <CheckboxIndicator mr="$2">
                                                    <CheckboxIcon as={CheckIcon} />
                                                </CheckboxIndicator>
                                                <CheckboxLabel>Include Narrowers</CheckboxLabel>
                                            </Checkbox>
                                        </div>
                                    </div>
                                    <div className='p8'>
                                        <Button ml={20} size="xs" variant="solid" bg="$backgroundLight400" action="primary" isDisabled={false} isFocusVisible={false} onPress={() => handleAddFilter(FiltersType.FilterByTectoUnitsTerm)} style={{ width: 70, height: 50, borderRadius: 15, }}>
                                            <ButtonText>Add </ButtonText>
                                            <ButtonIcon as={AddIcon} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>

                }
            </div >
        </form >
    );
}

export default QueryTools;
