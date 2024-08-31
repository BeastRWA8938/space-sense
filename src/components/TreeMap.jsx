import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TreeMap = ({ data, width, height }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .padding(1)(root);

    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .style("fill", d => d3.schemeCategory10[d.data.category % 10]);

    nodes
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .text(d => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", "white");
  }, [data, width, height]);

  return <svg ref={ref} />;
};

export default TreeMap;
