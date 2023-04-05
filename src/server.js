import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine"
import initWebRouters from "./route/web"
// import connectDB from './config/connectDB'
import cors from 'cors'
import http from 'http'

require('dotenv').config();

const app = express();
const server = http.createServer(app)


// config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: true }))

viewEngine(app);
initWebRouters(app);

// connectDB();

let port = process.env.PORT || 2002;

server.listen(port, () => {
    console.log("Running on the port: " + port)
});


