const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-phan:phannhat123@todolist.hmawx.mongodb.net/phancy_todolistDB",{useNewUrlParser: true} );

const itemSchema = {
    name: String
}

// first collection: Item
const Item = mongoose.model("Item", itemSchema)

const buyFood = new Item ({
    name: "Learning Fullstack",
  });
  
const cookFood = new Item ({
    name: "Learn Django",
  });
  
const eatFood = new Item ({
    name: "learn Animationns",
  });

const defaultItem = [buyFood, cookFood, eatFood];



app.get("/", function(req, res) {
  let current_date = new Date;
  let today_date = current_date.toLocaleDateString("en-US", date_options)
  
    Item.find({}, function(err, foundItems){
  
      if (foundItems.length === 0) {
        Item.insertMany( defaultItem, function(err){
          if (err) {console.log(err)}
          else {console.log("succesfullt launched !")}
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "PHANCY !", newListItems: foundItems, today_date: today_date});
      }
  
    });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "PHANCY !"){
    item.save();
    // The new Item is now in the server, we just need to redirect
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
}
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;
  console.log(listName)
  if (listName === "PHANCY !"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) { console.log(err)}
      else {console.log("succesfully remove out of the data !");
      res.redirect("/");
    }
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId }}}, function(err, foundList){
      if (!err){
        res.redirect("/"+ listName);
      }
    });
  }
})

// a new collection
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);
app.post("/:customListname", function(req, res){
  const customListname = req.body.title_input;
  res.redirect("/"+ customListname)
})

// It should be similar to the index page.
app.get("/:customListname", function(req, res){
  let current_date = new Date;
  let today_date = current_date.toLocaleDateString("en-US", date_options)
  const customListname = _.capitalize(req.params.customListname);

  List.findOne({name: customListname}, function(err, foundList){
    if (!err){
      if (!foundList) {
        const list = new List({
          name: customListname,
          items: defaultItem
        });

        list.save();
        res.redirect("/" + customListname);

        } else {
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items, today_date: today_date});
        }
    }
  });



})

app.listen(process.env.PORT, function() {
    console.log("Server started succesfully !");
});