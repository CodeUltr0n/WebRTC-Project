let IS_PROD = true;

const server = IS_PROD ?
   "https://webrtc-project-gjcs.onrender.com":
    
   "http://localhost:8000"

// const server = {
//     dev:"http://localhost:8000",
//     prod:"https://webrtc-project-gjcs.onrender.com"
// }

export default server;