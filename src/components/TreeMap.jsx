import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const TreeMap = ({ data, width, height }) => {
  const ref = useRef();

  useEffect(() => {
    // Select the container and set its size
    const container = d3.select(ref.current)
      .style("position", "relative")
      .style("width", `${width}px`)
      .style("height", `${height}px`);

    // Create a hierarchy from the data
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Create the treemap layout
    d3.treemap()
      .size([width, height])
      .padding(3)(root);

    // Remove any existing nodes
    container.selectAll("div").remove();

    // Create divs for each node
    container.selectAll("div")
      .data(root.leaves())
      .enter()
      .append("div")
      .style("position", "absolute")
      .style("left", d => `${d.x0}px`)
      .style("top", d => `${d.y0}px`)
      .style("width", d => `${d.x1 - d.x0}px`)
      .style("height", d => `${d.y1 - d.y0}px`)
      .style("background-color", d => d3.schemeCategory10[d.data.category % 10])
      .style("box-sizing", "border-box")
      .style("border", "1px solid white")
      .append("div")
      .style("padding", "4px")
      .style("font-size", "12px")
      .style("text-align", "center")
      .style("color", "white")
      .style("overflow", "hidden")
      .style("white-space", "nowrap")
      .style("text-overflow", "ellipsis")
      .text(d => d.data.name);

  }, [data, width, height]);

  return <div ref={ref} />;
};

export default TreeMap;
