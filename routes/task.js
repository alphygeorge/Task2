
const jwt = require('jsonwebtoken');
const Task = require("../models/task");
const { Router } = require("express");
const User = require("../models/user");


const router = Router();


router.get('/add-new',(req, res) => {return res.render( 'task', {
  
  user: req.user,
  } )})
  
router.post("/add-new", async (req, res) => {
  try {
    await Task.create({
      name: req.body.Name,
      content: req.body.Message,
      createdBy: req.user._id,
    });
    console.log(User);
    return res.redirect('/task/view');
  } catch (error) {
    console.error("Error creating task:", error);
    // Handle the error, send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

router.get("/view", async (req, res) => {
  try {
    // Access cookies from the request object
    const cookies = req.cookies; 
    console.log(cookies);
    // Retrieve the JWT token from cookies
    const token = cookies.token;
    // Verify the JWT token
    const decodedToken = jwt.verify(token, '$uperMan@123');
    const userId = decodedToken._id; // Assuming user ID is stored in _id field
    console.log('User ID:', userId);
    console.log(req.user);

    // Find tasks created by the user
    const tasks = await Task.find({ createdBy: userId }).populate("createdBy");
    return res.render( 'taskdisplay', {user: req.user,tasks} )
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/delete", async (req, res) => {
  try {
    console.log(req.body.id);
    const taskId = req.body.id;
    // Find the task by ID and delete it
    await Task.findByIdAndDelete(taskId);
    return res.redirect('/task/view');
  } catch (error) {
    console.error("Error deleting task:", error);
    // Handle the error, send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});


router.post("/edit", async (req, res) => {
  try {
    const taskId = req.body.id;
    const  newContent  = req.body.newTask;
    // Find the task by ID and update its name and content
    await Task.findByIdAndUpdate(taskId, { content: newContent });
    return res.redirect('/task/view');
  } catch (error) {
    console.error("Error updating task:", error);
    // Handle the error, send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
