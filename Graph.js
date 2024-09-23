// Graph.js
import { Node } from './Node.js';

export class Graph {
    constructor() {
        this.nodes = {}; // To store nodes by their ID
        this.adjacencyList = new Map(); // Private adjacency list
        this.svg = null; // SVG element for edges
        this.graphContainer = null; // Container for buttons and svg element
        this.containerRect = null; // absolute positioning of graphContainer in DOM
    }

    // Initialize the graph with SVG and container for buttons
    init(svgId, containerId) {
        this.svg = document.getElementById(svgId); // SVG for edges
        this.graphContainer = document.getElementById(containerId); // Container for buttons
    }

    // Add a node (button) to the graph
    addNode(node) {
        if (!this.nodes[node.id]) {
            this.nodes[node.id] = node;
            this.adjacencyList.set(node.id, []); // Initialize adjacency list for the node

            // Create the button element for the node
            const nodeButton = document.createElement('button');
            nodeButton.classList.add('node');
            nodeButton.id = node.id;
            nodeButton.style.left = `${node.x}px`;
            nodeButton.style.top = `${node.y}px`;
            nodeButton.innerText = node.id;

            // Add event listeners for dragging
            nodeButton.addEventListener('mousedown', this.handleMouseDown.bind(this, node));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));

            // Append the button to the container
            this.graphContainer.appendChild(nodeButton);
        }
    }

    // Add an edge between two nodes based on their physical distance
    addEdge(node1Id, node2Id) {
        const node1 = this.nodes[node1Id];
        const node2 = this.nodes[node2Id];

        if (node1 && node2) {
            const distance = node1.getDistanceTo(node2); // Calculate weight based on distance
            this.adjacencyList.get(node1Id).push({ node: node2Id, weight: distance });
            this.adjacencyList.get(node2Id).push({ node: node1Id, weight: distance }); // Bidirectional

            // Draw the edge in the SVG
            this.drawEdge(node1Id, node2Id);
        }
    }

    // Draw an edge between two nodes in the SVG
    drawEdge(node1Id, node2Id) {
        const node1 = this.nodes[node1Id];
        const node2 = this.nodes[node2Id];

        // Create an SVG line element
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", node1.x); // Offset to center of the node
        line.setAttribute("y1", node1.y);
        line.setAttribute("x2", node2.x);
        line.setAttribute("y2", node2.y);
        line.setAttribute("stroke", "black");

        // Append the line to the SVG
        this.svg.appendChild(line);
    }

    // Redraw the edges after node movement
    redrawEdges() {
        // Clear existing SVG lines
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }

        // Redraw all edges
        this.adjacencyList.forEach((edges, nodeId) => {
            edges.forEach(edge => {
                this.drawEdge(nodeId, edge.node);
            });
        });
    }

    // Handle mouse down event (start dragging)
    handleMouseDown(node, event) {
        node.isDragging = true;
        this.containerRect = this.graphContainer.getBoundingClientRect();
    }

    // Handle mouse move event (dragging)
    handleMouseMove(event) {
        Object.values(this.nodes).forEach(node => {
            if (node.isDragging) {
                
                const mouseX = event.clientX - this.containerRect.left;
                const mouseY = event.clientY - this.containerRect.top;

                // Update node position
                node.updatePosition(mouseX, mouseY);

                // Update button position
                const nodeButton = document.getElementById(node.id);
                nodeButton.style.left = `${node.x}px`;
                nodeButton.style.top = `${node.y}px`;

                // Redraw edges with updated node positions
                this.redrawEdges();
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
