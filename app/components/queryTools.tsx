import React, { useEffect, useState } from 'react';
import "../css/styleQueryTools.css";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addFilter, Layer, removeFilter, toggleFilter } from '../slice/layerMenuSlice';

//gluestack
import { AddIcon, Card, ChevronDownIcon, Icon, Input, InputField, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger, TrashIcon, CircleIcon, Badge, BadgeText, BadgeIcon, CloseIcon } from '@gluestack-ui/themed';
import { Switch } from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonIcon, ButtonSpinner, ButtonGroup } from '@gluestack-ui/themed';
/* import { Select } from '@gluestack-ui/themed'; */
import { findLayerById } from '../utilities/LayerMenuUtilities';
import { FiltersType } from '../enum/filterTypeEnum';
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
import { fetchVocabolaryTermByQuery } from '../libs/graphDbWrapper';
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
    const [selectedStartTermChronos, setSelectedStartTermChronos] = useState('');
    const [selectedEndTermChronos, setSelectedEndTermChronos] = useState('');
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
        console.log('Adding filter:', { selectedFilter, inputValue, selectedLayerId, selectedTectonicUnitTerm, includeNarrowers });

        if (filterType === FiltersType.FilterByAttribute && selectedFilter && inputValue && selectedLayerId) {
            const filter = {
                filterByAttribute: [{ key: selectedFilter, value: inputValue }]
            };
            console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByAttribute' });
            dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByAttribute }));
        }

        if (filterType === FiltersType.FilterByTectoUnitsTerm && selectedTectonicUnitTerm && selectedLayerId) {
            const vocab = currentLayer.filterConfiguration?.filterConfigurationByTectoUnitsTerm;
            const formattedTerm = selectedTectonicUnitTerm.split('/').pop() || '';
            const query = vocab?.queryNarrower.replace('${term}', formattedTerm);
            console.log('click on add button in query tool.');
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
    };
    /**
    * Removes a filter to the layer by updating the state in redux.
    * slice: layerMenuSlice
    */
    const handleRemoveFilter = (layerId: string, filterKey: string) => {
        dispatch(removeFilter({ layerId, filterKey }));
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
                                        <div className='' onClick={() => handleRemoveFilter(layer.id, key)}>
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
                                            <div className='' onClick={() => handleRemoveFilter(layer.id, term)}>
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

    const excludeColumns = currentLayer?.filterConfiguration?.filterConfigurationByTectoUnitsTerm
        ? currentLayer.filterConfiguration.filterConfigurationByTectoUnitsTerm.attributeToFilter || []
        : [];
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
                    <p className='fontSize_0_7rem'>Selected layer: {currentLayer.label}</p>
                </div>
                {/* FILTER BY ATTRIBUTE */}
                <div className='mTop8'>
                    <Card>
                        <p className='fontSize_1rem font_bold mButtom2'>Filter by Attribute</p>
                        <div className='mTop4'>
                            {currentLayer && renderFilterList(currentLayer, FiltersType.FilterByAttribute)}
                        </div>
                        <div className='flex mTop8 w100 justify_between'>
                            <div className='w65'>
                                <div>
                                    <Select
                                        value={attributeOptions.find(option => option.value === selectedFilter)}
                                        onChange={(selectedOption) => setSelectedFilter(selectedOption ? selectedOption.value : '')}
                                        options={attributeOptions}
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
                <div className='mTop8'>
                    <Card>
                        <p className='fontSize_1rem font_bold mButtom2'>Filter by Chronostratigraphy Age</p>
                        <div className='mTop5'>
                            <RadioGroup value={filterOption} onChange={handleRadioChange}>
                                <HStack space="sm">
                                    <Radio value="yon" size="sm">
                                        <RadioIndicator mr="$2">
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>Younger</RadioLabel>
                                    </Radio>
                                    <Radio value="bet" size="sm">
                                        <RadioIndicator mr="$2">
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>Between</RadioLabel>
                                    </Radio>
                                    <Radio value="old" size="sm">
                                        <RadioIndicator mr="$2">
                                            <RadioIcon as={CircleIcon} />
                                        </RadioIndicator>
                                        <RadioLabel>Older</RadioLabel>
                                    </Radio>
                                </HStack>
                            </RadioGroup>
                        </div>
                        {filterOption === 'bet' && (
                            <div className='flex mTop8 w100 justify_between'>
                                <div className='w65'>
                                    <div>
                                        <Select
                                            value={chronostratigraphyOptions.find(option => option.value === selectedStartTermChronos)}
                                            onChange={(selectedOption) => setSelectedStartTermChronos(selectedOption ? selectedOption.value : '')}
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
                                    <div className='mTop4'>
                                        <Select
                                            value={chronostratigraphyOptions.find(option => option.value === selectedEndTermChronos)}
                                            onChange={(selectedOption) => setSelectedEndTermChronos(selectedOption ? selectedOption.value : '')}
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
                            </div>
                        )}
                        {filterOption !== 'bet' && (
                            <div className='flex mTop8 w100 justify_between'>
                                <div className='w65'>
                                    <div>
                                        <Select
                                            value={chronostratigraphyOptions.find(option => option.value === selectedTermChronos)}
                                            onChange={(selectedOption) => setSelectedTermChronos(selectedOption ? selectedOption.value : '')}
                                            options={chronostratigraphyOptions}
                                            placeholder="Select option"
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
                            </div>
                        )}
                    </Card>
                </div>
                {/* FILTER BY TECTO TERM */}
                {currentLayer.filterConfiguration?.filterConfigurationByTectoUnitsTerm &&
                    <div className='mTop8'>
                        <Card>
                            <p className='fontSize_1rem font_bold mButtom2'>Filter by Tectonic Units term</p>
                            <div className='mTop4'>
                                {currentLayer && renderFilterList(currentLayer, FiltersType.FilterByTectoUnitsTerm)}
                            </div>
                            <div className='flex mTop8 w100 justify_between'>
                                <div className='w65'>
                                    <div>
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
                                            <CheckboxLabel>Include Narrower</CheckboxLabel>
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
                }
            </div>
        </form >
    );
}

export default QueryTools;
