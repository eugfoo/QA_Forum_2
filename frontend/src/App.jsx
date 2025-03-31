import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/ask" element={<div>Ask a Question</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
