import { useEffect, useState } from "react";
import ReactDataGrid, { textEditor } from "react-data-grid";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { read, utils, writeFileXLSX } from "xlsx";
import "./App.css";
import "react-data-grid/lib/styles.css";

interface Row {
  year: number;
  revenue: number;
  costs: number;
  profit: number;
}

function App() {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const f = await(
        await fetch("https://www.maxrosenb.com/data.xlsx")
      ).arrayBuffer();
      const wb = read(f);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawData = utils.sheet_to_json(ws);

      const newData = rawData.map((d: any) => ({
        ...d,
        profit: d.revenue - d.costs,
      }));

      setData(newData);
    };
    fetchData();
  }, []);

  const updateRows = (rows: Row[]) => {
    setData(
      rows.map((d) => ({
        ...d,
        profit: d.revenue - d.costs,
      }))
    );
  };

  const exportData = () => {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    utils.book_append_sheet(wb, ws, "data");
    writeFileXLSX(wb, "data.xlsx");
  };

  return (
    <div className="App">
      {data.length > 0 && (
        <div className="graph-data">
          <div>
            <ReactDataGrid
              columns={[
                { key: "year", name: "Year" },
                { key: "revenue", name: "Revenue", editor: textEditor },
                { key: "costs", name: "Costs", editor: textEditor },
                { key: "profit", name: "Profit" },
              ]}
              rows={data}
              onRowsChange={updateRows}
            />
          </div>

          <div>
            <LineChart width={600} height={300} data={data}>
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              <Line type="monotone" dataKey="costs" stroke="#fd41f9" />
              <Line type="monotone" dataKey="profit" stroke="#fe1f1a" />
              <XAxis dataKey="year" />
              <YAxis />
            </LineChart>
          </div>
        </div>
      )}

      <button onClick={exportData}>Export [.xlsx]</button>
    </div>
  );
}

export default App;
