/**
 * Transform a flat “arbor” array into a nested flare-style tree.
 *
 * @param {Array<Object>} flat      – raw data (e.g., from arbor.json)
 * @param {string}        rootName  – label for the synthetic root (“flare” in the example)
 * @returns {Object}                – nested tree
 */
function arborToFlare(flat, rootName = 'flare') {
  // Step 1 — build a lookup table of light-weight output nodes
  const byId = {};
  for (const item of flat) {
    const node = { name: item.value };
    const hasKids = item.children && item.children.length > 0;
    if (!hasKids && typeof item.weight === 'number') node.value = item.weight;
    node.children = [];                 // always create; we’ll prune empties later
    byId[item.id] = node;
  }

  // Step 2 — wire each node to its parent
  const root = { name: rootName, children: [] };
  for (const item of flat) {
    const node      = byId[item.id];
    const parentId  = item.parent;

    if (!parentId || parentId === 'root') {     // top-level node
      root.children.push(node);
    } else {
      const parentNode = byId[parentId];
      if (parentNode) parentNode.children.push(node);
      else            root.children.push(node); // orphan fallback
    }
  }

  // Step 3 — remove empty `children` arrays so leaves look like flare leaves
  (function prune(n) {
    for (const child of n.children) prune(child);
    if (n.children.length === 0) delete n.children;
  })(root);

  return root;
}


const source = require('./arbor.json');
const fs = require('fs');
const transformed = arborToFlare(source, 'arbor')

fs.writeFileSync('flare.json', JSON.stringify(transformed, null, 1));

