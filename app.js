// these are the required packages
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import _ from "lodash";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import "dotenv/config";

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// connect to database
mongoose.connect(process.env.BLOGDB);

// create a new schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});


// create a model for the schema
const Post = mongoose.model("Post", postSchema);


const app = express();

app.set('view engine', 'ejs');

// parse the data from the frontend
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = [];

// render the home route
app.get("/", (req, res) => {

  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts
    });

});



app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});


app.get("/posts/:postId", (req, res) => {
  const requestedId = req.params.postId;

  // renders the blog post with post _id
  Post.findOne({_id: requestedId}).then((post) =>{
    if (post) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    }
  }).catch((err) => {
    console.log(err)
  });

});

app.post("/compose", (req, res) => {

  // add new items to the database
  const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });
    
    // fix a bug and make sure it is saved successfully
    post.save().then(() => {
      console.log("Successfully saved to database");
      res.redirect("/")
    }).catch((err) => {
      console.log(err);
    });

    // add new items to the empty array
  posts.push(post)
    
  console.log(post)
    
});


// POST request handler for your form
app.post('/send-email', async (req, res) => {
  const { name, email, subject, message } = req.body;
  

  // Create a Nodemailer transporter using your email service (e.g., Gmail)
  const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: process.env.EMAIL, // Replace with your email address
          pass: process.env.PASSWORD, // Replace with your email password
      },
      tls: {
          rejectUnauthorized: false, // Add this line to disable SSL/TLS verification
      },
  });
  console.log(name, email, subject, message);

  // Email message configuration
  const mailOptions = {
      from: email,
      to: process.env.EMAIL, // Replace with the recipient's email address
      subject: subject,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong><br>${message}</p>`,
  };

  try {
      // Send the email
      await transporter.sendMail(mailOptions);
      res.redirect("/contact");
  } catch (error) {
      console.error(error);
      res.status(500).send('Email could not be sent');
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
