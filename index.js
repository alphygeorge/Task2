
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookiePaser = require("cookie-parser");

const userRoute = require("./routes/user");
const taskRoute = require("./routes/task");
const fileRoute = require("./routes/file");


const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose.connect('mongodb://127.0.0.1:27017/task2',{
    
},).then(()=>console.log('connected sucessfully'))
.catch((err) => {console.error(err);})

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));


app.get("/", async (req, res) => {
  
  res.render("home", {
    user: req.user,
    
  });
});

app.use("/user", userRoute);
app.use("/task", taskRoute);
app.use("/file", fileRoute);




app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
