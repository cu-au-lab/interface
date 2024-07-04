const svg = d3.select("#canvas");

function addCircle() {
    const circle = svg
        .append("circle")
        .attr("cx", Math.random() * 800)
        .attr("cy", Math.random() * 600)
        .attr("r", 40)
        .attr("fill", "blue")
        .call(d3.drag().on("drag", dragged));

    function dragged(event) {
        d3.select(this).attr("cx", event.x).attr("cy", event.y);
    }
}

function addRectangle() {
    const rect = svg
        .append("rect")
        .attr("x", Math.random() * 800)
        .attr("y", Math.random() * 600)
        .attr("width", 80)
        .attr("height", 60)
        .attr("fill", "green")
        .call(d3.drag().on("drag", dragged));

    function dragged(event) {
        d3.select(this).attr("x", event.x).attr("y", event.y);
    }
}
