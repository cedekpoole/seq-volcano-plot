import HighChartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";

HC_exporting(HighCharts);

function Chart() {
  
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
    data: {
    },
  };


  return (
    <div className="container">
      <HighChartsReact highcharts={HighCharts} options={options} />
    </div>
  );
}

export default Chart;
