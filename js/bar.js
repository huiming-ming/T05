(async function () {
  const container = document.querySelector("#bar");

  if (!container) return;

  try {
    const rows = await d3.csv(
      "data/Ex5_TV_energy_55inchtv_byScreenType.csv"
    );

    const energyColumn =
      "Mean(Labelled energy consumption (kWh/year))";

    const data = rows.map(d => ({
      technology: d.Screen_Tech.trim(),
      energy: parseNumber(d[energyColumn])
    })).filter(d =>
      d.technology &&
      Number.isFinite(d.energy) &&
      d.energy >= 0
    );

    if (!data.length) {
      throw new Error("No valid 55-inch TV averages were found.");
    }

    // Use the same technology colours as the donut chart.
    const color = d3.scaleOrdinal()
      .domain(["LCD", "LED", "OLED"])
      .range(["#2878a5", "#dc8b28", "#7c64a6"]);

    function draw() {
      const width = container.clientWidth;

      if (width <= 0) return;

      d3.select(container).selectAll("*").remove();

      const height = 360;
      const margin = {
        top: 30,
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
          "Bar chart comparing average annual energy consumption of 55-inch LCD, LED and OLED TVs"
        );

      // Divide the horizontal space into category bands.
      const x = d3.scaleBand()
        .domain(data.map(d => d.technology))
        .range([margin.left, width - margin.right])
        .padding(0.3);

      // Start the vertical scale at zero.
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy) * 1.12])
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
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

      // Draw the bars.
      const bars = svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.technology))
        .attr("y", d => y(d.energy))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.energy))
        .attr("fill", d => color(d.technology));

      bars.append("title")
        .text(d =>
          `${d.technology}\n` +
          `Average Annual Energy Consumption: ` +
          `${d.energy.toFixed(2)} kWh/year`
        );

      // Show the average above each bar.
      svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", d => x(d.technology) + x.bandwidth() / 2)
        .attr("y", d => y(d.energy) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#243247")
        .text(d => d.energy.toFixed(1));

      // Add axis labels.
      svg.append("text")
        .attr(
          "x",
          (margin.left + width - margin.right) / 2
        )
        .attr("y", height - 12)
        .attr("text-anchor", "middle")
        .text("Screen Technology");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr(
          "x",
          -(margin.top + height - margin.bottom) / 2
        )
        .attr("y", 17)
        .attr("text-anchor", "middle")
        .text("Mean Annual Energy Use (kWh/year)");
    }

    const observer = new ResizeObserver(draw);
    observer.observe(container);
  } catch (error) {
    console.error("Bar chart error:", error);
    container.textContent =
      "Unable to load the bar chart. Check the CSV file and console.";
  }

  function parseNumber(value) {
    const text = String(value ?? "").trim();
    return text === "" ? NaN : Number(text);
  }
})();