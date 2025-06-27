import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Whiteboard from './components/Whiteboard'
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/canvas/:id" element={<Whiteboard />} />
    </Routes>
  );
}

export default App;
