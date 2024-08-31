import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const EnclosureDisplay = ({ data, width, height }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const root = d3.hierarchy(data)
      .sum(d => d.value);

    const nodes = pack(root).descendants();

    svg.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', d => d.children ? '#bbb' : '#69b3a2')
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

    svg.selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('dy', '0.3em')
      .attr('text-anchor', 'middle')
      .text(d => d.children ? '' : d.data.name)
      .attr('font-size', d => `${Math.min(2 * d.r, (2 * d.r - 8) / d.data.name.length)}px`)
      .attr('fill', '#fff');
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default EnclosureDisplay;
