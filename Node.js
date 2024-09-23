// Node.js
export class Node {
    constructor(id, x, y) {
        this.id = id; // Unique identifier for the node
        this.x = x;   // X-coordinate on the screen
        this.y = y;   // Y-coordinate on the screen
    }

    // Get the distance to another node
    getDistanceTo(otherNode) {
        const dx = this.x - otherNode.x;
        const dy = this.y - otherNode.y;
        return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
    }

    // Update the position of the node
    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}
