import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import highchartsAccessibility from "highcharts/modules/accessibility";
import { useState } from "react";
import Papa from "papaparse";

highchartsAccessibility(HighCharts);
HC_exporting(HighCharts);

function Chart() {
  const [showChart, setShowChart] = useState(false);
  const [significant, setSignificant] = useState([]);
  const [notSignificant, setNotSignificant] = useState([]);

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        results.data.forEach((row) => {
          if (
            (row.padj < 0.1 && row.log2FoldChange > 1) ||
            row.log2FoldChange < -1
          ) {
            setSignificant((prev) => [
              ...prev,
              {
                x: row.log2FoldChange,
                y: -Math.log10(row.padj),
                gene: Object.values(row)[0],
              },
            ]);
          } else if (!isNaN(row.padj)) {
            setNotSignificant((prev) => [
              ...prev,
              {
                x: row.log2FoldChange,
                y: -Math.log10(row.padj),
                gene: Object.values(row)[0],
              },
            ]);
          }
        });
        setShowChart(true);
      },
    });
  };

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
        text: "log2 Fold Change",
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
          width: 1.5,
        },
      ],
      startOnTick: false,
    },
    plotOptions: {
      series: {
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
        data: significant,
      },
      {
        name: "No Change",
        color: "rgb(150,156,159)",
        data: notSignificant,
      },
    ],
    tooltip: {
      formatter: function () {
        return this.point.gene;
      },
    },
  };

  return (
    <div>
      <div className="app">
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
          className="container"
          style={{ width: 500, height: 300, margin: "50px auto" }}
        >
          <HighChartsReact highcharts={HighCharts} options={options} />
        </div>
      )}
    </div>
  );
}

export default Chart;
