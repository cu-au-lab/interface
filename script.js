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
    const x = width - 50; // Spawn near bottom right
    const y = height - 50;

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
        case "ellipse-h":
            shape = svg
                .append("ellipse")
                .attr("cx", x)
                .attr("cy", y)
                .attr("rx", 30)
                .attr("ry", 15)
                .attr("fill", "green");
            break;
        case "ellipse-v":
            shape = svg
                .append("ellipse")
                .attr("cx", x)
                .attr("cy", y)
                .attr("rx", 15)
                .attr("ry", 30)
                .attr("fill", "red");
            break;
        case "square":
            shape = svg
                .append("rect")
                .attr("x", x - 20)
                .attr("y", y - 20)
                .attr("width", 40)
                .attr("height", 40)
                .attr("fill", "purple");
            break;
        case "triangle":
            shape = svg
                .append("polygon")
                .attr(
                    "points",
                    `${x},${y - 20} ${x - 20},${y + 20} ${x + 20},${y + 20}`
                )
                .attr("fill", "orange");
            break;
        case "pentagon":
            shape = svg
                .append("polygon")
                .attr("points", calculateRegularPolygonPoints(x, y, 20, 5))
                .attr("fill", "cyan");
            break;
        case "hexagon":
            shape = svg
                .append("polygon")
                .attr("points", calculateRegularPolygonPoints(x, y, 20, 6))
                .attr("fill", "magenta");
            break;
        case "octagon":
            shape = svg
                .append("polygon")
                .attr("points", calculateRegularPolygonPoints(x, y, 20, 8))
                .attr("fill", "yellow");
            break;
        case "trapezoid":
            shape = svg
                .append("polygon")
                .attr(
                    "points",
                    `${x - 30},${y + 20} ${x + 30},${y + 20} ${x + 20},${
                        y - 20
                    } ${x - 20},${y - 20}`
                )
                .attr("fill", "brown");
            break;
        case "section":
            shape = svg
                .append("rect")
                .attr("x", x - 50)
                .attr("y", y - 30)
                .attr("width", 100)
                .attr("height", 60)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            break;
    }

    if (shapeType === "section") {
        shape.call(d3.drag().on("drag", draggedSection));
    } else {
        shape.call(d3.drag().on("drag", dragged));
    }
}

function calculateRegularPolygonPoints(cx, cy, r, n) {
    let points = [];
    for (let i = 0; i < n; i++) {
        let angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return points.join(" ");
}

function dragged(event) {
    const shape = d3.select(this);
    if (
        shape.node().tagName === "circle" ||
        shape.node().tagName === "ellipse"
    ) {
        shape.attr("cx", event.x).attr("cy", event.y);
    } else if (shape.node().tagName === "rect") {
        shape
            .attr("x", event.x - parseFloat(shape.attr("width")) / 2)
            .attr("y", event.y - parseFloat(shape.attr("height")) / 2);
    } else {
        const currentPoints = shape.attr("points").split(" ");
        const dx =
            event.x -
            (parseFloat(currentPoints[0].split(",")[0]) +
                parseFloat(currentPoints[2].split(",")[0])) /
                2;
        const dy =
            event.y -
            (parseFloat(currentPoints[0].split(",")[1]) +
                parseFloat(currentPoints[2].split(",")[1])) /
                2;
        const newPoints = currentPoints.map((point) => {
            const [x, y] = point.split(",");
            return `${parseFloat(x) + dx},${parseFloat(y) + dy}`;
        });
        shape.attr("points", newPoints.join(" "));
    }
}

function draggedSection(event) {
    const shape = d3.select(this);
    shape
        .attr("x", event.x - parseFloat(shape.attr("width")) / 2)
        .attr("y", event.y - parseFloat(shape.attr("height")) / 2);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
    const icon = isDarkMode ? "sun" : "moon";
    document.getElementById("darkModeIcon").src = `./icons/${icon}.svg`;
}

document
    .getElementById("darkModeToggle")
    .addEventListener("click", toggleDarkMode);

// Export functionality to be implemented later
document.getElementById("exportButton").addEventListener("click", () => {
    console.log("Export functionality to be implemented");
});
