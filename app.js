const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _= require("lodash");
const https=require("https");
const { name } = require("ejs");
const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//database stuff
mongoose.connect("mongodb+srv://KNNK:KNNK@cluster0.chhmj.mongodb.net/weatherDB");
const citySchema=mongoose.Schema({
    city:String
});
const City=mongoose.model("City",citySchema);
//


app.get("/", function(req, res)
{
    console.log("got get request");
    City.find(function(err,cities)
    {
        console.log("fetched data from db")
        if(err)
        {
            console.log(err);
        }
        else{
            console.log("inside else block");
            console.log(cities.length);
            const result=[];
            if(cities.length==0)
            {
                res.render("home",{city:result});
            }
            cities.forEach(function(element)
            {
                let query=element.city;
                const apiKey="ea40759a3e33b86d0c6ca593167f9a24";
                const unit="metric";
                const url="https://api.openweathermap.org/data/2.5/weather?q="+ query+"&appid="+apiKey+"&units="+unit;
               
                https.get(url,function(response)
                {
                    console.log("got data from api");
                     response.on('data',function(data)
                     {
                        const obj=JSON.parse(data);
                        let details={
                        name:query,
                        temp:obj.main.temp,
                        desc:obj.weather[0].description,
                        code:obj.weather[0].icon
                        };
                        result.push(details);
                    
			if(result.length==cities.length)
			{
                console.log("rendered page");
				res.render("home",{city:result});
			}

                    });
                });
                

            });
            
        }
    });
});
//post
app.post("/", function(req, res)
{
    if(req.body.function=='add'&&req.body.newCity!='')
    {
        const newcity=new City({
            city:req.body.newCity
        });
        newcity.save(function(err, data){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.redirect("/");
            }
        });
    }
    else
    {
        console.log(req.body.function);
        City.find({city:String(req.body.function)},function(err, data){
            if(err){
                console.log(err);
            }
            else {
                console.log(data);
            }
        });
        City.deleteOne({city:req.body.function},function(err)
        {
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/");
            }
        });
    }
});

//listen 
//listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port,function()
{
    console.log("server started on port"+port);
});