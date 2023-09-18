
function App() {

  const changeHandler = (event) => {
    console.log(event.target.files[0]);
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
