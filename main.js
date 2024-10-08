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

var visualizeButtonMode = 'visualize'; //modes are 'visualize' or 'stop'

document.querySelector('#changeStartNodeButton').addEventListener('click', handleChangeStartClick);
document.querySelector('#changeEndNodeButton').addEventListener('click', handleChangeEndClick);

function handleChangeStartClick() {
    if (graph.isVisualizing === false) {
        if (graph.changeStartPressed === false && graph.changeEndPressed === false) {
            selectStart();
            setForAllNodesGrabOrDefaultOrPointer('pointer');
        } else if (graph.changeStartPressed === false && graph.changeEndPressed === true) {
            selectStart();
            deselectEnd();
            setForAllNodesGrabOrDefaultOrPointer('pointer');
        } else if (graph.changeStartPressed === true) {
            deselectStart();
            setForAllNodesGrabOrDefaultOrPointer('grab');
        } 
    }
}

function handleChangeEndClick() {
    if (graph.isVisualizing === false) {
        if (graph.changeStartPressed === false && graph.changeEndPressed === false) {
            selectEnd();
            setForAllNodesGrabOrDefaultOrPointer('pointer');
        } else if (graph.changeStartPressed === true && graph.changeEndPressed === false) {
            selectEnd();
            deselectStart();
            setForAllNodesGrabOrDefaultOrPointer('pointer');
        } else if (graph.changeEndPressed === true) {
            deselectEnd();
            setForAllNodesGrabOrDefaultOrPointer('grab');
        }
    }
}

function selectStart() {
    setStartButtonMode('stopSelecting', document.getElementById('changeStartNodeButton'));
    graph.changeStartPressed = true;
}

function deselectStart() {
    setStartButtonMode('change', document.getElementById('changeStartNodeButton'));
    graph.changeStartPressed = false;
}

function selectEnd() {
    setEndButtonMode('stopSelecting', document.getElementById('changeEndNodeButton'));
    graph.changeEndPressed = true;
}

function deselectEnd() {
    setEndButtonMode('change', document.getElementById('changeEndNodeButton'));
    graph.changeEndPressed = false;
}

//we're just removing the opposite of mode here since there are only two modes

function setStartButtonMode(mode, element) {
    if (mode === 'change') {
        element.textContent = 'Change Start Node';
        element.classList.remove(`changeStartNodeButton-stopSelecting`);
    } else {
        element.textContent = 'Stop Selecting';
        element.classList.remove(`changeStartNodeButton-change`);
    }
    element.classList.add(`changeStartNodeButton-${mode}`);
}

function setEndButtonMode(mode, element) {
    if (mode === 'change') {
        element.textContent = 'Change End Node';
        element.classList.remove(`changeEndNodeButton-stopSelecting`);
    } else {
        element.textContent = 'Stop Selecting';
        element.classList.remove(`changeEndNodeButton-change`);
    }
    element.classList.add(`changeEndNodeButton-${mode}`);
}

document.querySelector('#visualizeButton').addEventListener('click', handleVisualizeClick);
const timeoutIds = new Set();

function clearTimeouts() {
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

function clearBoard() {
    clearTimeouts(); //cancel all animations
    clearGrid(); //clear the board
}

function setForAllNodesGrabOrDefaultOrPointer (grabOrDefaultOrPointer) {
    Object.values(graph.nodes).forEach(node => {
        node.setGrabOrDefaultOrPointer(grabOrDefaultOrPointer, document.getElementById(`${node.id}`));
    });
    if (grabOrDefaultOrPointer === 'default') {
        graph.isVisualizing = true;
    } else {
        graph.isVisualizing = false;
    }
}

function setVisualizeButtonMode(mode, element) {
    element.classList.remove(`visualizeButton-${visualizeButtonMode}`);
    visualizeButtonMode = mode;
    element.classList.add(`visualizeButton-${mode}`);
    if (mode === 'visualize') {
        element.textContent = 'Visualize';
    } else {
        element.textContent = 'Stop';
    }
}

function handleVisualizeClick() {
    if (visualizeButtonMode === 'visualize') {
        setVisualizeButtonMode('stop', document.getElementById('visualizeButton'));
        if (graph.selectedAlgorithm === 'dijkstra') {
            runDijkstra(graph);
        } else if (graph.selectedAlgorithm === 'astar') {
            alert("astar not implemented yet, coming soon!");
        } else if (graph.selectedAlgorithm === 'bfs') {
            alert("bfs not implemented yet, coming soon!");
        } else if (graph.selectedAlgorithm === 'dfs') {
            alert("dfs not implemented yet, coming soon!");
        }
    } else if (visualizeButtonMode === 'stop') {
        setForAllNodesGrabOrDefaultOrPointer('grab');
        setVisualizeButtonMode('visualize', document.getElementById('visualizeButton'));
        clearBoard();
    }
}

function runDijkstra(graph) {
    clearBoard();
    setForAllNodesGrabOrDefaultOrPointer('default');
    
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
            timeoutIds.add(setTimeout(() => {
                setForAllNodesGrabOrDefaultOrPointer('grab');
                setVisualizeButtonMode('visualize', document.getElementById('visualizeButton'));
            }, delay));
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
    setForAllNodesGrabOrDefaultOrPointer('grab');
    setVisualizeButtonMode('visualize', document.getElementById('visualizeButton'));
    return;
}