import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createExpansLayersList, getFeaturesLayers } from '../utilities/LayerMenuUtilities';
import { AttributesConfiguration, Layer, addFilter, setAttributesConfiguration, toggleFilter } from '../slice/layerMenuSlice';
import Map from 'ol/Map';
import { MapBrowserEvent } from 'ol';
import { Modal, Box, ModalCloseButton, CloseIcon, Icon, ModalBackdrop, ModalHeader, Heading, ModalBody, EditIcon, Pressable, SearchIcon, Text } from '@gluestack-ui/themed';
import { FiltersType } from '../enum/filterTypeEnum';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { VocabularyItem } from '../slice/vocabularySlice';

/**
 * Defines the properties of the pop up info.
 * 
 */
interface FeatureInfoPopupProps {
    map: Map | null;
    checkedLayerListFeatures: Layer[];
    layers: Layer[];
}

/**
 * Handles the creation of the getfeatureinfo pop up, returning layer information, when clicking on a point on the map.
 */
const FeatureInfoPopup: React.FC<FeatureInfoPopupProps> = ({ map, checkedLayerListFeatures, layers }) => {
    const iconFilterLayerId = useSelector((state: RootState) => state.layerMenuSlice.iconFilterLayers);
    const layerToSlice = useSelector((state: RootState) => state.layerMenuSlice.layers);
    const cache = useSelector((state: RootState) => state.vocabulariesSlice.cache);
    const expandedLayerList = createExpansLayersList(layerToSlice, false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableDataList, setTableDataList] = useState<any[]>([]);
    const dispatch = useDispatch();
    /**
     * Function to retrieve the label associated with a given processed value from a vocabulary
     * 
     * @param processedValue - The value to search for within the cached vocabulary
     * @returns The label corresponding to the processed value, or an empty string if not found
     */
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
     * Function to add a filter to a specific layer
     * 
     * @param layerId - ID of the layer to which the filter is applied
     * @param filterKey - Attribute key on which to filter
     * @param value - Value used for filtering the attribute
     * @returns void
     */
    const handleAddFilter = useCallback((layerId: string, filterKey: string, value: string) => {
        const filter = {
            filterByAttribute: [{ key: filterKey, value: value }]
        };
        dispatch(addFilter({ layerId: layerId, filter, filterType: FiltersType.FilterByAttribute }));
        dispatch(toggleFilter(layerId));
        console.log('Aggiunta filtro al layer con ID:', layerId);
    }, [dispatch]);

    /**
     * Function to parse XML document and get feature data
     * 
     * @param xmlText fetures in xml format
     * @returns features ready for inclusion in the DOM
     */
    const parseXMLAndGetFeatureData = useCallback((xmlText: string): any[] => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const featuresData: any[] = [];

        const layerElements = xmlDoc.getElementsByTagName('Layer');
        if (layerElements.length === 0) {
            console.error('No Layer elements found in XML.');
            return featuresData;
        }

        const layerElement = layerElements[0];
        const layerName = layerElement.getAttribute('name') || 'Unknown Layer';

        const layer = layers.find(layer => layer.id === layerName);
        const canFilter = layer ? layer.canFilter : false;

        const featureElements = layerElement.getElementsByTagName('Feature');

        for (let i = 0; i < featureElements.length; i++) {
            const featureElement = featureElements[i];
            const attributes = featureElement.getElementsByTagName('Attribute');
            const featureData: any = {
                LayerName: layerName,
                CanFilter: canFilter
            };

            for (let j = 0; j < attributes.length; j++) {
                const attribute = attributes[j];
                const attributeName = attribute.getAttribute('name');
                let attributeValue = attribute.getAttribute('value');

                if (attributeName) {
                    featureData[attributeName] = attributeValue;
                } else {
                    console.warn('Nome attributo non valido:', attributeName);
                }
            }

            if (Object.keys(featureData).length > 1) {
                featuresData.push(featureData);
            }
        }

        return featuresData;
    }, []);

    /**
     * Function to handle single click on the map.
     */
    const singleClickHandler = useCallback((evt: MapBrowserEvent<UIEvent>) => {
        /**
         * Does not return anything if you click on a map that does not exist
         */
        if (!map) return;

        const view = map.getView();
        const viewResolution = view.getResolution();
        if (!viewResolution) return;

        const coordinate = evt.coordinate;
        /**
         * Obtain feature layer sources from the expanded layer list
         */
        const sources = getFeaturesLayers(checkedLayerListFeatures);
        /**
         * Temporary layer features list
         */
        const tempTableDataList: any[] = [];
        /**
         * Iterate on all sources of feature layers.
         */
        sources.forEach(source => {
            const url = source.getFeatureInfoUrl(
                coordinate,
                viewResolution,
                'EPSG:2056',
                { 'INFO_FORMAT': 'text/xml' }
            );
            if (!url) return;
            /**
             * Make a fetch request to get feature data in XML format
             */
            fetch(url)
                .then(response => response.text())
                .then(xmlText => {
                    const parsedData = parseXMLAndGetFeatureData(xmlText);
                    tempTableDataList.push(parsedData);
                    /* downloadXml(xmlText); */

                    /**
                     *  If all the data have been obtained, update the status and open the modal
                     */
                    if (tempTableDataList.length === sources.length) {
                        setTableDataList(tempTableDataList);
                        setIsModalOpen(true);
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        });
    }, [map, checkedLayerListFeatures]);
    /**
     * Effect to handle the registration and cleanup of a single-click event on the map
     * 
     * This effect adds an event listener for the 'singleclick' event on the map when the component mounts or when the map or 
     * singleClickHandler changes. It cleans up by removing the event listener when the component unmounts or when the dependencies change.
     * 
     * @param map
     * @param singleClickHandler
     * @returns
     */
    useEffect(() => {
        if (!map) return;
        map.on('singleclick', singleClickHandler);
        return () => {
            map.un('singleclick', singleClickHandler);
        };
    }, [map, singleClickHandler]);
    /**
     * Function to find an attribute override for a specific layer and column key
     * 
     * @param layerName - The name of the layer to search for
     * @param colKey - The column key for which to find the attribute override
     * @returns The attribute override if found, or null if not found
     */
    const findAttributeOverride = (layerName: string, colKey: string) => {
        for (const layer of expandedLayerList) {
            if (layer.id === layerName) {
                const attributeOverride = layer.attributesConfiguration?.attributeOverrides?.[colKey];
                if (attributeOverride) {
                    return attributeOverride;
                }
            }
        }
        return null;
    };

    return (
        <Modal isOpen={isModalOpen} closeOnOverlayClick onClose={() => setIsModalOpen(false)}>
            <ModalBackdrop />
            <Box
                w='80%'
                display='flex'
                flexDirection='column'
                position='absolute'
                bottom='$1.5'
                left='$0'
                borderWidth={2}
                borderColor='#9988BA'
                borderRadius={10}
                height='35%'
                overflow='hidden'
                style={{
                    backgroundColor: '#f1f3f5'
                }}
            >
                <ModalHeader>
                    <Heading size="lg">Results for GetFeatureInfo</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <Box>
                        {tableDataList.map((tableData, tableIndex) => (
                            <Box key={tableIndex}>
                                <Text color='black' margin={2} fontSize={13}>Layer Name: {tableData[0]?.LayerName}</Text>
                                <Box
                                    backgroundColor='white'
                                    borderRadius={10}
                                    justifyContent='center'
                                    mb={10}
                                    maxWidth='100%'
                                    overflow='scroll'
                                >
                                    <table width='98%' style={{ marginTop: '0.5%', border: 'none', overflowX: 'auto', tableLayout: 'auto' }}>
                                        <thead>
                                            <tr>
                                                {tableData[0] ? (
                                                    Object.keys(tableData[0])
                                                        .filter((key) => key !== 'LayerName' && key != 'CanFilter')
                                                        .map((key, colIndex) => (
                                                            <th key={colIndex} style={{ padding: '3px', textAlign: 'left', fontWeight: 'bold', color: 'red', fontSize: '13px' }}>
                                                                {key}
                                                            </th>
                                                        ))
                                                ) : (
                                                    <th style={{ color: 'black' }}>No data available</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((row: any, rowIndex: number) => (
                                                <tr key={rowIndex}>
                                                    {Object.entries(row)
                                                        .filter(([key, _]) => key !== 'LayerName' && key !== 'CanFilter')
                                                        .map(([colKey, value], colIndex) => {
                                                            const processedValue = value !== null && value !== undefined ? value.toString() : '';
                                                            const layerName = tableData[0]?.LayerName || '';

                                                            const override = findAttributeOverride(layerName, colKey);
                                                            const vocabolary_label = getVocabularyLabel(processedValue);
                                                            const label = override ? vocabolary_label : value;

                                                            return (
                                                                <td key={colIndex} style={{ padding: '3px', textAlign: 'left', fontWeight: 'lighter', color: 'black', fontSize: '12px', verticalAlign: 'top' }}>
                                                                    <Box flexDirection='row' justifyContent='space-between'>
                                                                        {override?.type === 'text' && override?.labelSourceForLink === 'link' ? (
                                                                            <a href={processedValue} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'none' }}>
                                                                                {processedValue}
                                                                            </a>
                                                                        ) : override?.type === 'text' && override?.labelSourceForLink === 'vocabulary_label' ? (
                                                                            <a href={processedValue} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'none' }}>
                                                                                {processedValue}
                                                                            </a>
                                                                        ) : override?.type === 'link' && override?.labelSourceForLink === 'link' ? (
                                                                            <a href={processedValue} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'none' }}>
                                                                                {processedValue}
                                                                            </a>
                                                                        ) : override?.type === 'link' && override?.labelSourceForLink === 'vocabulary_label' ? (
                                                                            <a href={processedValue} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'none' }}>
                                                                                {vocabolary_label || processedValue}
                                                                            </a>
                                                                        ) : (
                                                                            processedValue
                                                                        )}
                                                                        {tableData[0]?.CanFilter && (
                                                                            <Pressable
                                                                                onPress={() => handleAddFilter(tableData[0]?.LayerName, colKey, value as string)}
                                                                            >
                                                                                <Icon as={SearchIcon} mr="$2" w="$3" h="$3" color='$red600' />
                                                                            </Pressable>
                                                                        )}
                                                                    </Box>
                                                                </td>
                                                            );
                                                        })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </ModalBody>
            </Box>
        </Modal>
    );
};

export default FeatureInfoPopup;