import express from "express";
import router from "./routers/router.js";
import cookieParser from 'cookie-parser';
import cors from "cors"


const app = express();

app.use(cors({
  origin: [
    'http://192.20.20.158:81',
    'http://192.20.20.158:3000',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  // methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json({limit:'10mb'}));
app.use(cookieParser())
app.use("/api", router);

export default app;
