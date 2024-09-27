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
    }

    // Initialize the graph with SVG container
    init(svgId) {
        this.svg = document.getElementById(svgId); // SVG for edges and nodes
    }

    // Add a node (SVG <circle>) to the graph
    addNode(node) {
        if (!this.nodes[node.id]) {
            this.nodes[node.id] = node;
            this.adjacencyList.set(node.id, []); // Initialize adjacency list for the node

            // Create the SVG circle element for the node
            const nodeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            nodeCircle.classList.add('node-regular');
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
            this.adjacencyList.get(node1Id).push({ node: node2Id, weight: distance });
            this.adjacencyList.get(node2Id).push({ node: node1Id, weight: distance }); // Bidirectional
    
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

        // to-do
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
    
                // Update only the edges connected to the node
                this.adjacencyList.get(node.id).forEach(edge => {
                    this.updateEdgePosition(node.id, edge.node);
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
