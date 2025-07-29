// src/components/BarChart.js
import * as d3 from 'd3';
import { useEffect } from 'react';

export default function BarChart({ data }) {
  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select("#barChart").html("");

    const width = 500, height = 300, margin = { top: 50, right: 30, bottom: 50, left: 60 };

    const svg = d3.select("#barChart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map(d => d.date)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).nice().range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("rect").data(data).enter().append("rect")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.count))
      .attr("fill", "steelblue");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Daily Logins");
  }, [data]);

  return <div id="barChart"></div>;
}
