import { AuthContext } from "../contexts/AuthContext"
import React, {useContext, useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";

const History = () => {

    const {getHistoryOfUser} = useContext(AuthContext)

    const [meetings,setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(()=>{
        const fetchHistory = async()=>{
            try{
              const history = await getHistoryOfUser();
              setMeetings(history);
            }catch(err){
               console.log(err)
            }
        }
        fetchHistory();
    },[getHistoryOfUser])

    let formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid date";

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

  return (
    <div>
                <IconButton onClick={()=>{
                    routeTo("/home")
                }}>
                <HomeIcon/>
                </IconButton>
      {
        meetings.map((e, index) => {
            return (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            MeetingCode: {e.meetingCode}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                            Date: {formatDate(e.joinedAt || e.createdAt)}
                        </Typography>
                    </CardContent>
                </Card>
            )
        })
      }
    </div>
  )
}

export default History;
