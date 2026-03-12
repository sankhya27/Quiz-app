import { useNavigate } from 'react-router-dom';
import { setInternalNav } from '../utils/navigation';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Elevate Your Learning with <span className="text-gradient">QuizMaster</span></h1>
            <p className="hero-subtitle">
              The ultimate platform to challenge your knowledge, master new skills, and track your progress in real-time.
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn-primary btn-large" 
                onClick={() => handleNav('/register')}
              >
                SignUp
              </button>
              <button 
                className="btn-primary btn-large" 
                onClick={() => handleNav('/login')}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;