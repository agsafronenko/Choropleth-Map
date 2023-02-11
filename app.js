//-----------------Data request----------------

let dataEducation = [];
let dataTopology = [];

(async function getData() {
  dataEducation = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json").then((response) => response.json());
  dataTopology = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json").then((response) => response.json());
  dataTopology = topojson.feature(dataTopology, dataTopology.objects.counties).features;
  buildChoroplethMap();
})();

//-----------------Creating main svg element ------------------

function buildChoroplethMap() {
  console.log("data", dataEducation, dataTopology);
  width = 1000;
  height = 700;
  padding = 30;

  const svg = d3.select("body").append("div").attr("id", "svg-container").append("svg").attr("width", width).attr("height", height);

  //-----------------Header---------------------

  svg
    .append("text")
    .attr("id", "title")
    .text("United States Educational Attainment")
    .attr("x", width / 2)
    .attr("y", padding * 1.5)
    .style("text-anchor", "middle");

  svg
    .append("text")
    .attr("id", "description")
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")
    .attr("x", width / 2)
    .attr("y", padding * 2.5)
    .style("text-anchor", "middle");

  //----------------Scaling-----------------

  const colorScale = d3
    .scaleSequential()
    .domain([d3.min(dataEducation, (d) => d.bachelorsOrHigher), d3.max(dataEducation, (d) => d.bachelorsOrHigher)])
    .interpolator(d3.interpolateYlGn);

  // ------------------Choropleth map-----------------

  let tooltip = d3.select("body").append("div").attr("id", "tooltip");
  svg
    .selectAll("path")
    .data(dataTopology)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", d3.geoPath())
    .attr("transform", `translate(${padding}, ${padding * 3})`)
    .style("fill", (d) => colorScale(dataEducation.filter((county) => county.fips === d.id)[0].bachelorsOrHigher))
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => dataEducation.filter((county) => county.fips === d.id)[0].bachelorsOrHigher)
    .on("mouseover", (e, d) => {
      const countyData = dataEducation.filter((county) => county.fips === d.id)[0];
      const tooltipText = `${countyData.area_name}, ${countyData.state}: ${countyData.bachelorsOrHigher}%`;
      tooltip
        .text(tooltipText)
        .style("opacity", "100%")
        .style("left", e.clientX + 9 + "px")
        .style("top", e.clientY - 15 + "px")
        .attr("data-education", dataEducation.filter((county) => county.fips === d.id)[0].bachelorsOrHigher);
    })
    .on("mouseout", (event, d) => {
      tooltip
        .style("opacity", "0%")
        .style("left", -2000 + "px")
        .style("top", -2000 + "px");
    });

  //-----------Legend--------------

  const legend = svg.append("g").attr("id", "legend");

  const legendTempArr = [];
  for (let i = 0; i < 65; i += 5) {
    let newBound = i + 5;
    if (newBound > 65) {
      legendTempArr.push(65);
      break;
    } else {
      legendTempArr.push(newBound);
    }
  }

  let rectWidth = 40;
  let rectHeight = 20;

  legendTempArr.map((temp, ind) => {
    legend
      .append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", width / 2.7 + ind * rectWidth)
      .attr("y", padding * 3.7)
      .style("fill", colorScale(temp));
  });

  legendTempArr.map((temp, ind, arr) => {
    legend
      .append("text")
      .attr("class", "legendText")
      .text(temp + "%")
      .attr("x", width / 2.7 + ind * rectWidth + rectWidth / 2)
      .attr("y", padding * 3.7 + padding / 2)
      .style("text-anchor", "middle");
  });

  //------------Footer--------------

  d3.select("body").append("footer").text("This Choropleth Map was created using: HTML, CSS, JavaScript and D3 svg-based visualization library");
}
