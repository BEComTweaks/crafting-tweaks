const textures = [
  { src: "images/blocks/plank1.png" },
  { src: "images/blocks/plank2.png" },
  { src: "images/blocks/plank3.png" },
  { src: "images/blocks/plank4.png" },
  { src: "images/blocks/plank5.png" },
];
function selectTexture() {
  const index = Math.floor(Math.random() * textures.length);
  return textures[index].src;
}
function createTiles() {
  const container = document.getElementById("background-container");
  const numColumns = Math.ceil(window.innerWidth / 100) + 2;
  const numRows = Math.ceil(window.innerHeight / 100) + 2;
  container.innerHTML = "";
  for (let i = 0; i < numColumns; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let j = 0; j < numRows; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.style.backgroundImage = `url("${selectTexture()}")`;
      rowDiv.appendChild(tile);
    }
    container.appendChild(rowDiv);
  }
}
createTiles();
window.addEventListener("resize", () => {
  document.getElementById("background-container").innerHTML = "";
  createTiles();
});