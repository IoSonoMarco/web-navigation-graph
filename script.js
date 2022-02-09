const canvas = document.getElementById("game-screen");
canvas.width = 600;
canvas.height = 400;
const c = canvas.getContext("2d");

// CONSTANTS
const W = canvas.width;
const H = canvas.height;
xOffset = canvas.getBoundingClientRect().x;
yOffset = canvas.getBoundingClientRect().y;

const controllerState = {
  isMouseDown: false,
  isDragging: false,
};

let canDrag = false;

const mousePosition = {
  x: 0,
  y: 0,
};

let currentKey;

let currentActiveNode;

const content = document.getElementById("content");

class Controller {
  constructor() {
    canvas.addEventListener("mousedown", (event) => {
      controllerState.isMouseDown = true;
      mousePosition.x = event.clientX - xOffset;
      mousePosition.y = event.clientY - yOffset;
    });
    canvas.addEventListener("mouseup", (event) => {
      controllerState.isMouseDown = false;
    });
    canvas.addEventListener("mousemove", (event) => {
      if (!canDrag) return;
      mousePosition.x = event.clientX - xOffset;
      mousePosition.y = event.clientY - yOffset;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key == "Control") canDrag = !canDrag;
    });
    document.addEventListener("keydown", (event) => {
      currentKey = event.key;
    });
  }
}

class Node {
  constructor(id, radius) {
    this.id = id;
    this.radius = radius;
    this.position = { x: W / 2, y: H / 2 };
  }

  draw() {
    c.beginPath();
    c.lineWidth = 1;
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.strokeStyle = "cyan";
    c.fillStyle = "orange";
    c.stroke();
    c.fill();
  }

  update() {
    if (canDrag) {
      if (controllerState.isMouseDown && this.id == currentKey) {
        this.position.x = mousePosition.x;
        this.position.y = mousePosition.y;
      }
      return;
    }

    if (controllerState.isMouseDown) {
      const dx = this.position.x - mousePosition.x;
      const dy = this.position.y - mousePosition.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      if (distance <= this.radius) {
        currentActiveNode = this.id;
      }

      content.innerText = currentActiveNode;
    }
  }
}

class Edge {
  constructor(lineWidth) {
    this.start = { x: null, y: null };
    this.end = { x: null, y: null };
    this.lineWidth = lineWidth;
  }

  draw() {
    c.beginPath();
    c.moveTo(this.start.x, this.start.y);
    c.lineTo(this.end.x, this.end.y);
    c.strokeStyle = "cyan";
    c.lineWidth = this.lineWidth;
    c.stroke();
  }

  update(startNode, endNode) {
    this.start = { x: startNode.position.x, y: startNode.position.y };
    this.end = { x: endNode.position.x, y: endNode.position.y };
  }
}

class MakeGraph {
  constructor(nNodes, edgeList, nodeRadius, edgeWidth) {
    this.nNodes = nNodes;
    this.edgeList = edgeList;
    this.nodeRadius = nodeRadius;
    this.edgeWidth = edgeWidth;
    this.nodeInstanceArray = [];
    this.edgeInstanceArray = [];
  }

  init() {
    for (let i = 1; i <= this.nNodes; i++) {
      this.nodeInstanceArray.push(new Node(i, this.nodeRadius));
    }

    for (let i = 1; i <= this.edgeList.length; i++) {
      this.edgeInstanceArray.push(new Edge(this.edgeWidth));
    }
  }

  draw() {
    this.drawNodes();
    this.drawEdges();
  }

  update() {
    this.updateNodes();
    this.updateEdges();
  }

  drawNodes() {
    this.nodeInstanceArray.forEach((node) => {
      node.draw();
    });
  }

  drawEdges() {
    c.globalCompositeOperation = "destination-over";
    this.edgeInstanceArray.forEach((edge) => {
      edge.draw();
    });
  }

  updateNodes() {
    this.nodeInstanceArray.forEach((node) => {
      node.update();
    });
  }

  updateEdges() {
    let k = 0;
    this.edgeInstanceArray.forEach((edge) => {
      edge.update(
        this.nodeInstanceArray.filter(
          (node) => node.id == this.edgeList[k][0]
        )[0],
        this.nodeInstanceArray.filter(
          (node) => node.id == this.edgeList[k][1]
        )[0]
      );
      k++;
    });
  }
}

let controller = new Controller();
const graphManager = new MakeGraph(
  5,
  [
    [1, 2],
    [1, 3],
    [1, 4],
    [4, 5],
  ],
  20,
  5
);
graphManager.init();

let lastTime = 0;
const animate = (timeStamp) => {
  const dt = timeStamp - lastTime;
  lastTime = timeStamp;

  c.clearRect(0, 0, W, H);
  graphManager.draw();
  graphManager.update();

  requestAnimationFrame(animate);
};
animate();
