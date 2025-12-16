import './App.css'
import Landing from './pages/landing.jsx';
import {Route,BrowserRouter as Router,Routes} from 'react-router-dom';
import Authentication from './pages/Authentication.jsx';
import SignUp from './pages/SignUp.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeet from './pages/VideoMeet.jsx';
import Home from './pages/home';
import History from './pages/history.jsx';

function App() {
  return(
    <> 
    <Router>
      <AuthProvider>

      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/auth" element={<Authentication/>}/>
        <Route path="/signup" element={<SignUp />} />
      
        <Route path='/home' element={<Home/>}/>
        <Route path='/history' element={<History/>}/>
        <Route  path='/:url' element={<VideoMeet/>} />
      </Routes>
     </AuthProvider>

    </Router>
    </>
   
  );
}

export default App
