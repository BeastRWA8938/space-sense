import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './TreeMap.css';

const TreeMap = ({ info, width, height, navigateToDirectory }) => {
  const ref = useRef();
  const tooltipRef = useRef(); // Ref for the tooltip

  useEffect(() => {
    if (!info) return;

    if (tooltipRef.current) {
      d3.select(tooltipRef.current).style('visibility', 'hidden');
    }

    const container = d3.select(ref.current)
      .style('position', 'relative')
      .style('width', `${width}px`)
      .style('height', `${height}px`);

    const treemap = d3.treemap()
      .size([width, height])
      .padding(1);

    const root = d3.hierarchy(info)
      .sum(d => d.value);

    treemap(root);

    const nodes = root.leaves();

    // Define minimum dimensions
    const minWidth = 0;
    const minHeight = 0;

    // Remove any existing nodes
    container.selectAll('div.treemap-node').remove();

    // Create divs for each node with a className and onClick handler
    container.selectAll('div.treemap-node')
      .data(nodes.filter(d => (d.x1 - d.x0) >= minWidth && (d.y1 - d.y0) >= minHeight))
      .enter()
      .append("div")
      .attr("class", "treemap-node")
      .style("left", d => `${d.x0}px`)
      .style("top", d => `${d.y0}px`)
      .style("width", d => `${d.x1 - d.x0}px`)
      .style("height", d => `${d.y1 - d.y0}px`)
      .on("click", (event, d) => {
        // Pass the correct object to navigateToDirectory when a node is clicked
        const file = { name: d.data.name, isDirectory: d.data.isDirectory };
        navigateToDirectory(file);
      })
      .on('mouseover', (event, d) => {
        // Show tooltip on hover
        const tooltip = d3.select(tooltipRef.current);
        const [x, y] = d3.pointer(event, ref.current);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div class="tooltip-content">
              <div class="tooltip-name">${d.data.name}</div>
              <div class="tooltip-size">${d.data.size} ${d.data.sizeType}</div>
            </div>
          `)
          .style('left', `${x + 10}px`)
          .style('top', `${y + 10}px`);
      })
      .on("mousemove", (event) => {
        // Update tooltip position on mouse move
        const [x, y] = d3.pointer(event, ref.current);
        d3.select(tooltipRef.current)
          .style('left', `${x + 10}px`)
          .style('top', `${y + 10}px`);
      })
      .on("mouseout", () => {
        // Hide tooltip when not hovering
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      })
      .append("div")
      .attr("class", "treemap-content")
      .html(d => {
        const icon = d.data.isDirectory ? '📁' : '📄';
        return `${icon} ${d.data.name}`;
      });

    const tooltipEl = tooltipRef.current;
    return () => {
      if (tooltipEl) {
        d3.select(tooltipEl).style('visibility', 'hidden');
      }
    };

  }, [info, width, height, navigateToDirectory]);

  return (
    <div>
      <div ref={ref} />
      {/* Tooltip div always present but hidden until hover */}
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default TreeMap;