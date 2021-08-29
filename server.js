const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT;
const axios = require("axios");
const mongoose = require("mongoose");
app.use(cors());
app.use(express.json());

mongoose
  .connect(
    process.env.REACT_APP_DB_CONNECTED
  )
  .then(() => {
    console.log("MongoDb Connected");
  })
  .catch((err) => {
    console.error("Not Connected...." + err);
  });

let RecipeSchema = {
  name: String,
  imageUrl: String,
  calories: Number,
};

let UserSchema = mongoose.Schema({
  email: String,
  recipe: [RecipeSchema],
});

let UserModel = mongoose.model("User", UserSchema);

// Add a new User with a new email
app.post("/add-user/:email", (req, res) => {
  let email = req.params.email;
  UserModel.find({ email: email }).then((result) => {
    if (result.length>0) {
      res.status(200).send("Email is existed");
    } else {
      let test = new UserModel({
        email: email,
        recipe: [],
      });
      test.save();
      res.status(200).send(test)
    }
  });
 
});
// add a new Recipe related with your email
app.post("/add-recipe/:email",(req,res)=>{
  let email=req.params.email;
 
  UserModel.find({email:email}).then(result=>{
    result[0].recipe.push(req.body)
    result[0].save();
    res.status(200).send({message:"recipe added successfully ", recipe:result})
  })


})
// get the data related with your email 
app.get("/recipe-fav/:email",(req,res)=>{
  let email=req.params.email;

  UserModel.find({email:email}).then(result=>{
    if(result.length>0)
    res.json(result)
    else{
      res.status(404).send("This Email not Found")
    }
  }).catch(err=>{
    res.status(500).send(err);
  })

})
// delete recipe related with your email 
app.delete("/recipe-delete/:email",(req,res)=>{
  let email=req.params.email;
  let id=req.body.id;
  UserModel.find({email:email}).then(result=>{
         
   let index=result[0].recipe.findIndex(item => {
    return item._id==id 
   })
  
  
    result[0].recipe.splice(index,1);
    res.send({message:"recipe delete successfully ",result:result});
    result[0].save();
  }).catch(err=>{res.status(500).send(err)})
  

})

app.put("/user-update/:email",(req,res)=>{
  let email=req.params.email;
  let array=req.body
  UserModel.findOneAndUpdate({email:email} ,{$set:{recipe:array} },{new:true}).then(result=>{
    res.send(result);
  })
})




app.get("/recipe", (req, res) => {
  let key = process.env.REACT_APP_API_KEY;
  let recipeName = req.query.q;
  let url = `https://api.edamam.com/api/recipes/v2?type=public&q=${recipeName}&app_id=c64ac740&app_key=${key}`;
  axios
    .get(url)
    .then((result) => {
      res.json(result.data);
    })
    .catch((err) => {
      console.error(`Something happen in you API....${err}`);
    });
});

app.listen(port, () => {
  console.log(`Listen On ${port}`);
});
