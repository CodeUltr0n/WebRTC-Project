import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import IconButton from '@mui/material/IconButton';
import RestoreIcon from '@mui/icons-material/Restore';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { AuthContext } from '../contexts/AuthContext';

function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const {addToUserHistory} = useContext(AuthContext);


  const handleJoinVideoCall = () => {
    if (meetingCode.trim() === "") {
      alert("Please enter a meeting code");
      return;
    }

    // add meeting to user history
    addToUserHistory(meetingCode);

    navigate(`/${meetingCode}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/auth");
  };

  return (
    <div className="homeContainer">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2>
            Video-Conferencing App <br />
            by Ketan Chokkara
          </h2>
        </div>

        <div className="navbar-right">
          <IconButton onClick={
            () => {
              navigate("/history")
            }
          }>
            <RestoreIcon />
          </IconButton>
          <span className="historyText">History</span>
          <Button onClick={handleLogout} variant="contained" color="error">
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="meetContainer">
        <div className="leftPanel">
          <h2>Providing Quality Video Calls</h2>
          <div className="meetingInput">
            <TextField
              onChange={e => setMeetingCode(e.target.value)}
              id="outlined-basic"
              label="Meeting Code"
              variant="outlined"
              fullWidth
            />
            <Button
              onClick={handleJoinVideoCall}
              variant="contained"
              color="primary"
              style={{ marginLeft: "10px" }}
            >
              Join 
            </Button>
          </div>
        </div>

        <div className="rightPanel">
          <img src="/logo3.png" alt="Illustration" />
        </div>
      </div>
    </div>
  );
}

export default withAuth(Home);