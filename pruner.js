const fs = require('fs');

const inputFilePath  = './arbor.json';
const outputFilePath = './arbor_pruned.json';

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    let nodes;
    try {
        nodes = JSON.parse(data);
    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        return;
    }

    /* ---------- build a lookup for O(1) access ---------- */
    const nodeMap = new Map();
    for (const node of nodes) {
        nodeMap.set(node.id, node);
    }

    /* ---------- seed the search with root-level children ---------- */
    const queue = [];
    for (const node of nodes) {
        if (node.parent === 'root') queue.push(node.id);
    }

    /* ---------- breadth-first walk, collecting valid nodes ---------- */
    const result = new Map();
    let head = 0;

    while (head < queue.length) {
        const id = queue[head++];
        if (result.has(id)) continue;              // already processed
        const node = nodeMap.get(id);
        if (!node) continue;                       // skip dangling references

        result.set(id, node);

        const { children } = node;
        if (Array.isArray(children)) {
            for (const childId of children) {
                if (nodeMap.has(childId)) queue.push(childId);
            }
        }
    }

    /* ---------- write output ---------- */
    fs.writeFile(
        outputFilePath,
        JSON.stringify([...result.values()], null, 2),
        'utf8',
        writeErr => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return;
            }
            console.log(`Pruned data saved to ${outputFilePath}`);
        }
    );
});
