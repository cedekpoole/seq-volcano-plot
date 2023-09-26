import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import { useState } from "react";
import Papa from "papaparse";

// add the exporting and accessibility modules
if (typeof HighCharts === "object") {
  highchartsAccessibility(HighCharts);
  HC_exporting(HighCharts);
}

function Chart() {
  const [showChart, setShowChart] = useState(false);
  const [significantData, setSignificantData] = useState([]);
  const [notSignificantData, setNotSignificantData] = useState([]);

  // count number of data plots for each series
  const [changeCount, setChangeCount] = useState(0);
  const [noChangeCount, setNoChangeCount] = useState(0);

  const handleDataParsing = (data) => {
    const significantDataTemp = [];
    const notSignificantDataTemp = [];
    let changeCountTemp = 0;
    let noChangeCountTemp = 0;
    // loop through each row and add
    // the data to the appropriate series
    data.forEach((row) => {
      if (
        row.padj < 0.1 &&
        (row.log2FoldChange > 1 || row.log2FoldChange < -1)
      ) {
        significantDataTemp.push({
          x: row.log2FoldChange,
          y: -Math.log10(row.padj),
          gene: Object.values(row)[0],
        });
        // increment the count for the series
        changeCountTemp++;
      } else if (!isNaN(row.padj)) {
        notSignificantDataTemp.push({
          x: row.log2FoldChange,
          y: -Math.log10(row.padj),
          gene: Object.values(row)[0],
        });
        noChangeCountTemp++;
      }
    });
    // set the state
    setSignificantData(significantDataTemp);
    setNotSignificantData(notSignificantDataTemp);
    setChangeCount(changeCountTemp);
    setNoChangeCount(noChangeCountTemp);
  };

  // use the papa parse package to parse the csv file
  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        handleDataParsing(results.data);
        setShowChart(true);
      },
    });
  };

  // set the options for the chart
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
        {
          value: -1,
          color: "grey",
          dashStyle: "shortdash",
          width: 1,
        },
        {
          value: 1,
          color: "grey",
          dashStyle: "shortdash",
          width: 1,
        },
      ],
    },
    yAxis: {
      tickInterval: 25,
      lineWidth: 1,
      title: {
        text: "-log10(padj)",
      },
      min: -10,
      plotLines: [
        {
          value: 1,
          color: "grey",
          dashStyle: "shortdash",
          width: 1,
        },
      ],
      startOnTick: false,
    },
    plotOptions: {
      series: {
        // increase the turboThreshold to
        // allow for more data points
        turboThreshold: 500000,
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
      },
      {
        name: "No Change",
        color: "rgb(150,156,159)",
        data: notSignificantData,
      },
    ],
    tooltip: {
      formatter: function () {
        return `${this.point.gene} <br> <b>log2FC:</b> ${this.point.x.toFixed(
          2
        )} <br> <b>-log10(padj):</b> ${this.point.y.toFixed(2)}`;
      },
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
  };

  return (
    <div>
      {/* add a file input to allow the user to upload a csv file */}
      <div className="file-input">
        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={changeHandler}
          style={{ display: "block", margin: "20px auto", fontSize: "20px" }}
          data-testid="file-input"
        />
      </div>
      {showChart && (
        <div
          className="chart"
          style={{ width: 500, height: 300, margin: "50px auto" }}
          data-testid="chart"
        >
          <HighChartsReact highcharts={HighCharts} options={options} />
        </div>
      )}
    </div>
  );
}

export default Chart;
