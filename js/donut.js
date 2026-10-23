(async function () {
  const container = document.querySelector("#donut");

  if (!container) return;

  try {
    // Load the original TV records.
    const rows = await d3.csv("data/Ex5_TV_energy.csv");

    const records = rows.map(d => ({
      technology: d.screen_tech.trim() === "LCD (LED)"
        ? "LED"
        : d.screen_tech.trim(),

      energy: parseNumber(d.energy_consumpt)
    })).filter(d =>
      d.technology &&
      Number.isFinite(d.energy) &&
      d.energy >= 0
    );

    // Sum recorded energy values without applying count weights.
    const data = d3.rollups(
      records,
      group => d3.sum(group, d => d.energy),
      d => d.technology
    ).map(([technology, energy]) => ({
      technology,
      energy
    }));

    const order = ["LCD", "LED", "OLED"];

    data.sort((a, b) =>
      order.indexOf(a.technology) - order.indexOf(b.technology)
    );

    const total = d3.sum(data, d => d.energy);

    if (!(total > 0)) {
      throw new Error("No positive energy consumption values were found.");
    }

    const color = d3.scaleOrdinal()
      .domain(order)
      .range(["#2878a5", "#dc8b28", "#7c64a6"]);

    const formatValue = d3.format(",.2f");
    const formatPercent = d3.format(".1%");

    let previousWidth = -1;

    function draw() {
      const width = container.clientWidth;

      if (width <= 0) return;

      // Remove the previous chart, legend and tooltip.
      d3.select(container).selectAll("*").remove();

      // Create a tooltip that does not intercept pointer events.
      const tooltip = d3.select(container)
        .append("div")
        .attr("role", "tooltip")
        .style("position", "fixed")
        .style("visibility", "hidden")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("max-width", "240px")
        .style("padding", "10px 12px")
        .style("border-radius", "6px")
        .style("background", "#243247")
        .style("color", "white")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "13px")
        .style("line-height", "1.5")
        .style("white-space", "pre-line")
        .style(
          "box-shadow",
          "0 4px 12px rgba(0, 0, 0, 0.2)"
        );

      const height = 280;
      const radius = Math.min(width * 0.4, height * 0.43);

      const svg = d3.select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img")
        .attr(
          "aria-label",
          "Donut chart showing shares of summed annual energy " +
          "consumption values across CSV records by screen technology"
        );

      // Calculate slice angles from the summed energy values.
      const pie = d3.pie()
        .sort(null)
        .value(d => d.energy);

      // Generate the donut slice shapes.
      const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);

      const group = svg.append("g")
        .attr(
          "transform",
          `translate(${width / 2},${height / 2})`
        );

      // Draw the slices.
      const slices = group.selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.technology))
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      // Display the tooltip immediately on hover.
      slices
        .on("pointerenter", function (event, d) {
          d3.select(this).attr("opacity", 0.8);

          tooltip
            .text(
              `${d.data.technology}\n` +
              `Sum of Recorded Values: ` +
              `${formatValue(d.data.energy)} kWh/year\n` +
              `Share: ${formatPercent(d.data.energy / total)}`
            )
            .style("visibility", "visible");

          positionTooltip(event);
        })
        .on("pointermove", function (event) {
          positionTooltip(event);
        })
        .on("pointerleave", function () {
          d3.select(this).attr("opacity", 1);

          tooltip.style("visibility", "hidden");
        });

      // Keep the tooltip within the browser viewport.
      function positionTooltip(event) {
        const box = tooltip.node().getBoundingClientRect();
        const gap = 12;

        const left = Math.max(
          8,
          Math.min(
            event.clientX + gap,
            window.innerWidth - box.width - 8
          )
        );

        const top = Math.max(
          8,
          Math.min(
            event.clientY + gap,
            window.innerHeight - box.height - 8
          )
        );

        tooltip
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      }

      // Hide the tooltip when the chart is scrolled away.
      container.onpointerleave = function () {
        tooltip.style("visibility", "hidden");
        slices.attr("opacity", 1);
      };

      // Add labels inside the donut.
      group.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -4)
        .attr("font-weight", "bold")
        .text("Recorded Values");

      group.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 16)
        .text("All TV Sizes");

      // Add a legend that wraps on narrow screens.
      const legend = d3.select(container)
        .append("div")
        .style("display", "grid")
        .style("gap", "8px")
        .style("font-size", "13px");

      const items = legend.selectAll("div")
        .data(data)
        .join("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "8px");

      items.append("span")
        .style("display", "inline-block")
        .style("width", "12px")
        .style("height", "12px")
        .style("flex-shrink", "0")
        .style(
          "background-color",
          d => color(d.technology)
        );

      items.append("span")
        .text(d =>
          `${d.technology}: ${formatValue(d.energy)} kWh/year ` +
          `(${formatPercent(d.energy / total)})`
        );
    }

    // Redraw only when the container width changes.
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;

      if (width !== previousWidth) {
        previousWidth = width;
        draw();
      }
    });

    observer.observe(container);
  } catch (error) {
    console.error("Donut chart error:", error);

    container.textContent =
      "Unable to load the donut chart. Check the CSV file and console.";
  }

  // Treat blank values as missing rather than zero.
  function parseNumber(value) {
    const text = String(value ?? "").trim();

    return text === "" ? NaN : Number(text);
  }
})();