import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import { useState } from "react";
import Papa from "papaparse";

// add the exporting and accessibility modules
highchartsAccessibility(HighCharts);
HC_exporting(HighCharts);

function Chart() {
  const [showChart, setShowChart] = useState(false);
  const [significantData, setSignificantData] = useState([]);
  const [notSignificantData, setNotSignificantData] = useState([]);

  // count number of data plots for each series
  const [changeCount, setChangeCount] = useState(0);
  const [noChangeCount, setNoChangeCount] = useState(0);

  const changeHandler = (event) => {
    // use the papa parse package to parse the csv file
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      // once the file is parsed, loop through each row
      // and add the data to the appropriate series
      complete: function (results) {
        results.data.forEach((row) => {
          if (
            (row.padj < 0.1 && row.log2FoldChange > 1) ||
            row.log2FoldChange < -1
          ) {
            setSignificantData((prev) => [
              ...prev,
              {
                x: row.log2FoldChange,
                y: -Math.log10(row.padj),
                gene: Object.values(row)[0],
              },
            ]);
            // increment the count for the series
            setChangeCount((prev) => prev + 1);
          } else if (!isNaN(row.padj)) {
            setNotSignificantData((prev) => [
              ...prev,
              {
                x: row.log2FoldChange,
                y: -Math.log10(row.padj),
                gene: Object.values(row)[0],
              },
            ]);
            setNoChangeCount((prev) => prev + 1);
          }
        });
        // set the state to show the chart
        setShowChart(true);
      },
    });
  };
  // set the options for the chart
  const options = {
    chart: {
      type: "scatter",
    },
    title: {
      text: "Volcano Plot",
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
          value: 0.1,
          color: "grey",
          dashStyle: "shortdash",
          width: 2,
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
        return this.point.gene;
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
          style={{ display: "block", margin: "20px auto" }}
        />
      </div>
      {showChart && (
        <div
          className="chart"
          style={{ width: 500, height: 300, margin: "50px auto" }}
        >
          <HighChartsReact highcharts={HighCharts} options={options} />
        </div>
      )}
    </div>
  );
}

export default Chart;
