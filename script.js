const svg = d3.select("#canvas");
let isDarkMode = false;
let isConnecting = false;
let startShape = null;
let startPoint = null;

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
                .append("g")
                .attr("class", "shape circle")
                .attr("transform", `translate(${x}, ${y})`);
            shape.append("circle").attr("r", 20).attr("fill", "blue");
            break;
        case "ellipse-h":
            shape = svg
                .append("g")
                .attr("class", "shape ellipse-h")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("ellipse")
                .attr("rx", 30)
                .attr("ry", 15)
                .attr("fill", "green");
            break;
        case "ellipse-v":
            shape = svg
                .append("g")
                .attr("class", "shape ellipse-v")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("ellipse")
                .attr("rx", 15)
                .attr("ry", 30)
                .attr("fill", "red");
            break;
        case "square":
            shape = svg
                .append("g")
                .attr("class", "shape square")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("rect")
                .attr("x", -20)
                .attr("y", -20)
                .attr("width", 40)
                .attr("height", 40)
                .attr("fill", "purple");
            break;
        case "triangle":
            shape = svg
                .append("g")
                .attr("class", "shape triangle")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("polygon")
                .attr("points", "0,-20 -20,20 20,20")
                .attr("fill", "orange");
            break;
        case "pentagon":
            shape = svg
                .append("g")
                .attr("class", "shape pentagon")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("polygon")
                .attr("points", calculateRegularPolygonPoints(0, 0, 20, 5))
                .attr("fill", "cyan");
            break;
        case "hexagon":
            shape = svg
                .append("g")
                .attr("class", "shape hexagon")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("polygon")
                .attr("points", calculateRegularPolygonPoints(0, 0, 20, 6))
                .attr("fill", "magenta");
            break;
        case "octagon":
            shape = svg
                .append("g")
                .attr("class", "shape octagon")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("polygon")
                .attr("points", calculateRegularPolygonPoints(0, 0, 20, 8))
                .attr("fill", "yellow");
            break;
        case "trapezoid":
            shape = svg
                .append("g")
                .attr("class", "shape trapezoid")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("polygon")
                .attr("points", "-30,20 30,20 20,-20 -20,-20")
                .attr("fill", "brown");
            break;
        case "section":
            shape = svg
                .append("g")
                .attr("class", "shape section")
                .attr("transform", `translate(${x}, ${y})`);
            shape
                .append("rect")
                .attr("x", -50)
                .attr("y", -30)
                .attr("width", 100)
                .attr("height", 60)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            break;
        case "thread":
            isConnecting = true;
            return;
    }

    addContactPoints(shape);
    shape.call(d3.drag().on("drag", dragged));
}

function addContactPoints(shape) {
    const contactPoints = [
        { x: 0, y: -20, position: "top" },
        { x: 20, y: 0, position: "right" },
        { x: 0, y: 20, position: "bottom" },
        { x: -20, y: 0, position: "left" },
    ];

    shape
        .selectAll(".contact-point")
        .data(contactPoints)
        .enter()
        .append("circle")
        .attr("class", "contact-point")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 3)
        .on("click", function (event, d) {
            if (isConnecting) {
                if (!startShape) {
                    startShape = shape;
                    startPoint = d;
                } else {
                    createThread(startShape, startPoint, shape, d);
                    isConnecting = false;
                    startShape = null;
                    startPoint = null;
                }
            }
        });
}

function createThread(shape1, point1, shape2, point2) {
    const thread = svg
        .append("line")
        .attr("class", "thread")
        .attr(
            "x1",
            parseFloat(shape1.attr("transform").split("(")[1]) + point1.x
        )
        .attr(
            "y1",
            parseFloat(shape1.attr("transform").split("(")[1].split(",")[1]) +
                point1.y
        )
        .attr(
            "x2",
            parseFloat(shape2.attr("transform").split("(")[1]) + point2.x
        )
        .attr(
            "y2",
            parseFloat(shape2.attr("transform").split("(")[1].split(",")[1]) +
                point2.y
        );

    // Update thread positions when shapes are moved
    shape1.on("drag", updateThread);
    shape2.on("drag", updateThread);

    function updateThread() {
        thread
            .attr(
                "x1",
                parseFloat(shape1.attr("transform").split("(")[1]) + point1.x
            )
            .attr(
                "y1",
                parseFloat(
                    shape1.attr("transform").split("(")[1].split(",")[1]
                ) + point1.y
            )
            .attr(
                "x2",
                parseFloat(shape2.attr("transform").split("(")[1]) + point2.x
            )
            .attr(
                "y2",
                parseFloat(
                    shape2.attr("transform").split("(")[1].split(",")[1]
                ) + point2.y
            );
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

function dragged(event, d) {
    d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);
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
