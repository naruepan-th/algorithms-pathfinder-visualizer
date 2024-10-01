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
        this.startNode = null; // specify the start node by ID
        this.endNode = null; //specify the end node by ID
        this.startEndToggle = 0; //a toggle for the handleNodeClick function
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

            // Add event listeners for dragging
            nodeCircle.addEventListener('mousedown', this.handleMouseDown.bind(this, node));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            nodeCircle.addEventListener('click', this.handleNodeClick.bind(this));

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
    handleNodeClick(event) {
        const nodeId = event.target.id;
        const node = this.nodes[nodeId];
        const nodeElement = event.target;

        if (!this.startNode && !this.endNode) {
            node.type = 'start';
            this.startNode = node;
            nodeElement.classList.remove('node-regular');
            nodeElement.classList.add('node-start');
        } else if (this.startNode && !this.endNode) {
            if (node.type !== 'start') {
                node.type = 'end';
                this.endNode = node;
                nodeElement.classList.remove('node-regular');
                nodeElement.classList.add('node-end');
            } else {
                node.type = 'regular';
                this.startNode = null;
                nodeElement.classList.remove('node-start');
                nodeElement.classList.add('node-regular');
            }
        } else if (!this.startNode && this.endNode) {
            if (node.type !== 'end') {
                node.type = 'start';
                this.startNode = node;
                nodeElement.classList.remove('node-regular');
                nodeElement.classList.add('node-start');
            } else {
                node.type = 'regular';
                this.endNode = null;
                nodeElement.classList.remove('node-end');
                nodeElement.classList.add('node-regular');
            }
        } else {
            if (node.type === 'start') {
                node.type = 'regular';
                this.startNode = null;
                nodeElement.classList.remove('node-start');
                nodeElement.classList.add('node-regular');
            } else if (node.type === 'end') {
                node.type = 'regular';
                this.endNode = null;
                nodeElement.classList.remove('node-end');
                nodeElement.classList.add('node-regular');
            } else {
                if (this.startEndToggle === 0) {
                    const previousStartNodeElement = document.getElementById(this.startNode.id);
                    previousStartNodeElement.classList.remove('node-start');
                    previousStartNodeElement.classList.add('node-regular');
                    this.startNode.type = 'regular';
                    this.startNode = null;
                    
                    node.type = 'start';
                    this.startNode = node;
                    nodeElement.classList.remove('node-regular');
                    nodeElement.classList.add('node-start');
                    this.startEndToggle = 1;
                } else if (this.startEndToggle === 1) {
                    const previousEndNodeElement = document.getElementById(this.endNode.id);
                    previousEndNodeElement.classList.remove('node-end');
                    previousEndNodeElement.classList.add('node-regular');
                    this.endNode.type = 'regular';
                    this.endNode = null;

                    node.type = 'end';
                    this.endNode = node;
                    nodeElement.classList.remove('node-regular');
                    nodeElement.classList.add('node-end');
                    this.startEndToggle = 0;
                }
            }
        }
    }

    // Handle mouse down event (start dragging)
    handleMouseDown(node, event) {
        node.isDragging = true;
        this.containerRect = this.svg.getBoundingClientRect(); // Get SVG container's bounding box
    }

    // Handle mouse move event (dragging)
    handleMouseMove(event) {
        Object.values(this.nodes).forEach(node => {
            if (node.isDragging) {
                const mouseX = event.clientX - this.containerRect.left;
                const mouseY = event.clientY - this.containerRect.top;
    
                // Update node position
                node.updatePosition(mouseX, mouseY);
    
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
                    console.log(this.adjacencyList.get(node.id));
                });
            }
        });
    }
    

    // Handle mouse up event (stop dragging)
    handleMouseUp() {
        Object.values(this.nodes).forEach(node => {
            node.isDragging = false; // Stop dragging
        });
    }
}
