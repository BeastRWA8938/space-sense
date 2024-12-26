import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './EnclosureDisplay.css';

const EnclosureDisplay = ({ info, width, height, navigateToDirectory }) => {
  const divRef = useRef();
  const tooltipRef = useRef(); // Ref for the tooltip

  useEffect(() => {
    if (!info) return;

    const container = d3.select(divRef.current)
      .style('position', 'relative')
      .style('width', `${width}px`)
      .style('height', `${height}px`);

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const root = d3.hierarchy(info)
      .sum(d => d.value);

    let nodes = pack(root).descendants();

    // Set a minimum radius for the circles
    const minRadius = 50;
    nodes = nodes.filter(d => d.r >= minRadius);

    // Remove any existing nodes
    container.selectAll('div.node').remove();

    // Create divs for each node with a className and onClick handler
    container.selectAll('div.node')
      .data(nodes)
      .enter()
      .append('div')
      .attr('class', d => d.children ? 'node parent-node' : 'node child-node')
      .style('left', d => `${d.x - d.r}px`)
      .style('top', d => `${d.y - d.r}px`)
      .style('width', d => `${2 * d.r}px`)
      .style('height', d => `${2 * d.r}px`)
      .html(d => {
        // Show icon for small circles and name for larger ones
        return d.r < 50 
          ? d.children ? '📁' : '📄' // Folder or file icon based on hierarchy
          : `${d.data.name}`; // Show name if the circle is large enough
      })
      .on("click", (event, d) => {
        navigateToDirectory(d.data.name);
        // Add onClick effect: change background color
        d3.select(event.currentTarget)
          .style('background-color', 'lightblue');
      })
      .on("mouseover", (event, d) => {
        // Show tooltip on hover
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('visibility', 'visible')
          .html(`Name: ${d.data.name}<br>Size: ${d.data.size} ${d.data.sizeType}`)
          .style('left', `${event.pageX + 10}px`) // Offset tooltip by 10px right
          .style('top', `${event.pageY + 10}px`);  // Offset tooltip by 10px down
      })
      .on("mousemove", (event) => {
        // Update tooltip position on mouse move
        d3.select(tooltipRef.current)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        // Hide tooltip when not hovering
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      });

  }, [info, width, height, navigateToDirectory]);

  return (
    <div>
      <div ref={divRef} />
      {/* Tooltip div always present but hidden until hover */}
      <div ref={tooltipRef} className="tooltip" style={{ position: 'absolute', visibility: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '4px', padding: '5px', pointerEvents: 'none' }}></div>
    </div>
  );
};

export default EnclosureDisplay;
