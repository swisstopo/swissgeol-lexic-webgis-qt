import React, { useEffect, useState } from 'react';
import "../css/styleQueryTools.css";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addFilter, Layer, removeFilter, toggleFilter } from '../slice/layerMenuSlice';

//gluestack
import { AddIcon, Card, ChevronDownIcon, Icon, Input, InputField, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger, TrashIcon, CircleIcon, Badge, BadgeText, BadgeIcon } from '@gluestack-ui/themed';
import { Switch } from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonIcon, ButtonSpinner, ButtonGroup } from '@gluestack-ui/themed';
import { Select } from '@gluestack-ui/themed';
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

interface QueryToolsProps {
    cache: { [key: string]: { label: string; value: string }[] };
}
/**
 * QueryTool deals with rendering a panel that allows you to enter parameters to filter the 
 * BY ATTRIBUTE, CHRONOSTRATIGRAPHY AGE, and LITHOSTRATIGRAPHY TERM layers
 */
const QueryTools: React.FC<QueryToolsProps> = ({ cache }) => {
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
    const [includeNarrowers, setIncludeNarrowers] = useState<boolean>(false);



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
    // Effect to update selected layer ID from Redux state
    useEffect(() => {
        if (iconFilterLayerId && iconFilterLayerId !== selectedLayerId) {
            setSelectedLayerId(iconFilterLayerId);
        }
    }, [iconFilterLayerId, selectedLayerId]);

    const handleDeselectFilter = () => {
        dispatch(toggleFilter(undefined));
        setSelectedLayerId(null);
    };
    //Return null when the current layer is not defined
    if (!currentLayer) {
        return null;
    }
    //Function for add filter 
    const handleAddFilter = (filterType: FiltersType) => {
        console.log('Adding filter:', { selectedFilter, inputValue, selectedLayerId, selectedTectonicUnitTerm, includeNarrowers });

        if (filterType === FiltersType.FilterByAttribute && selectedFilter && inputValue && selectedLayerId) {
            const filter = {
                filterByAttribute: [{ key: selectedFilter, value: inputValue }]
            };
            console.log('Payload passed to addFilter:', { layerId: selectedLayerId, filter, filterType: 'filterByAttribute' });
            dispatch(addFilter({ layerId: selectedLayerId, filter, filterType: FiltersType.FilterByAttribute }));
            setInputValue('');
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

    //Function for delete filter 
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
    //Function for render filter list
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


    const attributeOptions = currentLayer.attributesConfiguration?.attributes?.map(attr => ({
        value: attr,
        label: currentLayer.attributesConfiguration?.attributeOverrides?.[attr]?.column || attr
    })) || [];


    return (
        <form >
            <div id='containerQueryTools' className="bgGrey textBlack">
                <div>
                    <div className='flex justify_between'>
                        <p className='fontSize_1_5rem font_bold'>Search box</p>
                        {false && <Switch size="md" isDisabled={false} />}
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
                                    <Select selectedValue={selectedFilter} onValueChange={setSelectedFilter}>
                                        <SelectTrigger variant="rounded" size="sm">
                                            <SelectInput placeholder="Select option" />
                                            <div className='mRight5'>
                                                <SelectIcon>
                                                    <Icon as={ChevronDownIcon} />
                                                </SelectIcon>
                                            </div>
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectBackdrop />
                                            <SelectContent>
                                                <SelectDragIndicatorWrapper>
                                                    <SelectDragIndicator />
                                                </SelectDragIndicatorWrapper>
                                                {attributeOptions.map((option) => (
                                                    <SelectItem key={option.value} label={option.label} value={option.value} />
                                                ))}
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
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
                                        <Select selectedValue="Miocene">
                                            <SelectTrigger variant="rounded" size="sm">
                                                <SelectInput placeholder="Select option" />
                                                <div className='mRight5'>
                                                    <SelectIcon>
                                                        <Icon as={ChevronDownIcon} />
                                                    </SelectIcon>
                                                </div>
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper>
                                                        <SelectDragIndicator />
                                                    </SelectDragIndicatorWrapper>
                                                    {[...chronostratigraphy]
                                                        .sort((a, b) => a.label.localeCompare(b.label))
                                                        .map((term, index) => (
                                                            <SelectItem key={index} label={term.label} value={term.value} />
                                                        ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    </div>
                                    <div className='mTop4'>
                                        <Select selectedValue="Eocene">
                                            <SelectTrigger variant="rounded" size="sm">
                                                <SelectInput placeholder="Select option" />
                                                <div className='mRight5'>
                                                    <SelectIcon>
                                                        <Icon as={ChevronDownIcon} />
                                                    </SelectIcon>
                                                </div>
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper>
                                                        <SelectDragIndicator />
                                                    </SelectDragIndicatorWrapper>
                                                    {[...chronostratigraphy]
                                                        .sort((a, b) => a.label.localeCompare(b.label))
                                                        .map((term, index) => (
                                                            <SelectItem key={index} label={term.label} value={term.value} />
                                                        ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                        {filterOption !== 'bet' && (
                            <div className='flex mTop8 w100 justify_between'>
                                <div className='w65'>
                                    <div>
                                        <Select selectedValue="Miocene">
                                            <SelectTrigger variant="rounded" size="sm">
                                                <SelectInput placeholder="Select option" />
                                                <div className='mRight5'>
                                                    <SelectIcon>
                                                        <Icon as={ChevronDownIcon} />
                                                    </SelectIcon>
                                                </div>
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper>
                                                        <SelectDragIndicator />
                                                    </SelectDragIndicatorWrapper>
                                                    {[...chronostratigraphy]
                                                        .sort((a, b) => a.label.localeCompare(b.label))
                                                        .map((term, index) => (
                                                            <SelectItem key={index} label={term.label} value={term.value} />
                                                        ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
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
                                <div>
                                    <div>
                                        <Select onValueChange={setSelectedTectonicUnitTerm}>
                                            <SelectTrigger variant="rounded" size="sm">
                                                <SelectInput placeholder="Select option" />
                                                <div className='mRight5'>
                                                    <SelectIcon>
                                                        <Icon as={ChevronDownIcon} />
                                                    </SelectIcon>
                                                </div>
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper>
                                                        <SelectDragIndicator />
                                                    </SelectDragIndicatorWrapper>
                                                    {[...tecto]
                                                        .sort((a, b) => a.label.localeCompare(b.label))
                                                        .map((term, index) => (
                                                            <SelectItem key={index} label={term.label} value={term.value} />
                                                        ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
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
        </form>
    );
}

export default QueryTools;
