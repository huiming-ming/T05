# T05: Responsive D3 Multi-Chart Webpage

This project explores TV energy consumption and electricity spot
prices through four responsive D3 charts on a single webpage.

## Charts

1. Scatter plot: energy star rating versus annual TV energy consumption.
2. Donut chart: shares of summed annual energy consumption values
   across TV records, grouped by screen technology.
3. Bar chart: average annual energy consumption of 55-inch TVs
   by screen technology.
4. Line chart: supplied average electricity spot prices from
   1998 to 2024, excluding Tasmania and Snowy.

## Technologies

- HTML
- CSS Grid
- JavaScript
- D3.js v7
- ResizeObserver

## Project Structure

```text
index.html
css/
   style.css
README.md
js/
  scatter.js
  donut.js
  bar.js
  line.js
data/
  Ex5_TV_energy.csv
  Ex5_TV_energy_Allsizes_byScreenType.csv
  Ex5_TV_energy_55inchtv_byScreenType.csv
  Ex5_ARE_Spot_Prices.csv
```

## Running the Project

1. Open the project folder in Visual Studio Code.
2. Start Live Server from index.html.
3. Open the local URL provided by Live Server.

Use a local web server so the browser can load the CSV files.

## Responsive Design

The page uses two columns on wider screens and one column on
narrower screens. Each chart redraws when its container width changes.

## Data Notes

Data files were supplied with the COS30045 T05 exercise.

- Each scatter plot point represents one CSV record.
- The donut chart sums recorded annual energy values without
  weighting by the count column. These sums do not represent
  market-wide electricity consumption.
- The original technology label "LCD (LED)" is displayed as "LED"
  in the donut chart.
- The bar chart uses the supplied averages for 55-inch TVs.
- The electricity price average excludes Tasmania and Snowy.
- TV energy consumption is measured in kWh/year.
- Electricity spot prices are measured in $/MWh.

The meaning of the count column requires confirmation before
using it to calculate weighted totals.
