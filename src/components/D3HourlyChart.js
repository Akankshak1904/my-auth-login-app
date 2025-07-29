import * as d3 from 'd3';
import { useEffect } from 'react';

export default function D3HourlyChart({ data }) {
  useEffect(() => {
    d3.select("#hourlyChart").selectAll("*").remove();

    const width = 500, height = 300;
    const svg = d3.select("#hourlyChart").append("svg")
      .attr("width", width).attr("height", height);

    const x = d3.scaleBand().domain(data.map(d => d.hour)).range([50, 450]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).range([250, 50]);

    svg.append("g").attr("transform", "translate(0,250)").call(d3.axisBottom(x).tickValues(x.domain().filter((d,i)=>i%2===0)));
    svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(y));

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.hour))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => 250 - y(d.count))
      .attr("fill", "orange");
  }, [data]);

  return <div id="hourlyChart"></div>;
}
