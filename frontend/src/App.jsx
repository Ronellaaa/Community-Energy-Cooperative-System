import { BrowserRouter, Routes, Route } from "react-router-dom";
import BillForm from "./components/BillFormFeature3";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="/add-bill" element={<BillForm />} />*/}
        {/* Add other routes here as needed */}
         <Route path="/add-bill" element={
          <div>
            <h1 style={{color: 'red'}}>TEST: Route is working!</h1>
            <BillForm />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;