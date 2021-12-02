const router = require("express").Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
// USER UPDATE
router.put('/update/:id', async (req,res)=>{
    const userId = req.body.userId;
    const id= req.params.id;
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }catch (e) {
                return res.status(500).json(e)
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })
            await res.status(200).json('Account has been updated')
        }catch (e) {
            return res.status(500).json(e)
        }
    }else{
        return res.status(403).json('You can update only your account')
    }
})

// DELETE USER
router.delete('/delete/:id', async(req,res)=>{
    const userId = req.body.userId;
    const id= req.params.id;
    if(userId === id || req.body.isAdmin){
        try{
            await User.findByIdAndDelete(id)
            await res.status(200).json('Account has been deleted')
        }catch (e) {
            return res.status(500).json(e)
        }
    }else{
        return res.status(403).json('You can update only your account')
    }
})
//GET USER
router.get('/', async(req,res)=>{
    const userId = req.query.userId
    const username = req.query.username
    console.log('Username: ', username)
    try{
        const user  = userId ? await User.findById(userId) : await User.findOne({username: username });
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)
    }catch(e){
        return res.status(500).json(e)
    }

})
//FOLLOW USERS
router.put('/follow/:id', async(req,res)=>{
    const userId = req.body.userId
    const paramsId = req.params.id
    if(userId !== paramsId){
        try{
            const user = await User.findById(paramsId)
            const currentUser = await User.findById(userId)
            if(!user.followers.includes(userId)){
                await user.updateOne({$push:{followers: userId}})
                await currentUser.updateOne({$push: {followings: paramsId}})
                res.status(200).json('User has Been Follwed')
            }else{
                res.status(200).json("You Allready Follow this users")
            }
        }catch (e){
            res.status(500).json(e)
        }
    }else{
        return res.status(403).json('You cant follow yourself')
    }
})
// UNFOLLOW USERS
router.put('/unfollow/:id', async(req,res)=>{
    const userId = req.body.userId
    const paramsId = req.params.id
    if(userId !== paramsId){
        try{
            const user = await User.findById(paramsId)
            const currentUser = await User.findById(userId)
            if(user.followers.includes(userId)){
                await user.updateOne({$pull:{followers: userId}})
                await currentUser.updateOne({$pull: {followings: paramsId}})
                res.status(200).json('User has Been unfollwed')
            }else{
                res.status(200).json("You Allready unFollow this users")
            }
        }catch (e){
            res.status(500).json(e)
        }
    }else{
        return res.status(403).json('You cant unfollow yourself')
    }
})

// GET FRIENDS
router.get("/friends/:userId", async (req,res)=>{
    const userId = req.params.userId
    try{
        const user = await User.findById(userId)
        const friends = await Promise.all(
            user.followings.map((friendId) =>{
                return User.findById(friendId)
            })
        )
        let friendList = []
        friends.map((friend)=>{
            const {_id, username, fullName, profilePicture } = friend
            friendList.push({_id, username, fullName, profilePicture});
        })
        console.log("FrindList: ", friendList)
        res.status(200).json(friendList)
    }catch (e) {
        res.status(500).json(e)
    }
})



module.exports = router