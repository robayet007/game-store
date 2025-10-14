import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Carousel from './components/Carousel/Carousel';
import Home from "./pages/Home"
import NavMenu from './components/NavMenu/NavMenu';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Carousel/>
        <Routes>
          <Route path="/" element={<Home/>} />
        </Routes>
        <NavMenu/>
      </div>
    </Router>
  );
}

export default App;