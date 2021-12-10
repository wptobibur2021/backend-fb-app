// Require File Declaration Below.........
const mongoose = require('mongoose');
const express = require('express')
require('dotenv').config()
// Backend Server Start Port
const port = process.env.PORT || 8000
// ID No Find
const morgan = require('morgan')
const helmet = require("helmet");
const cors = require('cors')
const app = express()
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/post')
const path = require("path");
const multer  = require('multer')
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// Middleware Below
app.use(helmet());
app.use(morgan('common'))
app.use(cors())
app.use(express.json())

// FILE STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets/post");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploded successfully");
    } catch (error) {
        console.error(error);
    }
});


app.use('/api/users', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)

mongoose.connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true},
    () => {
        console.log('Connected to MongoDB');
    }
);


// mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true}, ()=>{
//     console.log('database ok')
// });

//Root Get API
app.get('/', async (req,res)=>{
    await res.send('Backend Server')
})
app.listen(port, () =>{
    console.log(`'Backend Server Start at http://localhost:${port}`)
})
