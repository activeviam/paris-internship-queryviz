import React, { Component } from "react";
import PropTypes from "prop-types";
// import ReactDOM from "react-dom";
import * as d3 from "d3";
import { nodeType, linkType } from "../types";
// import Link from "./Link";
// import Node from "./Node";
// import { updateGraph } from "../helpers/graphHelpers";

class Graph extends Component {
  componentDidMount() {
    const { nodes, links } = this.props;

    const svg = d3.select("svg").call(
      d3.zoom().on("zoom", () => {
        this.props.clickNode(null);
        return d3
          .select("svg")
          .selectAll("g")
          .attr("transform", d3.event.transform);
      })
    );

    const width = +svg.node().getBoundingClientRect().width;
    let node = null;
    let link = null;

    // force simulator
    const simulation = d3.forceSimulation();

    // update the display based on the forces (but not positions)
    function updateDisplay() {
      node
        .attr("r", d => Math.sqrt(d.radius) * 4)
        .attr("stroke", d => (d.isSelected ? "#2E2E2E" : "#BFBFBF"))
        .attr("stroke-width", d => (d.isSelected ? 3 : 1))
        .style("fill", d =>
          d.status === "root"
            ? "#FFD500"
            : d.status === "leaf"
            ? "#FC5400"
            : "#3A83C0"
        );

      link
        .attr("stroke-width", 6)
        .style("stroke", d => (d.critical ? "#b30000" : "#1B1978"))
        .style("opacity", ".8");
    }

    // update the display positions after each simulation tick
    function ticked() {
      link
        .attr("x1", d => d.target.x)
        .attr("y1", d => d.target.y)
        .attr("x2", d => d.source.x)
        .attr("y2", d => d.source.y);

      node.attr("cx", d => d.x).attr("cy", d => d.y);
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0.0001);
      d.fx = null;
      d.fy = null;
    }

    // add forces to the simulation
    function initializeForces() {
      // add forces and associate each with a name
      simulation
        .force(
          "link",
          d3
            .forceLink(links)
            // .distance(d => d.source.deepness - d.target.deepness)
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(-1000))
        .force(
          "collide",
          d3.forceCollide().radius(d => d.radius)
        )
        .force("forceY", d3.forceY(d => d.yFixed).strength(1))
        .force(
          "forceX",
          d3.forceX(d => (d.clusterId * width) / 2).strength(0.1)
        );
    }

    // generate the svg objects and force simulation
    function initializeDisplay() {
      // set the data and properties of link lines
      link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line");

      // set the data and properties of node circles
      node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      // node tooltip
      node.append("title").text(d => d.id);
      // visualize the graph
      updateDisplay();
    }

    // set up the simulation and event to update locations after each tick
    function initializeSimulation() {
      simulation.nodes(nodes);
      initializeForces();
      simulation.on("tick", ticked);
    }

    initializeDisplay();
    initializeSimulation();
  }

  componentWillUnmount() {
    this.props.restart();
  }

  render() {
    return (
      <svg
        className="graph my-0"
        style={{
          marginTop: "2em",
          backgroundColor: "#d1d1ff",
          height: "5000px",
          width: "100%"
        }}
      />
    );
  }
}

Graph.propTypes = {
  nodes: PropTypes.arrayOf(nodeType).isRequired,
  links: PropTypes.arrayOf(linkType).isRequired,
  clickNode: PropTypes.func.isRequired,
  restart: PropTypes.func.isRequired
};

export default Graph;
