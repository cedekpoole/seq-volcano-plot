import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import annotationModule from "highcharts/modules/annotations";
annotationModule(HighCharts);

function ChartRenderer({
  upRegulatedGenes,
  downRegulatedGenes,
  notSignificantData,
  plotLines,
  upRegGeneCount,
  downRegGeneCount,
  noChangeCount,
}) {
  // Sort the significantData array in descending order of the y value
  // and take the top 4 highest points for the annotations
  const topFourDataPoints = [...upRegulatedGenes, ...downRegulatedGenes]
    .sort((a, b) => b.y - a.y)
    .slice(0, 4);

  const options = {
    chart: {
      type: "scatter",
      zoomType: "xy",
      height: "60%"
    },
    title: {
      text: "Volcano Plot",
    },
    subtitle: {
      text: "Click and drag within the plot area to zoom in",
    },
    xAxis: {
      zIndex: 10,
      title: {
        text: "log2FoldChange",
      },
      plotLines: [
        plotLines.lowerLog2FCThresholdLine,
        plotLines.higherLog2FCThresholdLine,
      ],
    },
    yAxis: {
      lineWidth: 1,
      title: {
        text: "-log10(padj)",
      },
      min: -10,
      plotLines: [plotLines.padjThresholdLine],
      startOnTick: false,
    },
    plotOptions: {
      series: {
        // increase the turboThreshold to
        // allow for more data points
        turboThreshold: 100000,
        marker: {
          symbol: "circle",
          radius: 2,
        },
      },
    },
    series: [
      {
        name: "Up-regulated Genes",
        color: "rgb(39,116,255)",
        data: upRegulatedGenes,
        boostThreshold: 1,
      },
      {
        name: "Down-regulated Genes",
        color: "rgb(254,125,43)",
        data: downRegulatedGenes,
        boostThreshold: 1,
      },
      {
        name: "No Change",
        color: "rgb(150,156,159)",
        data: notSignificantData,
        boostThreshold: 1,
      },
    ],
    annotations: [
      {
        labels: topFourDataPoints.map((point) => ({
          point: {
            xAxis: 0,
            yAxis: 0,
            x: point.x,
            y: point.y,
          },
          text: point.gene, // Adjust formatting as needed
        })),
        labelOptions: {
          backgroundColor: "rgba(255,255,255,0.5)",
          borderColor: "black",
          borderWidth: 0.5,
          style: {
            fontSize: "10px",
          },
          overflow: "justify",
          crop: true,
        },
      },
    ],
    tooltip: {
      formatter: function () {
        // return `${this.point.gene} <br> <b>log2FC:</b> ${this.point.x.toFixed(
        //   2
        // )} <br> <b>-log10(padj):</b> ${this.point.y.toFixed(2)}`;
        return this.point.gene;
      },
      hideDelay: 200,
    },
    // add a custom legend to show the number of
    // data points for each series
    legend: {
      labelFormatter: function () {
        const series = this;
        const numPoints =
          series.name === "No Change"
            ? noChangeCount
            : series.name === "Up-regulated Genes"
            ? upRegGeneCount
            : downRegGeneCount;
        return `${series.name} (${numPoints})`;
      },
    },
    boost: {
      pixelRatio: 0,
    },
  };

  return (
    <div
      className="chart"
      style={{ width: "80%", margin: "30px auto", paddingRight: 10 }}
      data-testid="chart"
    >
      <HighChartsReact highcharts={HighCharts} options={options} />
    </div>
  );
}

export default ChartRenderer;
