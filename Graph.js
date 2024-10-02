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
        this.startEndToggle = 0; //a toggle for the handleNodeClick function
        this.selectedAlgorithm = 'dijkstra'; //a variable to tell us which algorithm is selected in drop down menu
        this.isVisualizing = false;

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
            node.setGrabOrDefault('grab', nodeCircle);

            // Add event listeners for dragging
            nodeCircle.addEventListener('mousedown', this.handleMouseDown.bind(this, node));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            // nodeCircle.addEventListener('click', this.handleNodeClick.bind(this));

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
    
    // Handle click event
    // handleNodeClick(event) {
    //     const nodeId = event.target.id;
    //     const node = this.nodes[nodeId];
    //     const nodeElement = event.target;

    //     if (!this.startNode && !this.endNode) {
    //         node.setType('start', nodeElement);
    //         this.startNode = node;
    //     } else if (this.startNode && !this.endNode) {
    //         if (node.type !== 'start') {
    //             node.setType('end', nodeElement);
    //             this.endNode = node;
    //         } else {
    //             node.setType('regular', nodeElement);
    //             this.startNode = null;
    //         }
    //     } else if (!this.startNode && this.endNode) {
    //         if (node.type !== 'end') {
    //             node.setType('start', nodeElement);
    //             this.startNode = node;
    //         } else {
    //             node.setType('regular', nodeElement);
    //             this.endNode = null;
    //         }
    //     } else {
    //         if (node.type === 'start') {
    //             node.setType('regular', nodeElement);
    //             this.startNode = null;
    //         } else if (node.type === 'end') {
    //             node.setType('regular', nodeElement);
    //             this.endNode = null;
    //         } else {
    //             if (this.startEndToggle === 0) {
    //                 const previousStartNodeElement = document.getElementById(this.startNode.id);
    //                 this.startNode.setType('regular', previousStartNodeElement);
    //                 this.startNode = null;
                    
    //                 node.setType('start', nodeElement);
    //                 this.startNode = node;
    //                 this.startEndToggle = 1;
    //             } else if (this.startEndToggle === 1) {
    //                 const previousEndNodeElement = document.getElementById(this.endNode.id);
    //                 this.endNode.setType('regular', previousEndNodeElement);
    //                 this.endNode = null;

    //                 node.setType('end', nodeElement);
    //                 this.endNode = node;
    //                 this.startEndToggle = 0;
    //             }
    //         }
    //     }
    // }

    // Handle mouse down event (start dragging)
    handleMouseDown(node, event) {
        if (this.isVisualizing === false) {
            node.isDragging = true;
            this.containerRect = this.svg.getBoundingClientRect(); // Get SVG container's bounding box
            this.svgWidth = document.getElementById('graphSvg').clientWidth;
            this.svgHeight = document.getElementById('graphSvg').clientHeight;
        }
    }

    // Handle mouse move event (dragging)
    handleMouseMove(event) {
        if (this.isVisualizing === false) {
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
        if (this.isVisualizing === false) {
            Object.values(this.nodes).forEach(node => {
                node.isDragging = false; // Stop dragging
            });
        }
    }
}
