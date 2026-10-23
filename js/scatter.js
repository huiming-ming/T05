(async function () {
  const container = document.querySelector("#scatter");

  if (!container) return;

  try {
    // Load the CSV and convert numeric fields.
    const rows = await d3.csv("data/Ex5_TV_energy.csv");

    const data = rows.map(d => ({
      brand: d.brand,
      technology: d.screen_tech,
      stars: parseNumber(d.star2),
      energy: parseNumber(d.energy_consumpt)
    })).filter(d =>
      Number.isFinite(d.stars) &&
      Number.isFinite(d.energy)
    );

    if (!data.length) {
      throw new Error("No valid TV records were found.");
    }

    console.log("Scatter plot records:", data.length);

    function draw() {
      const width = container.clientWidth;

      if (width <= 0) return;

      // Clear the previous chart before redrawing.
      d3.select(container).selectAll("*").remove();

      const height = 360;
      const margin = {
        top: 20,
        right: 20,
        bottom: 60,
        left: 70
      };

      const svg = d3.select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img")
        .attr(
          "aria-label",
          "Scatter plot of TV energy star rating and annual energy consumption"
        );

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.stars)])
        .nice()
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Add horizontal grid lines.
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3.axisLeft(y)
            .ticks(5)
            .tickSize(-(width - margin.left - margin.right))
            .tickFormat("")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("line").attr("stroke", "#e5e7eb"));

      // Draw the axes.
      svg.append("g")
        .attr(
          "transform",
          `translate(0,${height - margin.bottom})`
        )
        .call(
          d3.axisBottom(x)
            .ticks(Math.max(2, Math.floor(width / 80)))
        );

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

      // Draw one point for each CSV record.
      const points = svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.stars))
        .attr("cy", d => y(d.energy))
        .attr("r", 3.5)
        .attr("fill", "#2878a5")
        .attr("opacity", 0.45);

      // Add native browser tooltips.
      points.append("title")
        .text(d =>
          `Brand: ${d.brand}\n` +
          `Technology: ${d.technology}\n` +
          `Energy Star Rating: ${d.stars}\n` +
          `Annual Energy Consumption: ${d.energy.toFixed(1)} kWh/year`
        );

      // Add axis labels.
      svg.append("text")
        .attr(
          "x",
          (margin.left + width - margin.right) / 2
        )
        .attr("y", height - 12)
        .attr("text-anchor", "middle")
        .text("Energy Star Rating");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr(
          "x",
          -(margin.top + height - margin.bottom) / 2
        )
        .attr("y", 17)
        .attr("text-anchor", "middle")
        .text("Annual Energy Consumption (kWh/year)");
    }

    // Reloading the CSV is unnecessary when resizing.
    const observer = new ResizeObserver(draw);
    observer.observe(container);
  } catch (error) {
    console.error("Scatter plot error:", error);
    container.textContent =
      "Unable to load the scatter plot. Check the CSV file and console.";
  }

  function parseNumber(value) {
    const text = String(value ?? "").trim();
    return text === "" ? NaN : Number(text);
  }
})();