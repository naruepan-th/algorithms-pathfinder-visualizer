// Import Node and Graph classes
import { Node } from './Node.js';
import { Graph } from './Graph.js';

// Create a new graph
const graph = new Graph();

// Initialize the graph on the SVG
graph.init('graphSvg');

// Grid settings
const gridRows = 8;  // Number of rows in the grid
const gridCols = 20;  // Number of columns in the grid
const nodeRadius = 10; // radius of a node

// Function to create the grid of nodes
function createGrid() {
    const svgWidth = graph.svg.getBoundingClientRect().width;
    const svgHeight = graph.svg.getBoundingClientRect().height;

    // Calculate node spacing based on the number of nodes and the SVG size
    const horizontalSpacing = (svgWidth - 4 * nodeRadius) / (gridCols - 1);
    const verticalSpacing = (svgHeight - 4 * nodeRadius) / (gridRows - 1);

    // Calculate offset to center the grid in the SVG
    const offsetX = (svgWidth - (gridCols - 1) * horizontalSpacing) / 2;
    const offsetY = (svgHeight - (gridRows - 1) * verticalSpacing) / 2;

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            // Create node ID (e.g., "node-0-0" for row 0, col 0)
            const nodeId = `node-${row}-${col}`;
            
            // Calculate node's position
            const x = col * horizontalSpacing + offsetX;  // Adjust horizontal position
            const y = row * verticalSpacing + offsetY;  // Adjust vertical position

            // Add the node to the graph
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
