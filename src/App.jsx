import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubmitMenfess from './pages/SubmitMenfess';
import MenfessDetail from './pages/MenfessDetail';
import Admin from './pages/Admin';
import MusicTest from './pages/MusicTest'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitMenfess />} />
          <Route path="/menfess/:id" element={<MenfessDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/music-test" element={<MusicTest />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
