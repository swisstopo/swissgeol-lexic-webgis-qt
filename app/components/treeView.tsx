import React from 'react';
import TreeNode from './treeNode';
import { Layer } from '../slice/layerMenuSlice';
import "../css/styleLayer.css";
import { filtersNotEmpty } from '../utilities/LayerMenuUtilities';

/**
 * Properties of the treeview
 */
interface TreeViewProps {
    layers: Layer[];
}

/**
 * Manages the creation of the treeview: the tree composed of treenodes that allows the bvisualization and management of the layers within the application.
 * In summary, a menu tree.
 * 
 * Operates by reading an array of layers.
 */
const TreeView: React.FC<TreeViewProps> = ({ layers }) => {
    const renderTreeNode = (layer: Layer): React.ReactElement<typeof TreeNode> => {
        return (
            <TreeNode
                key={layer.id}
                id={layer.id}
                label={layer.label}
                isChecked={layer.isChecked}
                canFilter={layer.canFilter}
                isIndeterminate={layer.isIndeterminate}
                filters={filtersNotEmpty(layer.filters)}
                style={layer.style}
                idFilterLayer={layer.filterConfiguration?.filterLayer?.id}
                styleFilterLayer={layer.filterConfiguration?.filterLayer?.style}
                isChekedFilterLayer={filtersNotEmpty(layer.filters)}
            >
                {layer.children && layer.children.map(child => renderTreeNode(child))}
            </TreeNode>
        );
    };

    return (
        <div>
            <ul>
                {layers.map(layer => renderTreeNode(layer))}
            </ul>
        </div>
    );
};

export default TreeView;
