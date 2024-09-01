import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './EnclosureDisplay.css'; // Make sure to import the CSS file

const EnclosureDisplay = ({ data, width, height }) => {
  const divRef = useRef();

  useEffect(() => {
    if (!data) return;

    const container = d3.select(divRef.current)
      .style('position', 'relative')
      .style('width', `${width}px`)
      .style('height', `${height}px`);

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const root = d3.hierarchy(data)
      .sum(d => d.value);

    const nodes = pack(root).descendants();

    // Remove any existing nodes
    container.selectAll('div').remove();

    // Create divs for each node with a className
    container.selectAll('div')
      .data(nodes)
      .enter()
      .append('div')
      .attr('class', d => d.children ? 'node parent-node' : 'node child-node')
      .style('left', d => `${d.x - d.r}px`)
      .style('top', d => `${d.y - d.r}px`)
      .style('width', d => `${2 * d.r}px`)
      .style('height', d => `${2 * d.r}px`)
      .text(d => d.children ? '' : d.data.name);
  }, [data, width, height]);

  return <div ref={divRef} />;
};

export default EnclosureDisplay;
