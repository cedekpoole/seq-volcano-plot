import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import annotationModule from "highcharts/modules/annotations";
import { useState } from "react";
annotationModule(HighCharts);

function ChartRenderer({
  upRegulatedGenes,
  downRegulatedGenes,
  notSignificantData,
  plotLines,
  upRegGeneCount,
  downRegGeneCount,
  noChangeCount,
  padjThreshold,
  log2FCThreshold,
  labeledPoints,
  setLabeledPoints,
  genesList,
}) {



  const annotationsToRender = genesList.length > 0
  ? upRegulatedGenes.concat(downRegulatedGenes, notSignificantData)
      .filter(point => genesList.includes(point.gene)).concat(labeledPoints)
  : labeledPoints;

  const options = {
    exporting: {
      sourceWidth: 1000,
      sourceHeight: 1000,
      scale: 1,
      filename: `volcanoplot_padj${padjThreshold}_log2FC${log2FCThreshold}`
    },
    chart: {
      type: "scatter",
      zoomType: "xy",
      height: "60%",
    },
    title: {
      text: `.`,
      style: {
        color: "white"
      }
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
          radius: 2.2,
        },
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              const index = labeledPoints.findIndex(
                (point) => point.x === this.x && point.y === this.y
              );

              if (index > -1) {
                // If the point is already labeled
                setLabeledPoints((points) =>
                  points.filter((_, i) => i !== index)
                ); // Remove label
              } else {
                // If the point is not labeled
                setLabeledPoints((points) => [...points, this]); // Add label
              }
            },
            mouseOver: function () {
              if (this.series.halo) {
                this.series.halo
                  .attr({
                    class: "highcharts-tracker",
                  })
                  .toFront();
              }
            },
          },
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
    annotations: annotationsToRender.map((point) => ({
      labels: [
        {
          point: {
            xAxis: 0,
            yAxis: 0,
            x: point.x,
            y: point.y,
          },
          text: point.gene,
          draggable: "xy",
        },
      ],
      labelOptions: {
        backgroundColor: "rgba(255,255,255,0.5)",
        borderColor: "black",
        borderWidth: 0.5,
        style: {
          fontSize: "12px",
        },
        overflow: "justify",
        crop: true,
      },
    })),
    tooltip: {
      formatter: function () {
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
      style={{ width: "80%", margin: "0 auto", paddingRight: 10 }}
      data-testid="chart"
    >
      <HighChartsReact highcharts={HighCharts} options={options} />
    </div>
  );
}

export default ChartRenderer;
