import React, { useState, useRef, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import "../styles/videoComponent.css" 
import io from "socket.io-client"
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import Badge from '@mui/material/Badge';
import ChatIcon from "@mui/icons-material/Chat"
import { useNavigate } from "react-router-dom";
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers" : [
        { "urls" : "stun:stun.l.google.com:19302"}
    ]
}

const VideoMeet = () => {

  var socket = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();
  let routeTo = useNavigate();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  // Video/audio enabled states
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  // Start local camera and mic
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };
  const [screen, setScreen] = useState(null);

  const [showModal, setModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    console.log("Videos state updated:", videos);
  }, [videos]);

   
// todo 
//   if(isChrome() === false){

//   }


const getPermission = async ()=>{
    try{
      const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
      if(videoPermission){
        setVideoAvailable(true)
      }else{
        setVideoAvailable(false)
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
      if(audioPermission){
        setAudioAvailable(true)
      }else{
        setAudioAvailable(false)
      } 
      
      if(navigator.mediaDevices.getDisplayMedia){
        setScreenAvailable(true);
      }else{
        setScreenAvailable(false);
      }

      if(videoAvailable || audioAvailable){
        const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});

        if(userMediaStream){
            window.localStream = userMediaStream;
            if(localVideoRef.current){
                localVideoRef.current.srcObject = userMediaStream;
            }
        }
      }
    } catch (err) {
       console.log(err);
    }
}
    useEffect(()=>{
    getPermission();
    },[])

    let getUserMediaSuccess = (stream)=>{
        try{
               window.localStream.getTracks().forEach(track => track.stop());
        } catch(e){
            console.log(e)
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        /// node active 
        for(let id in connections){
            if(id === socketIdRef.current) continue;

            // Remove old tracks
            const senders = connections[id].getSenders();
            senders.forEach(sender => connections[id].removeTrack(sender));

            // Add new tracks
            window.localStream.getTracks().forEach(track => {
                connections[id].addTrack(track, window.localStream);
            });

            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                  .then(()=>{
                    socket.current.emit("signal",id,JSON.stringify(
                        {
                            "sdp":connections[id].localDescription
                        }
                    ))
                }).catch(e=>console.log(e));
            }).catch(e=>console.log(e));
        }

        stream.getTracks().forEach(track => {
          track.onended = () => {
            console.log("Local track ended");
          };
        });
    }

    let silence  = ()=>{
        let ctx = new AudioContext();
        let oscillators = ctx.createOscillator();

        let dst = oscillators.connect(ctx.createMediaStreamDestination());

        oscillators.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
    }

    let black = ({width = 640 , height = 480} = {}) =>{
        let canvas = Object.assign(document.createElement("canvas"),{width,height});

        canvas.getContext('2d').fillRect(0,0,width,height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0] , {enabled:false})
    }

    let getUserMedia = () => {
        if (!window.localStream) return;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            window.localStream.getTracks().forEach(track => {
                connections[id].addTrack(track, window.localStream);
            });
        }
    };


    let gotMessageFromServer = (fromId,message)=>{
      var signal = JSON.parse(message)

      if(fromId != socketIdRef.current){
        if(signal.sdp){
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(()=>{
                if(signal.sdp.type === "offer"){
                    connections[fromId].createAnswer().then((description)=>{
                        connections[fromId].setLocalDescription(description).then(()=>{
                            socket.current.emit("signal",fromId,JSON.stringify(
                                {
                                    "sdp":connections[fromId].localDescription
                                }
                            ))
                        }).catch(e=>console.log(e))
                    }).catch(e=>console.log(e))
                }
            }).catch(e=>console.log(e))
        }

        if(signal.ice){
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch(e=>console.log(e))
        }
      }
    }

    let addMessage = (data, sender, socketIdSender) => {
        const msgObj = {
            sender: sender,
            text: data,
            socketId: socketIdSender
        };

        setMessages(prev => [...prev, msgObj]);

        // Increase unread count only if chat is closed
        if (!showModal) {
            setNewMessages(prev => prev + 1);
        }
    };

    let connectToSocketServer = ()=>{
        console.log("Connecting to socket server:", server_url);
        socket.current = io.connect(server_url,{secure:false})

        socket.current.on('signal',gotMessageFromServer)
        
        socket.current.on('connect', ()=>{
            console.log("Socket connected! Socket ID:", socket.current.id);
            console.log("Joining call with URL:", window.location.href);
            socket.current.emit("join-call",window.location.href)

            socketIdRef.current = socket.current.id
            console.log("socketIdRef set to:", socketIdRef.current);

            socket.current.on("chat-message", (data, sender, socketIdSender) => {
                addMessage(data, sender, socketIdSender);
            })

            socket.current.on("user-left", (id) => {
                console.log("User left:", id);

                setVideos(prev =>
                    prev.filter(v => v.socketId !== id)
                );

                videoRef.current = videoRef.current.filter(v => v.socketId !== id);

                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            })

            socket.current.on("user-joined",(id,clients)=>{
                console.log("user-joined event:", id, clients);
                clients.forEach((socketListId)=>{
                    // Skip if this is our own socket ID
                    if(socketListId === socketIdRef.current) {
                        console.log("Skipping own socket ID:", socketListId);
                        return;
                    }
                    
                    console.log("Setting up connection for:", socketListId);

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = (event) => {
                        if(event.candidate != null){
                            console.log("Sending ICE candidate to", socketListId);
                            socket.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
                        }
                    }

                    connections[socketListId].ontrack = (event) => {
                        console.log("Track received from", socketListId, event.streams);
                        console.log("Stream tracks:", event.streams[0].getTracks());

                        // Update existing video or add new one
                        setVideos(videos=>{
                            let videoExits = videos.find(video=>video.socketId === socketListId);

                            if(videoExits){
                                // Update existing video stream
                                const updatedVideos = videos.map(video=>
                                    video.socketId === socketListId ? {...video,stream:event.streams[0]} : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }else{
                                // Add new video
                                let newVideo = {
                                    socketId:socketListId,
                                    stream : event.streams[0],
                                    autoPlay:true,
                                    playsinline : true,
                                    
                                }
                                const updatedVideos = [...videos,newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }
                        });
                    };


                    if(window.localStream != undefined && window.localStream != null){
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else{
                        
                        // let blackSlience 
                        let blackSlience = (...args) => new MediaStream(
                            [
                                black(...args),silence()
                            ]
                        )
                        window.localStream = blackSlience();
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                })

                if(id === socketIdRef.current){
                    for(let id2 in connections){
                        if(id2 === socketIdRef.current) continue

                        try{
                            window.localStream.getTracks().forEach(track => {
                                connections[id2].addTrack(track, window.localStream);
                            });
                        }catch(e){
                            console.log(e)
                        }

                        connections[id2].createOffer().then((description)=>{
                            connections[id2].setLocalDescription(description)
                            .then(()=>{
                                socket.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}))
                            })
                            .catch(e=>console.log(e))
                        })
                    }
                }
            })
        })
    }

    let sendMessage = () => {
    if (!message.trim()) return;

    socket.current.emit(
        "chat-message",
        message,
        username,
        socketIdRef.current
    );

    setMessage("");
};

    let getMedia = async ()=>{
        await startLocalStream();
        connectToSocketServer();
    }

    let connect = ()=>{
        setAskForUsername(false);
        getMedia();
    }

    const toggleAudio = () => {
  if (!window.localStream) return;

  window.localStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
  });

  setAudioEnabled(prev => !prev);
};

const toggleVideo = () => {
  if (!window.localStream) return;

  window.localStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
  });

  setVideoEnabled(prev => !prev);
};

const leaveMeeting = () => {
  try {
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
    }

    for (let id in connections) {
      connections[id].close();
      delete connections[id];
    }

    if (socket.current) {
      socket.current.disconnect();
    }

    setVideos([]);
    videoRef.current = [];
    setAskForUsername(true);
  } catch (e) {
    console.error(e);
  }

  routeTo("/home")
};




// REFACTORED SCREEN SHARING LOGIC
const toggleScreenShare = async () => {
  if (!window.localStream) return;

  // If currently sharing screen, revert to camera
  if (screen) {
    try {
      // Stop all tracks on the current localStream (screen)
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log(e);
    }
    // Switch back to camera
    const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    window.localStream = userMediaStream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = userMediaStream;
    }
    // Replace tracks for each peer
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      const senders = connections[id].getSenders();
      // For each track type, replace the sender's track
      userMediaStream.getTracks().forEach(newTrack => {
        const sender = senders.find(s => s.track && s.track.kind === newTrack.kind);
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      });
    }
    setScreen(false);
  } else {
    // Start screen share
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      // Optionally try to add audio from mic if not present
      if (displayStream.getAudioTracks().length === 0 && window.localStream) {
        window.localStream.getAudioTracks().forEach(track => {
          displayStream.addTrack(track);
        });
      }
      // Stop current camera/mic tracks
      try {
        window.localStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.log(e);
      }
      window.localStream = displayStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = displayStream;
      }
      // Replace tracks for each peer
      for (let id in connections) {
        if (id === socketIdRef.current) continue;
        const senders = connections[id].getSenders();
        displayStream.getTracks().forEach(newTrack => {
          const sender = senders.find(s => s.track && s.track.kind === newTrack.kind);
          if (sender) {
            sender.replaceTrack(newTrack);
          }
        });
      }
      setScreen(true);
      // When the screen share ends, revert to camera
      displayStream.getVideoTracks()[0].onended = async () => {
        // Stop all tracks on the screen stream
        displayStream.getTracks().forEach(track => track.stop());
        // Switch back to camera
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
        for (let id in connections) {
          if (id === socketIdRef.current) continue;
          const senders = connections[id].getSenders();
          userMediaStream.getTracks().forEach(newTrack => {
            const sender = senders.find(s => s.track && s.track.kind === newTrack.kind);
            if (sender) {
              sender.replaceTrack(newTrack);
            }
          });
        }
        setScreen(false);
      };
    } catch (e) {
      console.log(e);
    }
  }
};


useEffect(() => {
  if (showModal) {
    setNewMessages(0);
  }
}, [showModal]);


  return (
    <div className="video-meet-container"> 
         {askForUsername === true ? 
            <div className="lobby-container">
              
            <h2>Enter into Lobby</h2>
            
            <TextField id="outlined-basic" label="Username" value={username} onChange={e=>setUsername(e.target.value)} variant="outlined" />
            <Button variant="contained" onClick={connect} style={{marginTop: '20px'}}>Connect</Button>


            <div className="lobby-preview">
                <video ref={localVideoRef} autoPlay muted playsInline style={{width: '300px', display: 'block'}}></video>
            </div>
            
            </div> : 
            <div className="VideoCallComponent">
                
                {showModal ? 
                <div className="chatRoom">

                     <div className='chatConatiner'>
                         <div className="chatHeader">
                              <h1>Chat</h1>
                        </div>
                        <div className="chatMessages">
                          {messages.map((msg, index) => (
                            <div
                              key={index}
                              className={msg.socketId === socketIdRef.current ? "myMessage" : "otherMessage"}
                            >
                              <b>{msg.sender}:</b> {msg.text}
                            </div>
                          ))}
                        </div>
                        <div className="chattingArea">
                            <TextField value={message} onChange={(e)=>setMessage(e.target.value)} id="outlined-basic" label="Enter Your Chat" variant="outlined" />
                            <Button variant='contained' onClick={sendMessage}>Send</Button>
                        </div>
                         
                     </div>
                </div> : <></>
                }


                <div className="meet-controls">
                    <IconButton className="control-btn" onClick={toggleVideo}>
                         {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>

                    <IconButton
                       className="control-btn end-call-btn"
                       onClick={leaveMeeting}
                    >
                      <CallEndIcon />
                    </IconButton>

                    <IconButton className="control-btn" onClick={toggleAudio}>
                       {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                    </IconButton>

                    {screenAvailable === true ?
                    <IconButton style={{ color: "white" }} onClick={toggleScreenShare}>
                        {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                    </IconButton>
                    : <></>
                    }

                    <Badge badgeContent={newMessages} max={999} color='secondary'>
                        <IconButton onClick={()=>setModal(!showModal)}  style={{color:"white"}}>
                            <ChatIcon/>
                        </IconButton>
                    </Badge>


                </div>
               <div className="local-video-section">
                  <div className="local-video-wrapper">
                    <video ref={localVideoRef} autoPlay muted playsInline />
                   {username && <div className="username-overlay">{username}</div>}
                  </div>
               </div>

               <div className={`stage ${videos.length > 1 ? 'grid' : ''}`}>
                       {videos.length > 0 ? (
                          videos.map((video, index) => (
                         <video
                          key={video.socketId}
                          ref={ref => {
                           if (ref && video.stream) {
                             ref.srcObject = video.stream;
                           }
                         }}
                       autoPlay
                       playsInline
                     className="remote-video"
                    />
                  ))
        ) : (
            <div className="no-participants" style={{color:'white'}}>
               Waiting for others to join...
            </div>
        )}
    </div>
             </div>
                 }
            </div>
    )
}

export default VideoMeet