import Papa from 'papaparse';
import { useState } from 'react';

function Input() {
  const [parsedData, setParsedData] = useState([]);

  const changeHandler = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function(results) {
        setParsedData(results.data);
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

export default Input;
