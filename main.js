var id_count = 0
var vertices = new vis.DataSet([]);
var edges = new vis.DataSet([]);

  // create a Network object to display the graph
  const container = document.getElementById('graph');
  const data = {
    nodes: vertices,
    edges: edges
  };

  const options = {};

  const network = new vis.Network(container, data, options);


//GRID
  network.on("beforeDrawing", function(ctx) {

    var width = ctx.canvas.clientWidth;
    var height = ctx.canvas.clientHeight;
    var spacing = 40;
    var gridExtentFactor = 4;
    ctx.strokeStyle = "lightgrey";
    ctx.beginPath();
    for (var x = -width * gridExtentFactor; x <= width * gridExtentFactor; x += spacing) {
      ctx.moveTo(x, height * gridExtentFactor);
      ctx.lineTo(x, -height * gridExtentFactor);
    }
    for (var y = -height * gridExtentFactor; y <= height * gridExtentFactor; y += spacing) {
      ctx.moveTo(width * gridExtentFactor, y);
      ctx.lineTo(-width * gridExtentFactor, y);
    }
    ctx.stroke();
});

//Add Vertex
const addVertexButton = document.getElementById('add-vertex');
addVertexButton.addEventListener('click', function () {
    vertices.add({id: id_count});
    id_count++;
});

window.addEventListener('keydown', function (event) {
  if (labelling === false & (event.key === 'v' || event.key === 'V')) {
    addVertexButton.click();
  }
});

//Add Edge
var deleting = false;
var addingEdge = false;
var simulating = null;
var labelling = false;

const addEdgeButton = document.getElementById('add-edge');

addEdgeButton.addEventListener('click', function() {
  // toggle the state of the button
  vertex1 = null;
  vertex2 = null;
  addingEdge = !addingEdge;
  if (deleting && addingEdge){
    deleting = false;
    deleteButton.classList.toggle('active');
  }
  if (addingEdge) {
    // the user has clicked the "Add Edge" button
    addEdgeButton.classList.add('active');
  } else {
    // the user has clicked the "Add Edge" button again
    addEdgeButton.classList.remove('active');
  }
});
window.addEventListener('keydown', function (event) {
  if (labelling === false & (event.key === 'e' || event.key === 'E')) {
    addEdgeButton.click();
  }
});

// Recenter
const recenterButton = document.getElementById('recenter');
recenterButton.addEventListener('click', function () {
    network.moveTo({
        position: {x:0,y:0},
        scale: 1})
});
window.addEventListener('keydown', function (event) {
  if (labelling === false & (event.key === 'r' || event.key === 'R')) {
    recenterButton.click();
  }
});

// Delete vertices/edges
const deleteButton = document.getElementById('delete');
deleteButton.addEventListener('click', function() {
  // toggle the active class
  deleting = !deleting;
  if (deleting && addingEdge){
    addingEdge = false;
    addEdgeButton.classList.remove('active');
  }
  deleteButton.classList.toggle('active')
});

window.addEventListener('keydown', function (event) {
  if (labelling === false & (event.key === 'd' || event.key === 'D')) {
    deleteButton.click();
  }
});


network.on('click', function(properties) {
  if (addingEdge && properties.nodes.length > 0) {
    // the user is adding an edge and has clicked on a vertex
    if (vertex1 == null) {
      // this is the first vertex
      vertex1 = properties.nodes[0];
    } else {
      // this is the second vertex
      vertex2 = properties.nodes[0];
      // add the edge to the graph
      edges.add({from: vertex1, to: vertex2});
      // update v1 to be the last vertex clicked
      vertex1 = null;
      vertex2 = null;
    }
  }
    // check if the delete button is active
    if (deleting) {
      // delete the vertex or edge
      if (properties.nodes.length > 0) {
        // a vertex was clicked
        data.nodes.remove(properties.nodes[0]);
      } else if (properties.edges.length > 0) {
        // an edge was clicked
        edges.remove(properties.edges[0]);
      }
    }
    if (!simulating && !deleting && !addingEdge && properties.nodes.length > 0){
      labelling = true;
      vertexId = properties.nodes[0]
      const pos = network.getPositions(vertexId);

      var input = document.createElement("input");
      input.className = "label-input";
      input.type = "text";

      // Set the position of the input element to the center of the vertex
      input.style.position = "absolute";
      input.style.left = (event.offsetX + 60) + "px";
      input.style.top = (event.offsetY + 25) + "px";
      input.style.transform = "translate(-50%, -50%)";

      // Set the size and appearance of the input element
      input.style.width = "80px";
      input.style.height = "20px";
      input.style.fontSize = "16px";
      input.style.backgroundColor = "white";
      input.style.borderColor = "black";

      container.appendChild(input);
      input.focus();
    input.addEventListener("keydown", function(event) {
      // if the user pressed the Enter key
      if (event.key === 'Enter') {
        // get the input value
        var label = input.value;
        // update the label of the vertex
        data.nodes.update({id: properties.nodes[0], label: label});
        // remove the input box
        input.style.display = 'none';
        labelling = false;
      }
    })
    input.addEventListener('blur', function() {
      if (input && input.parentNode){
      input.parentNode.removeChild(input);}
      labelling = false;
    })
  }
  if (simulating === 'dfs'){
    depthFirstSearch(properties.nodes[0], adjList);
    simulating = null;
    runAlgorithmButton.classList.remove('active');
  }

 if (simulating === 'bfs'){
  breadthFirstSearch(properties.nodes[0], adjList);
  simulating = null;
  runAlgorithmButton.classList.remove('active');
 }

})

//Algorithms (Undirected graph)
function visit(vertexId){
  let vertex = vertices.get(vertexId);
  if (!vertex.visited){
  vertices.update({id: vertexId, visited: true, color: 'red'});}

}

function getAdjList(){
  var adjList = {};
  for (var i = 0; i < vertices.length; i++) {
    nodeId = (vertices.get()[i]).id;
    adjList[nodeId] = [];
  }
  for (var i = 0; i < edges.length; i++) {
    var edge = edges.get()[i];
    adjList[edge.from].push(edge.to);
    adjList[edge.to].push(edge.from);
  }
  console.log(adjList);
  return adjList;
}

function getNeighbors(vertexId, adjList) {
  console.log(adjList[vertexId])
  return adjList[vertexId]
}

function initialize(){
  vertices.forEach(function(vertex) {
    vertices.update({id: vertex.id, visited: false});
  });
}

async function depthFirstSearch(vertexId, adjList) {
  const neighbors = getNeighbors(vertexId, adjList);
  for (let i = 0; i < neighbors.length; i++) {
    visit(vertexId);
    if (!vertices.get(parseInt(neighbors[i])).visited) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await depthFirstSearch(neighbors[i], adjList);
    }
  }
}

async function breadthFirstSearch(VertexId, adjList) {
  let queue = [VertexId];

  while (queue.length > 0) {
    const currentVertexId = queue.shift();
    const currentVertex = vertices.get(currentVertexId);

    if (!currentVertex.visited) {
      visit(currentVertexId);
      const neighbors = getNeighbors(currentVertexId, adjList);

      for (let i = 0; i < neighbors.length; i++) {
        const neighborVertexId = parseInt(neighbors[i]);
        const neighborVertex = vertices.get(neighborVertexId);
        if (!neighborVertex.visited) {
          queue.push(neighborVertexId);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

const dfsButton = document.getElementById('run-dfs');
const bfsButton = document.getElementById('run-bfs');
const runAlgorithmButton = document.getElementById('run-alg');

dfsButton.addEventListener('click', function() {
  if (simulating === null){
    if (addingEdge){
      addingEdge = false;
      addEdgeButton.classList.remove('active');}
    if (deleting){
      deleting = false;
      deleteButton.classList.remove('active');
    }
    simulating = 'dfs';
    runAlgorithmButton.classList.add('active');
    initialize();
    adjList = getAdjList();}
});

bfsButton.addEventListener('click', function() {
  if (simulating === null){
    if (addingEdge){
      addingEdge = false;
      addEdgeButton.classList.remove('active');}
    if (deleting){
      deleting = false;
      deleteButton.classList.remove('active');
    }
    simulating = 'bfs';
    runAlgorithmButton.classList.add('active');
    initialize();
    adjList = getAdjList();}
});

const buttons = document.getElementsByTagName('button');
for (let button of buttons) {
  button.style.fontFamily = 'Optima, "Segoe UI", Tahoma, sans-serif';
  button.style.fontWeight = '600';
};

const gearButton = document.getElementById('gear-button');
gearButton.classList.add('button-gear-color');

//Popup
const popup = document.getElementById('popup');
const doNotShowAgainCheckbox = document.getElementById('do-not-show-again');

function showPopup() {
  if (!doNotShowAgainCheckbox.checked) {
    popup.classList.remove('popup-hidden');
  }
}

function hidePopup() {
  popup.classList.add('popup-hidden');
}

dfsButton.addEventListener('click', showPopup);
bfsButton.addEventListener('click', showPopup);
popup.addEventListener('click', hidePopup);
doNotShowAgainCheckbox.addEventListener('click', function(event) {
  event.stopPropagation();
});