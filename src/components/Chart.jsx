import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import { useState } from "react";
import Papa from "papaparse";

HC_exporting(HighCharts);

function Chart() {
  const [parsedData, setParsedData] = useState([]);
  const [showChart, setShowChart] = useState(false);

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        setParsedData(results.data);
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
      title: {
        text: "log2 Fold Change",
      },
    },
    yAxis: {
      lineWidth: 1,
      title: {
        text: "-log10(padj)",
      },
    },
    data: {},
  };

  return (
    <div>
      <div className="app">
        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={changeHandler}
          style={{ display: "block", margin: "10px auto" }}
        />
      </div>
        {showChart && (
            <div className="container">
            <HighChartsReact highcharts={HighCharts} options={options} />
            </div>
        )}
    </div>
  );
}

export default Chart;
