// src/components/LineChart.js
import * as d3 from 'd3';
import { useEffect } from 'react';

export default function LineChart({ data }) {
  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select("#lineChart").html("");

    const width = 500, height = 300, margin = { top: 50, right: 30, bottom: 50, left: 60 };

    const svg = d3.select("#lineChart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(data.map(d => d.week)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).nice().range([height, 0]);

    const line = d3.line().x(d => x(d.week)).y(d => y(d.count));

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Weekly Logins");
  }, [data]);

  return <div id="lineChart"></div>;
}
