import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { HabitDetail } from './pages/HabitDetail';
import { Statistics } from './pages/Statistics';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/habit/:id" element={<HabitDetail />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
