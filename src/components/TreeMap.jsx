import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import './TreeMap.css';

const TreeMap = ({ info, width, height, navigateToDirectory }) => {
  const ref = useRef();

  useEffect(() => {
    // Select the container and set its size
    const container = d3.select(ref.current)
      .style("position", "relative")
      .style("width", `${width}px`)
      .style("height", `${height}px`);

    // Create a hierarchy from the data
    const root = d3.hierarchy(info)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Create the treemap layout
    d3.treemap()
      .size([width, height])
      .padding(3)(root);

    // Remove any existing nodes
    container.selectAll("div").remove();

    // Create divs for each node with a className
    container.selectAll("div")
      .data(root.leaves())
      .enter()
      .append("div")
      .attr("class", "treemap-node")
      .style("left", d => `${d.x0}px`)
      .style("top", d => `${d.y0}px`)
      .style("width", d => `${d.x1 - d.x0}px`)
      .style("height", d => `${d.y1 - d.y0}px`)
      .on("click", (event, d) => {
        // Pass the name to navigateToDirectory when a node is clicked
        alert("clicked on ${d.data.name}")
        navigateToDirectory(d.data.name);
      })
      .append("div")
      .attr("class", "treemap-content")
      .html(d => `${d.data.name}<br>Size: ${d.data.size} ${d.data.sizeType}`);
  }, [info, width, height, navigateToDirectory]);

  return <div ref={ref} />;
};

export default TreeMap;
