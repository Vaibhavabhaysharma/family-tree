const width = 1400;
const height = 650;

let selectedNode = null;

let data = JSON.parse(localStorage.getItem("familyTree"));

if (!data) {
  fetch("data.json")
    .then(res => res.json())
    .then(json => {
      data = json;
      save();
    });
}

const svgRoot = d3.select("#tree")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svgRoot.append("g");

svgRoot.call(
  d3.zoom().on("zoom", (event) => {
    g.attr("transform", event.transform);
  })
);

function update() {
  g.selectAll("*").remove();

  const root = d3.hierarchy(data);
  d3.tree().size([width - 200, height - 200])(root);

  g.selectAll("line")
    .data(root.links())
    .enter()
    .append("line")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#555");

  const node = g.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x - 60},${d.y - 30})`)
    .on("click", (e, d) => {
      e.stopPropagation();
      selectNode(d.data);
    });

  node.append("rect")
    .attr("width", 140)
    .attr("height", 60);

  node.append("image")
    .attr("href", d => d.data.photo || "images/default.png")
    .attr("x", 5)
    .attr("y", 5)
    .attr("width", 40)
    .attr("height", 40);

  node.append("text")
    .attr("x", 50)
    .attr("y", 22)
    .text(d => d.data.name);

  node.append("text")
    .attr("x", 120)
    .attr("y", 22)
    .text("+")
    .style("cursor", "pointer")
    .on("click", (e, d) => {
      e.stopPropagation();
      d.data.children = d.data.children || [];
      d.data.children.push({
        id: crypto.randomUUID(),
        name: "New Person",
        relation: "",
        dob: "",
        photo: "images/default.png",
        children: []
      });
      save();
    });
}

function selectNode(node) {
  selectedNode = node;
  name.value = node.name || "";
  dob.value = node.dob || "";
  relation.value = node.relation || "";
  photo.value = node.photo || "";
}

function saveNode() {
  if (!selectedNode) return;
  selectedNode.name = name.value;
  selectedNode.dob = dob.value;
  selectedNode.relation = relation.value;
  selectedNode.photo = photo.value || "images/default.png";
  save();
}

function save() {
  localStorage.setItem("familyTree", JSON.stringify(data));
  update();
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "family-tree.json";
  a.click();
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data = JSON.parse(reader.result);
    save();
  };
  reader.readAsText(file);
}

setTimeout(update, 300);
