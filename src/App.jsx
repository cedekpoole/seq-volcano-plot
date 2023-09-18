import Papa from 'papaparse';

function App() {

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      step: function(row) {
        console.log(row.data);
      },
      complete: function(results) {
        console.log(results);
      }
    });
  }

  return (
    <div className="app">
      <input 
        type="file" 
        name="file" 
        accept=".csv"
        onChange={changeHandler}
        style={{display: "block", margin: "10px auto"}}
      />
    </div>
  );
}

export default App;
