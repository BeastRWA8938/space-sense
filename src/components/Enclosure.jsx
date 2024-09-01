import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import './Enclosure.css'; // Make sure to import the CSS file

const Enclosure = ({ data, width, height }) => {
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

    // Create the pack layout
    d3.pack()
      .size([width, height])
      .padding(2)(root);

    // Remove any existing nodes
    container.selectAll("div").remove();

    // Create divs for each node with a className
    container.selectAll("div")
      .data(root.leaves())
      .enter()
      .append("div")
      .attr("class", "enclosure-node")
      .style("left", d => `${d.x - d.r}px`)
      .style("top", d => `${d.y - d.r}px`)
      .style("width", d => `${d.r * 2}px`)
      .style("height", d => `${d.r * 2}px`)
      .style("border-radius", "50%") // Make each node a circle
      .append("div")
      .attr("class", "enclosure-content")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .html(d => `${d.data.name}<br>Size: ${d.data.totalsize}`);
  }, [data, width, height]);

  return <div ref={ref} />;
};

export default Enclosure;
