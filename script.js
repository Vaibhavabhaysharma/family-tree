let data = JSON.parse(localStorage.getItem("familyTree")) 
          || await fetch("data.json").then(r => r.json());

const width = 1200, height = 600;

const svg = d3.select("#tree")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", e => svg.attr("transform", e.transform)))
  .append("g");

let selectedNode = null;

function update() {
  svg.selectAll("*").remove();

  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([width - 200, height - 200]);
  treeLayout(root);

  svg.selectAll("line")
    .data(root.links())
    .enter()
    .append("line")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#555");

  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on("click", (e, d) => selectNode(d.data));

  node.append("rect")
    .attr("width", 120)
    .attr("height", 50)
    .attr("rx", 8);

  node.append("text")
    .attr("x", 10)
    .attr("y", 20)
    .text(d => d.data.name);

  node.append("text")
    .attr("x", 100)
    .attr("y", 20)
    .text("+")
    .style("cursor", "pointer")
    .on("click", (e, d) => {
      e.stopPropagation();
      d.data.children = d.data.children || [];
      d.data.children.push({ name: "New Person", relation: "", children: [] });
      save();
    });
}

function selectNode(node) {
  selectedNode = node;
  document.getElementById("name").value = node.name || "";
  document.getElementById("dob").value = node.dob || "";
  document.getElementById("relation").value = node.relation || "";
}

function saveNode() {
  if (!selectedNode) return;
  selectedNode.name = name.value;
  selectedNode.dob = dob.value;
  selectedNode.relation = relation.value;
  save();
}

function save() {
  localStorage.setItem("familyTree", JSON.stringify(data));
  update();
}

update();
