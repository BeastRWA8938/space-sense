import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './EnclosureDisplay.css';

const EnclosureDisplay = ({ info, width, height, navigateToDirectory }) => {
  const divRef = useRef();
  const tooltipRef = useRef();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Memoize the node selection handler
  const handleNodeClick = useCallback((event, d) => {
    event.preventDefault();
    setSelectedNodeId(d.data.id || d.data.name);
    navigateToDirectory(d.data);
  }, [navigateToDirectory]);

  useEffect(() => {
    if (!info) return;

    const container = d3.select(divRef.current)
      .style('position', 'relative')
      .style('width', `${width}px`)
      .style('height', `${height}px`);

    const pack = d3.pack()
      .size([width, height])
      .padding(10);

    const root = d3.hierarchy(info)
      .sum(d => d.value);

    let nodes = pack(root).descendants();

    // Set a minimum radius for the circles
    const minRadius = 10;
    nodes = nodes.map(d => {
      if (d.r < minRadius) {
        d.r = minRadius;
      }
      return d;
    });

    // Remove any existing nodes
    container.selectAll('div.node').remove();

    // Create divs for each node with a className and onClick handler
    container.selectAll('div.node')
      .data(nodes)
      .enter()
      .append('div')
      .attr('class', d => {
        const baseClass = d.children ? 'node parent-node' : 'node child-node';
        const isSelected = d.data.id === selectedNodeId || d.data.name === selectedNodeId;
        return isSelected ? `${baseClass} selected` : baseClass;
      })
      .style('left', d => `${d.x - d.r}px`)
      .style('top', d => `${d.y - d.r}px`)
      .style('width', d => `${2 * d.r}px`)
      .style('height', d => `${2 * d.r}px`)
      .html(d => {
        if (d.depth === 0) return '';
        const icon = d.data.isDirectory ? '📁' : '📄';
        return d.r < 50
          ? icon
          : `<div class="node-text">${icon} ${d.data.name}</div>`;
      })
      .on("click", handleNodeClick)
      .on("mouseover", (event, d) => {
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div class="tooltip-content">
              <div class="tooltip-name">${d.data.name}</div>
              <div class="tooltip-size">${d.data.size} ${d.data.sizeType}</div>
            </div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on("mousemove", (event) => {
        d3.select(tooltipRef.current)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      });

  }, [info, width, height, navigateToDirectory, selectedNodeId, handleNodeClick]);

  return (
    <div>
      <div ref={divRef} />
      <div 
        ref={tooltipRef} 
        className="tooltip" 
        style={{ 
          position: 'absolute', 
          visibility: 'hidden'
        }}
      />
    </div>
  );
};

export default EnclosureDisplay;
