require("dotenv").config();
const express = require('express');
const app = express();
const cors = require("cors");
const sql = require('./db');

app.use(cors());
app.use(express.json());

subscriptionRouter = require('./routes/subscriptions');
archiveRouter = require("./routes/archives");
fileRouter = require('./routes/file_upload');
app.use(subscriptionRouter);
app.use(archiveRouter);
app.use(fileRouter);


app.listen(process.env.PORT, () => {
    console.log('************server is running************');
});