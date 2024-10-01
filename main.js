// Import Node and Graph classes
import { Node } from './Node.js';
import { Graph } from './Graph.js';

// Create a new graph
const graph = new Graph();

// Initialize the graph on the SVG
graph.init('graphSvg');

// Grid settings
const gridRows = 9;  // Number of rows in the grid
const gridCols = 21;  // Number of columns in the grid
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

            // add start and end node to graph
            if (row === Math.trunc(gridRows/4) && col === Math.trunc(gridCols/4)) {
                graph.addNode(new Node(nodeId, x, y), 'start');
            } else if (row === Math.trunc(gridRows - gridRows/4) && col === Math.trunc(gridCols - gridCols/4)) {
                graph.addNode(new Node(nodeId, x, y), 'end');
            } else {
                 // Add regular node to graph
                graph.addNode(new Node(nodeId, x, y), 'regular');
            }

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

document.querySelector('#visualizeButton').addEventListener('click', handleVisualizeClick);
const timeoutIds = new Set();

function clearTimeouts() {
    console.log(timeoutIds);
    timeoutIds.forEach(timeoutId => {
        clearTimeout(timeoutId);
    })
    timeoutIds.clear();
}

function clearGrid() {
    Object.values(graph.nodes).forEach(node => {
        if (node.type !== 'start' && node.type !== 'end') {
            node.setType('regular', document.getElementById(`${node.id}`));
        }
    });
}

function handleVisualizeClick() {
    if (graph.selectedAlgorithm === 'dijkstra') {
        clearTimeouts();
        clearGrid();
        runDijkstra(graph);
    } else if (graph.selectedAlgorithm === 'astar') {
        alert("astar not implemented yet, coming soon!");
    } else if (graph.selectedAlgorithm === 'bfs') {
        alert("bfs not implemented yet, coming soon!");
    } else if (graph.selectedAlgorithm === 'dfs') {
        alert("dfs not implemented yet, coming soon!");
    }
}

function runDijkstra(graph) {
    const visitedNodes = new Set();
    const priorityQueue = [];
    const distances = {};
    const prevNodes = {};
    let delay = 0;
    let delayAmount = 50;

    Object.keys(graph.nodes).forEach(nodeId => {
        distances[nodeId] = Infinity;
    });
    distances[graph.startNode.id] = 0;
    
    // Initialize the priority queue with the start node
    priorityQueue.push({ nodeId: graph.startNode.id, distance: 0});

    while (priorityQueue.length > 0) {
        //sort the priorityQueue by shortest distances
        priorityQueue.sort((a, b) => a.distance - b.distance);
        const { nodeId, distance } = priorityQueue.shift();

        //skip node if it's already visited
        if (visitedNodes.has(nodeId)) {
            continue;
        }

        //mark node as visited and highlight visited nodes
        visitedNodes.add(nodeId);
        if (graph.nodes[nodeId].type !== 'start' && graph.nodes[nodeId].type !== 'end') {
            let timeoutId = setTimeout(() => {
                graph.nodes[nodeId].setType('highlight', document.getElementById(`${nodeId}`));
            }, delay);
            timeoutIds.add(timeoutId);
            delay += delayAmount;
        }

        //if current node is the end node then we are done
        if (nodeId === graph.endNode.id) {
            let currentNode = graph.endNode.id;
            console.log("foundpath!");
            while (currentNode !== graph.startNode.id) {
                if (currentNode !== graph.startNode.id && currentNode !== graph.endNode.id) {
                    let capturedNode = currentNode;
                    let timeoutId = setTimeout(() => {
                        graph.nodes[capturedNode].setType('path', document.getElementById(`${capturedNode}`));
                    }, delay);
                    timeoutIds.add(timeoutId);
                    delay += delayAmount;
                }
                currentNode = prevNodes[currentNode];
            }
            return;
        }

        const neighbors = graph.adjacencyList.get(nodeId);

        neighbors.forEach((neighbor) => {
            if (!visitedNodes.has(neighbor.nodeId)) {
                const tentativeDistance = distance + neighbor.weight;

                if (tentativeDistance < distances[neighbor.nodeId]) {
                    distances[neighbor.nodeId] = tentativeDistance;
                    prevNodes[neighbor.nodeId] = nodeId;
                    priorityQueue.push({nodeId: neighbor.nodeId, distance: tentativeDistance});
                }
            }
        });
    }

    console.log("no path found");
    return;
}