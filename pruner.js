
const fs = require('fs');

const inputFilePath = './arbor.json';
const outputFilePath = './arbor_pruned.json';

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        const nodes = JSON.parse(data);

        // Create a map of all nodes by their ID for quick lookup
        const nodeMap = new Map();
        nodes.forEach(node => {
            nodeMap.set(node.id, node);
        });

        // Identify all valid node IDs (including 'root' as a valid parent)
        const validNodeIds = new Set();
        nodes.forEach(node => {
            if (node.parent === 'root' || nodeMap.has(node.parent)) {
                validNodeIds.add(node.id);
            }
        });

        // Recursively get all descendants of a given node
        function getDescendants(nodeId, allNodes) {
            const descendants = new Set();
            const queue = [nodeId];

            while (queue.length > 0) {
                const currentId = queue.shift();
                const currentNode = allNodes.get(currentId);

                if (currentNode && currentNode.children) {
                    currentNode.children.forEach(childId => {
                        if (allNodes.has(childId)) { // Only add if child exists in original data
                            descendants.add(childId);
                            queue.push(childId);
                        }
                    });
                }
            }
            return descendants;
        }

        // Collect all nodes that are valid or descendants of valid nodes
        const nodesToKeep = new Set();
        validNodeIds.forEach(id => {
            nodesToKeep.add(id); // Add the valid node itself
            const descendants = getDescendants(id, nodeMap);
            descendants.forEach(descendantId => nodesToKeep.add(descendantId));
        });

        // Filter the original nodes to keep only the valid ones and their descendants
        const prunedNodes = nodes.filter(node => nodesToKeep.has(node.id));

        // Write the pruned data to a new JSON file
        fs.writeFile(outputFilePath, JSON.stringify(prunedNodes, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing the file:', err);
                return;
            }
            console.log(`Pruned data saved to ${outputFilePath}`);
        });

    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});
