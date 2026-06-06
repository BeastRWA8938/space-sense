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

  // Main rendering effect (omits selectedNodeId from dependencies)
  useEffect(() => {
    if (!info) return;

    if (tooltipRef.current) {
      d3.select(tooltipRef.current).style('visibility', 'hidden');
    }

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
      .attr('class', d => d.children ? 'node parent-node' : 'node child-node')
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
        const [x, y] = d3.pointer(event, divRef.current);
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
        const [x, y] = d3.pointer(event, divRef.current);
        d3.select(tooltipRef.current)
          .style('left', `${x + 10}px`)
          .style('top', `${y + 10}px`);
      })
      .on("mouseout", () => {
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      });

    const tooltipEl = tooltipRef.current;
    // Clean up tooltip state when components unmount or data changes
    return () => {
      if (tooltipEl) {
        d3.select(tooltipEl).style('visibility', 'hidden');
      }
    };
  }, [info, width, height, navigateToDirectory, handleNodeClick]); // selectedNodeId is omitted

  // Separate effect: updates styles directly, taking only O(N) instead of rebuilding the DOM
  useEffect(() => {
    if (!divRef.current) return;
    d3.select(divRef.current)
      .selectAll('div.node')
      .classed('selected', d => {
        const nodeId = d.data.id || d.data.name;
        return nodeId === selectedNodeId;
      });
  }, [selectedNodeId]);

  return (
    <div>
      <div ref={divRef} />
      <div ref={tooltipRef} className="tooltip" />
    </div>
  );
};

export default EnclosureDisplay;
