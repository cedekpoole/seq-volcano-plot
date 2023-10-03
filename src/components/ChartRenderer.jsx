import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
function ChartRenderer({
  significantData,
  notSignificantData,
  plotLines,
  changeCount,
  noChangeCount,
}) {
  const options = {
    chart: {
      type: "scatter",
      zoomType: "xy",
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
        name: "Significant Genes",
        color: "rgb(133,31,76)",
        data: significantData,
        boostThreshold: 1,
      },
      {
        name: "No Change",
        color: "rgb(150,156,159)",
        data: notSignificantData,
        boostThreshold: 1,
      },
    ],
    tooltip: {
      formatter: function () {
        // return `${this.point.gene} <br> <b>log2FC:</b> ${this.point.x.toFixed(
        //   2
        // )} <br> <b>-log10(padj):</b> ${this.point.y.toFixed(2)}`;
        return this.point.gene
      },
      hideDelay: 200,
    },
    // add a custom legend to show the number of
    // data points for each series
    legend: {
      labelFormatter: function () {
        const series = this;
        const numPoints =
          series.name === "Significant Genes" ? changeCount : noChangeCount;
        return `${series.name} (${numPoints})`;
      },
    },
    boost: {
        pixelRatio: 0
    }
  };

  return (
    <div
      className="chart"
      style={{ width: 500, height: 300, margin: "30px auto" }}
      data-testid="chart"
    >
      <HighChartsReact highcharts={HighCharts} options={options} />
    </div>
  );
}

export default ChartRenderer;
