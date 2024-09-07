import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './EnclosureDisplay.css';

const EnclosureDisplay = ({ info, width, height, navigateToDirectory }) => {
  const divRef = useRef();
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

    const nodes = pack(root).descendants();

    // Remove any existing nodes
    container.selectAll('div').remove();

    // Create divs for each node with a className and onClick handler
    container.selectAll('div')
      .data(nodes)
      .enter()
      .append('div')
      .attr('class', d => d.children ? 'node parent-node' : 'node child-node')
      .style('left', d => `${d.x - d.r}px`)
      .style('top', d => `${d.y - d.r}px`)
      .style('width', d => `${2 * d.r}px`)
      .style('height', d => `${2 * d.r}px`)
      .html(d => `${d.data.name}<br>Size: ${d.data.size} ${d.data.sizeType}`)
      .on("click", (event, d) => {
        // Pass the name to navigateToDirectory when a node is clicked
        navigateToDirectory(d.data.name);
      })
  }, [info, width, height,navigateToDirectory]);

  return <div ref={divRef} />;
};

export default EnclosureDisplay;
