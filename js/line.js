(async function () {
  const container = document.querySelector("#line");

  if (!container) return;

  try {
    const rows = await d3.csv(
      "data/Ex5_ARE_Spot_Prices.csv"
    );

    const priceColumn = "Average Price (notTas-Snowy)";

    const data = rows.map(d => ({
      year: parseNumber(d.Year),
      price: parseNumber(d[priceColumn])
    }))
      .filter(d => Number.isFinite(d.year))
      .sort((a, b) => a.year - b.year);

    const validPrices = data.filter(d =>
      Number.isFinite(d.price)
    );

    if (!validPrices.length) {
      throw new Error("No valid average electricity prices were found.");
    }

    function draw() {
      const width = container.clientWidth;

      if (width <= 0) return;

      d3.select(container).selectAll("*").remove();

      const height = 360;
      const margin = {
        top: 20,
        right: 25,
        bottom: 60,
        left: 70
      };

      const svg = d3.select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img")
        .attr(
          "aria-label",
          "Line chart of average electricity spot prices from 1998 to 2024, excluding Tasmania and Snowy"
        );

      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([
          Math.min(0, d3.min(validPrices, d => d.price)),
          d3.max(validPrices, d => d.price) * 1.08
        ])
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

      // Format years as integers without thousands separators.
      svg.append("g")
        .attr(
          "transform",
          `translate(0,${height - margin.bottom})`
        )
        .call(
          d3.axisBottom(x)
            .ticks(Math.max(2, Math.floor(width / 90)))
            .tickFormat(d3.format("d"))
        );

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

      // Leave a gap if a price is missing.
      const line = d3.line()
        .defined(d => Number.isFinite(d.price))
        .x(d => x(d.year))
        .y(d => y(d.price));

      // Bind the complete dataset to one path.
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#2878a5")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // Add points to make individual years easier to inspect.
      const points = svg.append("g")
        .selectAll("circle")
        .data(validPrices)
        .join("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.price))
        .attr("r", 3)
        .attr("fill", "#2878a5")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      points.append("title")
        .text(d =>
          `Year: ${d.year}\n` +
          `Average Spot Price: $${d.price.toFixed(2)}/MWh`
        );

      // Add axis labels.
      svg.append("text")
        .attr(
          "x",
          (margin.left + width - margin.right) / 2
        )
        .attr("y", height - 12)
        .attr("text-anchor", "middle")
        .text("Year");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr(
          "x",
          -(margin.top + height - margin.bottom) / 2
        )
        .attr("y", 17)
        .attr("text-anchor", "middle")
        .text("Average Spot Price ($/MWh)");
    }

    const observer = new ResizeObserver(draw);
    observer.observe(container);
  } catch (error) {
    console.error("Line chart error:", error);
    container.textContent =
      "Unable to load the line chart. Check the CSV file and console.";
  }

  function parseNumber(value) {
    const text = String(value ?? "").trim();
    return text === "" ? NaN : Number(text);
  }
})();