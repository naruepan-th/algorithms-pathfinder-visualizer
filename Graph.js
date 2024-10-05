// Graph.js
import { Node } from './Node.js';

export class Graph {
    constructor() {
        this.nodes = {}; // To store nodes by their ID
        this.adjacencyList = new Map(); // Private adjacency list
        this.edgeElements = new Map(); //Private storage of all edges
        this.svg = null; // SVG element for edges and nodes
        this.graphContainer = null; // Container for svg element
        this.containerRect = null; // absolute positioning of graphContainer in DOM
        this.svgWidth = null; //svg canvas width
        this.svgHeight = null; //svg canvas height
        this.startNode = null; // specify the start node by ID
        this.endNode = null; //specify the end node by ID
        this.selectedAlgorithm = 'dijkstra'; //a variable to tell us which algorithm is selected in drop down menu
        this.isVisualizing = false;
        this.changeStartPressed = false; //boolean to see if changeStartNodeButton is pressed
        this.changeEndPressed = false; //boolean to see if changeEndNodeButton is pressed

        // Bind the dropdown event listener to update the algorithm
        this.setupAlgorithmSelector();
    }

    // Method to set up the dropdown listener
    setupAlgorithmSelector() {
        const algorithmSelect = document.getElementById('algorithmSelect');
        
        // Add an event listener to handle when a new option is selected
        algorithmSelect.addEventListener('change', (event) => {
            this.updateAlgorithm(event.target.value);
        });
    }

    // Method to update the selected algorithm in the class
    updateAlgorithm(selectedValue) {
        this.selectedAlgorithm = selectedValue;
    }

    // Initialize the graph with SVG container
    init(svgId) {
        this.svg = document.getElementById(svgId); // SVG for edges and nodes
    }

    // Add a node (SVG <circle>) to the graph
    addNode(node, type) {
        if (!this.nodes[node.id]) {
            this.nodes[node.id] = node;
            this.adjacencyList.set(node.id, []); // Initialize adjacency list for the node

            // add node to startNode or endNode if type is congruent to that
            if (type === 'start') {
                this.startNode = node;
                node.type = 'start';
            } else if (type === 'end') {
                this.endNode = node;
                node.type = 'end';
            }

            // Create the SVG circle element for the node
            const nodeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            nodeCircle.classList.add(`node-${type}`);
            nodeCircle.setAttribute('id', node.id);
            nodeCircle.setAttribute('cx', node.x); // X position
            nodeCircle.setAttribute('cy', node.y); // Y position
            nodeCircle.setAttribute('r', 10); // Radius of the circle

            //set grab to node
            node.setGrabOrDefaultOrPointer('grab', nodeCircle);

            // Add event listeners for selecting start and end node
            nodeCircle.addEventListener('mouseover', this.handleMouseOver.bind(this, node));
            nodeCircle.addEventListener('mouseout', this.handleMouseOut.bind(this, node));
            nodeCircle.addEventListener('click', this.handleClick.bind(this, node));

            // Add event listeners for dragging
            nodeCircle.addEventListener('mousedown', this.handleMouseDown.bind(this, node));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));

            // Append the circle to the SVG
            // Append the circle to the nodes group (so it's on top of the edges)
            this.svg.querySelector('#nodes').appendChild(nodeCircle);

        }
    }

    addEdge(node1Id, node2Id) {
        const node1 = this.nodes[node1Id];
        const node2 = this.nodes[node2Id];
    
        if (node1 && node2) {
            const distance = node1.getDistanceTo(node2); // Calculate weight based on distance
            this.adjacencyList.get(node1Id).push({ nodeId: node2Id, weight: distance });
            this.adjacencyList.get(node2Id).push({ nodeId: node1Id, weight: distance }); // Bidirectional
    
            // Draw the edge in the SVG (store in the edgeElements map)
            const edgeId1 = `${node1Id}-${node2Id}`;
            const edgeId2 = `${node2Id}-${node1Id}`;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", node1.x);
            line.setAttribute("y1", node1.y);
            line.setAttribute("x2", node2.x);
            line.setAttribute("y2", node2.y);
            line.setAttribute("stroke", "black");
    
            // Store the edge in the map for later updates
            this.edgeElements.set(edgeId1, line);
            this.edgeElements.set(edgeId2, line);
    
            // Append the line to the SVG
            // Append the line to the edges group (so it's behind the circles)
            this.svg.querySelector("#edges").appendChild(line);
        }
    }

    updateEdgePosition(node1Id, node2Id) {
        const edgeId = `${node1Id}-${node2Id}`;
        const line = this.edgeElements.get(edgeId);
    
        if (line) {
            const node1 = this.nodes[node1Id];
            const node2 = this.nodes[node2Id];
    
            // Update the positions of the edge without re-creating the element
            line.setAttribute("x1", node1.x);
            line.setAttribute("y1", node1.y);
            line.setAttribute("x2", node2.x);
            line.setAttribute("y2", node2.y);
        }
    }
    //event listeners for selecting start and end nodes
    // Handle mouse over event
    handleMouseOver(node) {
        if (this.changeStartPressed === true && node.type !== 'start' && node.type !== 'end') {
            node.setType('hoverStart', document.getElementById(`${node.id}`));
        } else if (this.changeEndPressed === true && node.type !== 'start' && node.type !== 'end') {
            node.setType('hoverEnd', document.getElementById(`${node.id}`));
        }
    }

    handleMouseOut(node) {
        if (this.changeStartPressed === true && node.type !== 'start' && node.type !== 'end') {
            node.setType('regular', document.getElementById(`${node.id}`));
        } else if (this.changeEndPressed === true && node.type !== 'start' && node.type !== 'end') {
            node.setType('regular', document.getElementById(`${node.id}`));
        }
    }

    handleClick(node) {
        if (this.changeStartPressed === true) {
            this.startNode.setType('regular', document.getElementById(`${this.startNode.id}`));
            node.setType('start', document.getElementById(`${node.id}`));
            this.startNode = node;
            this.changeStartPressed = false;
            document.getElementById('changeStartNodeButton').classList.remove("changeStartNodeButton-stopSelecting");
            document.getElementById('changeStartNodeButton').classList.add("changeStartNodeButton-change");
            document.getElementById('changeStartNodeButton').textContent = 'Change Start Node';
        } else if (this.changeEndPressed === true) {
            this.endNode.setType('regular', document.getElementById(`${this.endNode.id}`));
            node.setType('end', document.getElementById(`${node.id}`));
            this.endNode = node;
            this.changeEndPressed = false;
            document.getElementById('changeEndNodeButton').classList.remove("changeEndNodeButton-stopSelecting");
            document.getElementById('changeEndNodeButton').classList.add("changeEndNodeButton-change");
            document.getElementById('changeEndNodeButton').textContent = 'Change End Node';
        }
    }

    //event listeners for moving nodes
    // Handle mouse down event (start dragging)
    handleMouseDown(node, event) {
        if (this.isVisualizing === false && this.changeStartPressed === false && this.changeEndPressed === false) {
            node.isDragging = true;
            this.containerRect = this.svg.getBoundingClientRect(); // Get SVG container's bounding box
            this.svgWidth = document.getElementById('graphSvg').clientWidth;
            this.svgHeight = document.getElementById('graphSvg').clientHeight;
        }
    }

    // Handle mouse move event (dragging)
    handleMouseMove(event) {
        if (this.isVisualizing === false && this.changeStartPressed === false && this.changeEndPressed === false) {
            Object.values(this.nodes).forEach(node => {
                if (node.isDragging) {
                    const mouseX = event.clientX - this.containerRect.left;
                    const mouseY = event.clientY - this.containerRect.top;
                    
                    // Apply boundaries for x and y to keep the node inside the SVG
                    const boundedX = Math.max(0, Math.min(mouseX, this.svgWidth));  // Clamp between 0 and svgWidth
                    const boundedY = Math.max(0, Math.min(mouseY, this.svgHeight)); // Clamp between 0 and svgHeight

                    // Update node position
                    node.updatePosition(boundedX, boundedY);
        
                    // Update circle position using 'cx' and 'cy'
                    const nodeCircle = document.getElementById(node.id);
                    nodeCircle.setAttribute('cx', node.x);
                    nodeCircle.setAttribute('cy', node.y);
        
                    // Update only the edges connected to the node and neighbor's weights
                    this.adjacencyList.get(node.id).forEach(edge => {
                        this.updateEdgePosition(node.id, edge.nodeId);
                        edge.weight = node.getDistanceTo(this.nodes[edge.nodeId]);

                        this.adjacencyList.get(edge.nodeId).forEach(neighbor => {
                            if (neighbor.nodeId === node.id) {
                                neighbor.weight = node.getDistanceTo(this.nodes[edge.nodeId]);
                            }
                        });
                    });
                }
            });
        }
    }
    

    // Handle mouse up event (stop dragging)
    handleMouseUp() {
        if (this.isVisualizing === false && this.changeStartPressed === false && this.changeEndPressed === false) {
            Object.values(this.nodes).forEach(node => {
                node.isDragging = false; // Stop dragging
            });
        }
    }
}
