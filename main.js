// Import Node and Graph classes
import { Node } from './Node.js';
import { Graph } from './Graph.js';

// Create a new graph
const graph = new Graph();

// Initialize the graph on the SVG
graph.init('graphSvg');  // Removed 'graphContainer' because we no longer need it for buttons

// Grid settings
const gridRows = 6;  // Number of rows in the grid
const gridCols = 14;  // Number of columns in the grid
const nodeSpacing = 100;  // Spacing between nodes

// Function to create the grid of nodes
function createGrid() {
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            // Create node ID (e.g., "node-0-0" for row 0, col 0)
            const nodeId = `node-${row}-${col}`;
            
            // Calculate node's position
            const x = col * nodeSpacing + 50;  // Adjust horizontal position
            const y = row * nodeSpacing + 50;  // Adjust vertical position

            // Add the node to the graph (now using <circle> for the node)
            graph.addNode(new Node(nodeId, x, y));

            // Add edges to neighboring nodes
            // Edge to the left neighbor (if not on the first column)
            if (col > 0) {
                const leftNeighborId = `node-${row}-${col - 1}`;
                graph.addEdge(nodeId, leftNeighborId);
            }

            // Edge to the top neighbor (if not on the first row)
            if (row > 0) {
                const topNeighborId = `node-${row - 1}-${col}`;
                graph.addEdge(nodeId, topNeighborId);
            }
        }
    }
}

// Create the grid of nodes with edges
createGrid();
