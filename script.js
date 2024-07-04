const svg = d3.select("#canvas");
let isDarkMode = false;
let selectedShape = null;

const shapeSize = 40; // Base size for all shapes

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
    const x = width - shapeSize;
    const y = height - shapeSize;

    const shapeColor = isDarkMode ? "white" : "black";
    const shape = createShape(x, y, shapeType, shapeColor);

    addContactPoints(shape);
    addResizeHandles(shape);
    shape.call(d3.drag().on("drag", dragged));
    shape.on("click", shapeClicked);
    centerShape(shape);
}

function createShape(x, y, shapeType, color) {
    const group = svg
        .append("g")
        .attr("class", `shape ${shapeType}`)
        .attr("transform", `translate(${x}, ${y})`)
        .attr("data-scale", "1");

    let shapeElement;
    switch (shapeType) {
        case "circle":
            shapeElement = group.append("circle").attr("r", shapeSize / 2);
            break;
        case "ellipse-h":
            shapeElement = group
                .append("ellipse")
                .attr("rx", shapeSize / 2)
                .attr("ry", shapeSize / 4);
            break;
        case "ellipse-v":
            shapeElement = group
                .append("ellipse")
                .attr("rx", shapeSize / 4)
                .attr("ry", shapeSize / 2);
            break;
        case "square":
            shapeElement = group
                .append("rect")
                .attr("width", shapeSize)
                .attr("height", shapeSize);
            break;
        case "triangle":
            shapeElement = group
                .append("polygon")
                .attr(
                    "points",
                    `0,${shapeSize} ${
                        shapeSize / 2
                    },0 ${shapeSize},${shapeSize}`
                );
            break;
        case "pentagon":
        case "hexagon":
        case "octagon":
            const sides = { pentagon: 5, hexagon: 6, octagon: 8 }[shapeType];
            shapeElement = group
                .append("polygon")
                .attr(
                    "points",
                    calculateRegularPolygonPoints(
                        shapeSize / 2,
                        shapeSize / 2,
                        shapeSize / 2,
                        sides
                    )
                );
            break;
        case "trapezoid":
            shapeElement = group
                .append("polygon")
                .attr(
                    "points",
                    `${shapeSize * 0.2},${shapeSize} ${
                        shapeSize * 0.8
                    },${shapeSize} ${shapeSize},0 0,0`
                );
            break;
        case "section":
            shapeElement = group
                .append("rect")
                .attr("width", shapeSize * 2)
                .attr("height", shapeSize)
                .attr("fill", "none")
                .attr("stroke-width", 2);
            break;
    }

    if (shapeType === "section") {
        shapeElement.attr("stroke", color);
    } else {
        shapeElement.attr("fill", color);
    }

    return group;
}

function addContactPoints(shape) {
    const contactPoints = [
        { x: shapeSize / 2, y: 0, position: "top" },
        { x: shapeSize, y: shapeSize / 2, position: "right" },
        { x: shapeSize / 2, y: shapeSize, position: "bottom" },
        { x: 0, y: shapeSize / 2, position: "left" },
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
        .style("display", "none")
        .call(
            d3
                .drag()
                .on("start", dragStarted)
                .on("drag", draggingPoint)
                .on("end", dragEnded)
        );
}

function dragStarted(event, d) {
    d3.select(this).raise().attr("r", 5);
}

function draggingPoint(event, d) {
    const shape = d3.select(this.parentNode);
    const scale = parseFloat(shape.attr("data-scale"));
    const [shapeX, shapeY] = shape
        .attr("transform")
        .match(/translate\(([^)]+)\)/)[1]
        .split(",")
        .map(parseFloat);

    const x = (event.x - shapeX) / scale;
    const y = (event.y - shapeY) / scale;

    d3.select(this).attr("cx", x).attr("cy", y);
    updateConnectedLines(shape);
}

function dragEnded(event, d) {
    d3.select(this).attr("r", 3);
    const point = d3.select(this);
    const shape = d3.select(this.parentNode);
    const nearestPoint = findNearestContactPoint(
        event.x,
        event.y,
        shape.node()
    );

    if (nearestPoint) {
        createConnection(
            shape.node(),
            point.node(),
            d3.select(nearestPoint.parentNode).node(),
            nearestPoint
        );
    }
}

function updateIconColors() {
    const color = isDarkMode ? "white" : "black";
    d3.select("#clearAllIcon").style(
        "filter",
        isDarkMode ? "invert(1)" : "none"
    );
    d3.select("#darkModeIcon").style(
        "filter",
        isDarkMode ? "invert(1)" : "none"
    );
    d3.select("#exportIcon").style("filter", isDarkMode ? "invert(1)" : "none");
}

function findNearestContactPoint(x, y, excludeShape) {
    let nearestPoint = null;
    let minDistance = Infinity;

    svg.selectAll(".contact-point").each(function () {
        if (this.parentNode === excludeShape) return;

        const point = d3.select(this);
        const shape = d3.select(this.parentNode);
        const [shapeX, shapeY] = shape
            .attr("transform")
            .match(/translate\(([^)]+)\)/)[1]
            .split(",")
            .map(parseFloat);
        const scale = parseFloat(shape.attr("data-scale"));

        const pointX = shapeX + parseFloat(point.attr("cx")) * scale;
        const pointY = shapeY + parseFloat(point.attr("cy")) * scale;

        const distance = Math.hypot(x - pointX, y - pointY);

        if (distance < minDistance && distance < 20) {
            minDistance = distance;
            nearestPoint = point.node();
        }
    });

    return nearestPoint;
}

function createConnection(fromShape, fromPoint, toShape, toPoint) {
    const getShapeInfo = (shape, point) => {
        const [shapeX, shapeY] = d3
            .select(shape)
            .attr("transform")
            .match(/translate\(([^)]+)\)/)[1]
            .split(",")
            .map(parseFloat);
        const scale = parseFloat(d3.select(shape).attr("data-scale"));
        return {
            x: shapeX + parseFloat(d3.select(point).attr("cx")) * scale,
            y: shapeY + parseFloat(d3.select(point).attr("cy")) * scale,
        };
    };

    const from = getShapeInfo(fromShape, fromPoint);
    const to = getShapeInfo(toShape, toPoint);

    svg.append("line")
        .attr("class", "connection-line")
        .attr("x1", from.x)
        .attr("y1", from.y)
        .attr("x2", to.x)
        .attr("y2", to.y)
        .attr("stroke", isDarkMode ? "white" : "black")
        .attr("data-from", fromShape.id)
        .attr("data-to", toShape.id);
}

function addResizeHandles(shape) {
    const handles = [
        { x: 0, y: 0 },
        { x: shapeSize, y: 0 },
        { x: shapeSize, y: shapeSize },
        { x: 0, y: shapeSize },
    ];

    shape
        .selectAll(".resize-handle")
        .data(handles)
        .enter()
        .append("circle")
        .attr("class", "resize-handle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 5)
        .attr("fill", "blue")
        .style("display", "none")
        .call(d3.drag().on("drag", resized));
}

function resized(event, d) {
    const shape = d3.select(this.parentNode);
    const currentScale = parseFloat(shape.attr("data-scale"));
    const newScale = Math.max(0.5, Math.min(3, currentScale + event.dx / 100));

    shape.attr("data-scale", newScale);
    shape
        .select("*:not(.resize-handle):not(.contact-point)")
        .attr("transform", `scale(${newScale})`);

    shape.selectAll(".resize-handle, .contact-point").each(function () {
        const elem = d3.select(this);
        elem.attr(
            "cx",
            (parseFloat(elem.attr("cx")) / currentScale) * newScale
        ).attr("cy", (parseFloat(elem.attr("cy")) / currentScale) * newScale);
    });

    updateConnectedLines(shape);
}

function updateConnectedLines(shape) {
    const [shapeX, shapeY] = shape
        .attr("transform")
        .match(/translate\(([^)]+)\)/)[1]
        .split(",")
        .map(parseFloat);
    const scale = parseFloat(shape.attr("data-scale"));

    svg.selectAll(".connection-line")
        .filter(function () {
            return (
                this.getAttribute("data-from") === shape.node().id ||
                this.getAttribute("data-to") === shape.node().id
            );
        })
        .each(function () {
            const line = d3.select(this);
            const pointSelector =
                line.attr("data-from") === shape.node().id ? "x1" : "x2";
            const point = shape.select(
                `.contact-point[cx="${line.attr(
                    pointSelector
                )}"][cy="${line.attr(pointSelector.replace("x", "y"))}"]`
            );
            if (!point.empty()) {
                line.attr(
                    pointSelector,
                    shapeX + parseFloat(point.attr("cx")) * scale
                ).attr(
                    pointSelector.replace("x", "y"),
                    shapeY + parseFloat(point.attr("cy")) * scale
                );
            }
        });
}

function calculateRegularPolygonPoints(cx, cy, r, n) {
    return Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(" ");
}

function dragged(event, d) {
    const shape = d3.select(this);
    const [x, y] = shape
        .attr("transform")
        .match(/translate\(([^)]+)\)/)[1]
        .split(",")
        .map(parseFloat);
    shape.attr("transform", `translate(${x + event.dx}, ${y + event.dy})`);
    updateConnectedLines(shape);
}

function shapeClicked(event, d) {
    if (selectedShape) {
        selectedShape
            .selectAll(".contact-point, .resize-handle")
            .style("display", "none");
    }
    selectedShape = d3.select(this);
    selectedShape
        .selectAll(".contact-point, .resize-handle")
        .style("display", "block");
    selectedShape.raise();
}

function centerShape(shape) {
    const canvasWidth = parseFloat(svg.attr("width"));
    const canvasHeight = parseFloat(svg.attr("height"));
    const x = (canvasWidth - shapeSize) / 2;
    const y = (canvasHeight - shapeSize) / 2;
    shape.attr("transform", `translate(${x}, ${y})`);
}

function updateShapeColors() {
    const color = isDarkMode ? "white" : "black";
    svg.selectAll(".shape").each(function () {
        const shape = d3.select(this);
        const shapeElement = shape.select(
            "*:not(.resize-handle):not(.contact-point)"
        );
        shapeElement.attr(
            shapeElement.attr("fill") !== "none" ? "fill" : "stroke",
            color
        );
    });
    svg.selectAll(".connection-line").attr("stroke", color);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.getElementById("darkModeIcon").src = `./icons/${
        isDarkMode ? "sun" : "moon"
    }.svg`;
    updateShapeColors();
    updateIconColors();
}

document
    .getElementById("darkModeToggle")
    .addEventListener("click", toggleDarkMode);

document.getElementById("exportButton").addEventListener("click", () => {
    console.log("Export functionality to be implemented");
});

function addClearAllButton() {
    const clearAllButton = d3
        .select("body")
        .append("button")
        .attr("id", "clearAllButton")
        .style("position", "fixed")
        .style("bottom", "20px")
        .style("right", "20px")
        .style("z-index", "1000")
        .style("background", "none")
        .style("border", "none")
        .style("cursor", "pointer");

    clearAllButton
        .append("img")
        .attr("src", "./icons/clear.svg")
        .attr("alt", "Clear All")
        .attr("id", "clearAllIcon")
        .style("width", "24px")
        .style("height", "24px");

    clearAllButton.on("click", clearAll);
}

function clearAll() {
    svg.selectAll("*").remove();
    selectedShape = null;
}

addClearAllButton();

document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && selectedShape) {
        deleteSelectedShape();
    }
});

function deleteSelectedShape() {
    if (selectedShape) {
        svg.selectAll(".connection-line")
            .filter(function () {
                return (
                    this.getAttribute("data-from") ===
                        selectedShape.node().id ||
                    this.getAttribute("data-to") === selectedShape.node().id
                );
            })
            .remove();

        selectedShape.remove();
        selectedShape = null;
    }
}

resizeCanvas();

svg.on("click", function (event) {
    if (event.target === this && selectedShape) {
        selectedShape
            .selectAll(".contact-point, .resize-handle")
            .style("display", "none");
        selectedShape = null;
    }
});

addClearAllButton();
