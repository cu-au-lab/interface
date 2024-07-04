const svg = d3.select("#canvas");
let isDarkMode = false;

// Resize canvas
function resizeCanvas() {
    const main = document.querySelector("main");
    const width =
        main.clientWidth -
        27 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const height = main.clientHeight;
    svg.attr("width", width).attr("height", height);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function addShape(shapeType) {
    const width = parseFloat(svg.attr("width"));
    const height = parseFloat(svg.attr("height"));
    const x = Math.random() * width;
    const y = Math.random() * height;

    let shape;
    switch (shapeType) {
        case "circle":
            shape = svg
                .append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 20)
                .attr("fill", "blue");
            break;
        case "rectangle":
            shape = svg
                .append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 40)
                .attr("height", 30)
                .attr("fill", "green");
            break;
        case "triangle":
            shape = svg
                .append("polygon")
                .attr(
                    "points",
                    `${x},${y} ${x - 20},${y + 30} ${x + 20},${y + 30}`
                )
                .attr("fill", "red");
            break;
        case "parallelogram":
            shape = svg
                .append("polygon")
                .attr(
                    "points",
                    `${x},${y} ${x + 40},${y} ${x + 30},${y + 30} ${x - 10},${
                        y + 30
                    }`
                )
                .attr("fill", "purple");
            break;
        case "rhombus":
            shape = svg
                .append("polygon")
                .attr(
                    "points",
                    `${x},${y - 20} ${x + 20},${y} ${x},${y + 20} ${
                        x - 20
                    },${y}`
                )
                .attr("fill", "orange");
            break;
    }

    shape.call(d3.drag().on("drag", dragged));

    function dragged(event) {
        const shape = d3.select(this);
        if (shapeType === "circle") {
            shape.attr("cx", event.x).attr("cy", event.y);
        } else if (shapeType === "rectangle") {
            shape.attr("x", event.x).attr("y", event.y);
        } else {
            const currentPoints = shape.attr("points").split(" ");
            const dx = event.x - parseFloat(currentPoints[0]);
            const dy = event.y - parseFloat(currentPoints[1]);
            const newPoints = currentPoints.map((point, index) => {
                const [x, y] = point.split(",");
                return index % 2 === 0
                    ? parseFloat(x) + dx
                    : parseFloat(y) + dy;
            });
            shape.attr("points", newPoints.join(" "));
        }
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
    const icon = isDarkMode ? "moon" : "sun";
    document
        .querySelector("#darkModeToggle i")
        .setAttribute("data-feather", icon);
    feather.replace();
}

document
    .getElementById("darkModeToggle")
    .addEventListener("click", toggleDarkMode);

// Initialize Feather icons
feather.replace();

// Export functionality to be implemented later
document.getElementById("exportButton").addEventListener("click", () => {
    console.log("Export functionality to be implemented");
});
