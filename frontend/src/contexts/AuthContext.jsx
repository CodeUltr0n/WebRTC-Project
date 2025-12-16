import { createContext,  useState, useEffect } from "react";
import axios, { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const router = useNavigate();

    // Load user from token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Optional: fetch user info from backend if available
            client.get("/me", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setUserData(res.data.user))
                .catch(err => {
                    console.error("Failed to fetch user:", err);
                    localStorage.removeItem("token");
                });
        }
    }, []);

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", { name, username, password });
            if (request.status === HttpStatusCode.Created) {
                return request.data.message;
            }
        } catch (err) {
            console.error("Registration failed:", err.response?.data?.message || err.message);
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const request = await client.post("/login", { username, password });
            if (request.status === HttpStatusCode.Ok) {
                localStorage.setItem("token", request.data.token);
                
                // Store user info if backend provides it
                if (request.data.user) setUserData(request.data.user);

                router("/home"); // navigate after login
            }
        } catch (err) {
            console.error("Login failed:", err.response?.data?.message || err.message);
            throw err;
        }
    };

    const getHistoryOfUser = async () => {
        try {
           
            let request = await client.get("/get_all_activity", {
                params: {
                   token:localStorage.getItem('token')
                },
            });
            return request.data;
        } catch (err) {
            console.error("Failed to fetch history:", err.response?.data?.message || err.message);
            throw err;
        }
    };

    const addToUserHistory = async (meetingCode) => {
        try{
            let request = await client.post("/add_to_activity",{
                token:localStorage.getItem('token'),
                meeting_code:meetingCode
            });
            return request
        }catch(err){
             console.log('failed to add user history',err.response?.data?.message || err.message)
              throw err;
        }
    }

    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory
    };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};