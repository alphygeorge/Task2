const File = require("../models/file");
const { Router } = require("express");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const jwt = require('jsonwebtoken');
const session = require('express-session');


const router = Router();

router.use(session({
  secret: '$uperMan@123', // Change 'your_secret_key' to your actual secret key
  resave: false,
  saveUninitialized: true
}));

router.get('/add-file',(req, res) => {return res.render( 'file', {
    user: req.user,
  } )})
module.exports = router;



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.post('/add-file', upload.single('fileupload'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { originalname, mimetype, buffer, path } = req.file;

    const newFile = new File({
      filename: originalname,
      contentType: mimetype,
      content: buffer,
      path: path,
      createdBy: req.user._id,
      fileURL: `/uploads/${req.file.filename}`,
    });

    await newFile.save();

    res.redirect('/file/viewfile')
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});

// Route to serve uploaded files
const fs = require('fs');

// Route to download a file
router.post('/download', async (req, res) => {
  try {
    // Find the file by its ID
    const fileId = req.body.id;
    
    if (!fileId) {
      return res.status(400).send('File ID is required.');
    }
    
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).send('File not found.');
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    
    // Stream the file data from the file's path
    const fileStream = fs.createReadStream(file.path);
    
    // Pipe the file data to the response stream
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).send('Invalid file ID format.');
    }
    
    res.status(500).send('Error downloading file.');
  }
});

router.post('/generatedownloadlink', async (req, res) => {
  try {
    console.log("ID  ", req.body.id);
    const fileId = req.body.id;

    if (!fileId) {
      return res.status(400).send('File ID is required.');
    }

    // Find the file by its ID
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).send('File not found.');
    }

    // Generate a signed token containing file ID
    const token = jwt.sign({ fileId: file._id }, '$uperMan@123', { expiresIn: '1h' }); 

    // Construct the download URL with the token
    const downloadUrl = `${req.protocol}://${req.get('host')}/file/download/${token}`;
    
    // Store the download URL in session
    req.session.downloadUrl = downloadUrl;

    // Redirect to the /link route
    res.redirect('/file/link');
  } catch (error) {
    console.error('Error generating download link:', error);
    res.status(500).send('Error generating download link.');
  }
});

router.get('/link',(req, res) => {
  // Retrieve the download URL from session
  const downloadUrl = req.session.downloadUrl;
  // Render the 'link' template with the download URL
  return res.render('link', {
    user: req.user,
    downloadUrl: downloadUrl
  });
});
module.exports = router;

router.get("/viewfile", async (req, res) => {
  try {
    // Access cookies from the request object
    const cookies = req.cookies; 
    // Retrieve the JWT token from cookies
    const token = cookies.token;
    // Verify the JWT token
    const decodedToken = jwt.verify(token, '$uperMan@123');
    const userId = decodedToken._id; // Assuming user ID is stored in _id field
    // Find tasks created by the user
    const tasks = await File.find({ createdBy: userId }).populate("createdBy");
    // Pass tasks to the template
    return res.render( 'viewfile', {tasks,user: req.user} )
    //return res.render("taskdisplay", { tasks });
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/download/:token', async (req, res) => {
  const token = req.params.token;
  
  try {
      // Verify the token
      const decodedToken = jwt.verify(token, '$uperMan@123');
      
      // Extract the file ID from the token payload
      const fileId = decodedToken.fileId;
      
      // Find the file by its ID
      const file = await File.findById(fileId);
      
      if (!file) {
          return res.status(404).send('File not found.');
      }
      
      // Set headers for file download
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
      
      // Stream the file data from the file's path
      const fileStream = fs.createReadStream(file.path);
      
      // Pipe the file data to the response stream
      fileStream.pipe(res);
  } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).send('Error downloading file.');
  }
});

module.exports = router;
