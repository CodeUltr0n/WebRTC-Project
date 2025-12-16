import "../App.css";
import React from "react";
import { Link, useNavigate } from 'react-router-dom';


const Landing = () => {

  const router = useNavigate()
  return (
    <div className="landingPageContainer">
         <nav>
          <div className="navHeader">
            <Link to="/auth" className="getStartedBtn">
              Get Started
            </Link>
          </div>
          <div className="navlist">
              <p onClick={()=>
                router("/rewrrt")
              }>Join as a Guest</p>
              <p
              onClick={()=>{
                router("/auth")
              }}
              >Register</p>
              <div onClick={()=>{
                router("/auth")
              }} role="button">
                  <p>Login</p>
              </div>
          </div>
         </nav>

         {/* nth child */}
         {/* <div className="landingMainContainer">
          <div>
            h1 span style = {{color:ornage}}

            <p connect to your loved ones 
          </div>
          <div></div>
         </div> */} 

    </div>
  )
}

export default Landing