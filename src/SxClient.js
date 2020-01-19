const Discord = require("discord.js");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const conf = require(path.join(__dirname, "data", "config.json"));
const Builder = require("./modules/builder");

global.app = express();
global.bot = new Discord.Client({ disableEveryone: true, autoReconnect: true });
global.builder = new Builder();

// web
app.use(bodyParser.json({ extended: true }));
app.use(require("./router"));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.set("view engine", "ejs");

app.listen(80, function(){
	console.log("Web server is running.");
});

// bot
bot.on("ready", function(){
	console.log("Client logged in : " + bot.user.tag);
	setInterval(() => {
	    bot.user.setActivity("SxClient's Github and  " + bot.guilds.size + " servers (" + bot.users.size + " users)", { type: "WATCHING" });
	}, 8000);
});

bot.on("message", function(msg){
	// ToDo
});

bot.login(conf["token"]);