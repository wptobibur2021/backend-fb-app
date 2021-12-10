const route = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
    // REGISTER
    route.post('/registration', async (req,res)=>{
        try{
            // Password Generate
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(req.body.password, salt)
            // New User Create
            const newUser = await new User({
                username: req.body.username,
                fullName: req.body.fullName,
                password: hashedPass,
                email: req.body.email
            })
            // User Info save and send response
            const user = await newUser.save()
            await res.status(200).json(user)
        }catch (e) {
           await res.status(500).json(e.message)
        }
    })
    // LOGIN
    route.post('/login', async (req, res)=>{
        const email = req.body.email
        console.log(email)
        // const user = await User.findOne({email: req.body.email})
        // !user && await res.status(400).json('User not found')
        // const validPassword = await bcrypt.compare(req.body.password, user.password)
        // !validPassword && await res.status(400).json('Wrong Password')
        // await res.status(200).json(user)

        try{
            const user = await User.findOne({email: req.body.email})
            !user && await res.status(400).json('User not found')
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            !validPassword && await res.status(400).json('Wrong Password')
            await res.status(200).json(user)
        }catch (e) {
            await res.status(500).json(e.message)
        }
    })
module.exports = route