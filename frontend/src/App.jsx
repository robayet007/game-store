import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Carousel from './components/Carousel/Carousel';
import Home from "./pages/Home"

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Carousel/>
        <Routes>
          <Route path="/" element={<Home/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;