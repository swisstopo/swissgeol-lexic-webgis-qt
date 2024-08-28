import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { toggleCheck, toggleFilter, Style, updateOpacity, Layer } from '../slice/layerMenuSlice';

import "../css/styleLayer.css";
import { CheckIcon, Checkbox, CheckboxIcon, CheckboxIndicator, ChevronRightIcon, ChevronDownIcon, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Icon } from '@gluestack-ui/themed';
import { Filter as FilterIcon, Square, FilterX, FilterXIcon } from 'lucide-react';


interface TreeNodeProps {
    id: string;
    label: string;
    children?: React.ReactElement<typeof TreeNode>[] | React.ReactElement<typeof TreeNode>;
    isChecked: boolean;
    canFilter: boolean;
    isIndeterminate?: boolean;
    filters?: boolean;
    style: Style | undefined;
    styleFilterLayer: Style | undefined;
    isChekedFilterLayer: boolean | undefined;
    idFilterLayer: string | undefined;
}

const TreeNode: React.FC<TreeNodeProps> = ({ id, label, children, isChecked, canFilter, isIndeterminate, filters, style, idFilterLayer, styleFilterLayer, isChekedFilterLayer }) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCheckboxClick = () => {
        console.log('Checkbox clicked for layer:', id);
        dispatch(toggleCheck(id));
    };

    const handleExpandIconClick = () => {
        console.log('Expand icon clicked for layer:', id);
        setIsExpanded(!isExpanded);
    };

    const handleFilterIconClick = () => {
        console.log('Filter icon clicked for layer:', id);
        dispatch(toggleFilter(id));
    };

    const handleOpacityChanged = (newValue: number, isFilterLayer: boolean) => {
        const layerIdToUpdate = isFilterLayer ? idFilterLayer : id;
        if (layerIdToUpdate) {
            dispatch(updateOpacity({ layerId: layerIdToUpdate, opacity: newValue / 100 }));
        }
    };

    return (
        <>
            <div className='subMenu'>
                <div className='align_center mBottom12'>
                    <div className='flex w100 justify_between'>
                        <Checkbox
                            size="sm"
                            isInvalid={false}
                            isDisabled={false}
                            value={id}
                            isChecked={isChecked}
                            onChange={handleCheckboxClick}
                        >
                            <CheckboxIndicator mr="$2">
                                {isIndeterminate ? (
                                    <Icon as={Square} />
                                ) : (
                                    <CheckboxIcon as={CheckIcon} />
                                )}
                            </CheckboxIndicator>
                            <p className='font_bold font_1rem'>{label}</p>
                        </Checkbox>

                        {canFilter && filters && (
                            <div className='flex align_center mRight5' onClick={handleFilterIconClick} style={{ cursor: 'pointer' }}>
                                <Icon as={FilterIcon} w="$4" h="$4" color='$red600' />
                            </div>
                        )}

                        {canFilter && !filters && (
                            <div className='flex align_center mRight5' onClick={handleFilterIconClick} style={{ cursor: 'pointer' }}>
                                <Icon as={FilterIcon} w="$4" h="$4" color='#9a9996' />
                            </div>
                        )}

                        {children && isExpanded && (
                            <div onClick={handleExpandIconClick} className='flex align_center'>
                                <Icon as={ChevronDownIcon} w="$4" h="$4" />
                            </div>
                        )}

                        {children && !isExpanded && (
                            <div onClick={handleExpandIconClick} className='flex align_center'>
                                <Icon as={ChevronRightIcon} w="$4" h="$4" />
                            </div>
                        )}
                    </div>
                    {isChekedFilterLayer && (
                        <div className='mTop3 w80 mLeft10 '>
                            <p className='font_05rem mBottom3'>Opacity Filter Layer</p>
                            <Slider
                                defaultValue={styleFilterLayer?.opacity ? styleFilterLayer.opacity * 100 : 0}
                                minValue={0}
                                maxValue={100}
                                onChange={(newValue) => handleOpacityChanged(newValue, true)}
                                size="sm"
                                orientation="horizontal"
                                isDisabled={false}
                                isReversed={false}
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                        </div>
                    )}
                    {style && (
                        <div className='mTop3 mBottom30 w80 mLeft10 '>
                            <p className='font_05rem mBottom3'>Opacity</p>
                            <Slider
                                defaultValue={style?.opacity ? style.opacity * 100 : 0}
                                minValue={0}
                                maxValue={100}
                                onChange={(newValue) => handleOpacityChanged(newValue, false)}
                                size="sm"
                                orientation="horizontal"
                                isDisabled={false}
                                isReversed={false}
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                        </div>
                    )}

                </div>

                {isExpanded && children && (
                    <div className='subMenu'>
                        <ul>
                            {React.Children.map(children, (child, index) => (
                                <li key={index}>{child}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </>
    );
};

export default TreeNode;
