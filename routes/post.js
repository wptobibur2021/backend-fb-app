const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
// CREATE POST
router.post('/create',  async (req, res)=>{
    const newPost = new Post(req.body)
    console.log("New Post: ", newPost)
    try{
        const savePost = await newPost.save()
        res.status(200).json(savePost)
    }catch(err){
        res.status(500).json(err.message)
    }
})
// UPDATE POST
router.put('/update/:id', async (req, res)=>{
    const paramsId = req.params.id
    const userId = req.body.userId
    try{
        const post = await Post.findById(paramsId)
        if(post.userId === userId){
            await post.updateOne({$set: req.body})
            res.status(200).json('The Post Has been Updates')
        }else{
            res.status(403).json('You can update only your post')
        }
    }catch(err){
        res.status(500).json(err)
    }
})
// DELETE POST
router.delete('/delete/:id', async (req, res)=>{
    const paramsId = req.params.id
    const userId = req.body.userId
    try{
        const post = await Post.findById(paramsId)
        if(post.userId === userId){
            await post.deleteOne()
            res.status(200).json('Your Post Has been Delete')
        }else{
            res.status(403).json('You Can Not Update')
        }
    }catch (err){
        res.status(500).json(err)
    }
})
// LIKE & DISLIKE A POST
router.put('/like/:id', async(req, res)=>{
    const paramsId = req.params.id
    const userId = req.body.userId
    try{
        const post = await Post.findById(paramsId)
        if(!post.likes.includes(userId)){
            await post.updateOne({$push: {likes: userId}})
            res.status(200).json("This Post has been liked")
        }else{
            await post.updateOne({$pull: {likes: userId}})
            res.status(200).json('The Post Has Been Disliked')
        }
    }catch (err){
        res.status(500).json(err)
    }
})

// LIKE & DISLIKE A POST
router.put('/heart/:id', async(req, res)=>{
    const paramsId = req.params.id
    const userId = req.body.userId
    try{
        const post = await Post.findById(paramsId)
        if(!post.likes.includes(userId)){
            await post.updateOne({$push: {hearts: userId}})
            res.status(200).json("This Post has been hearted")
        }else{
            await post.updateOne({$pull: {hearts: userId}})
            res.status(200).json('The Post Has Been Dishearted')
        }
    }catch (err){
        res.status(500).json(err)
    }
})

// GET A POST
router.get('/:id', async(req, res)=>{
    const paramsId = req.params.id
    try{
        const post = await Post.findById(paramsId)
        res.status(200).json(post)
    }catch(err){
        res.status(500).json(err)
    }
})
// TIMELINE POST
router.get('/timeline/:id', async(req, res)=>{
    const userId = req.params.id
    try{
        const currentUser = await User.findById(userId)
        const userPosts = await Post.find({userId: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId)=>{
                return Post.find({userId:friendId})
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    }catch(error){
        res.status(500).json(error)
    }
})
// USER POSTS
router.get('/profile/:username', async (req,res)=>{
    const userName = req.params.username
    try{
        const user = await User.findOne({username: userName})
        const posts = await Post.find({userId: user._id})
        console.log(posts)
        res.status(200).json(posts)
    }catch (e) {
        res.status(503).json(e)
    }
})

module.exports = router