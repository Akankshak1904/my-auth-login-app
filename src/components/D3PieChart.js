import React, { useEffect } from 'react';
import * as d3 from 'd3';

const D3PieChart = ({ data }) => {
  useEffect(() => {
    d3.select("#pieChart").selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#pieChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.value);
    const dataReady = pie(Object.entries(data).map(([key, value]) => ({ key, value })));

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll('slices')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => d3.schemeCategory10[i]);

    svg.selectAll('labels')
      .data(dataReady)
      .enter()
      .append('text')
      .text(d => `${d.data.key}: ${d.data.value}`)
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle');
  }, [data]);

  return <div id="pieChart"></div>;
};

export default D3PieChart;
