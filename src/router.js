const Discord = require("discord.js");
const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const router = express.Router();

router.post("/api/sxclient/github", function(req, res){
	res.status(200).json(
	{
		"message": "Sucessfully handled POST request."
	});

	let body = req.body;
	//if(body.hook && body.hook.events && body.hook.events.includes("push")){
		if(body.repository && body.repository["full_name"] === "SxClient/SxClient"){
			console.log("[Router] Received a Github webhook POST, handling...");
			builder.build().then(() => {
			    let news = "";
			    body.commits.forEach(commit => {
			        news += "- " + commit.message + " - " + commit.author.name + "\n";
			    });
			    
			    let embed = new Discord.RichEmbed()
			        .setTitle("SxClient - Build succeded")
			        .setColor("GREEN")
			        .addField("What's new?", news)
			        .addField("Download", "[Click here](http://sxclient.seyz.me:8086/download)")
			        .setFooter(bot.user.username, bot.user.avatarURL);
			        
			    bot.channels.map(c => {
			        if(c.name === "sxclient-builds"){
			            c.send(embed).catch(err => {
			                console.log("Cannot send embed.");
			            });
			        }
			    });
			}).catch(error => {
				console.log("An error occured during building APK. Build failed.");
				return;
			});
		//}
	}
});

app.get("/", function(req, res){
    res.render("index");
});

app.get('/download', function(req, res){
    try {
        if(fs.existsSync(path.join(__dirname, "data", "SxClient.apk"))){
            res.download(path.join(__dirname, "data", "SxClient.apk"), "SxClient.apk");
        }
        else {
            res.status(404).end("Cannot find any SxClient's APK.");
        }
    }
    catch(err){
        res.status(404).end("Cannot find any SxClient's APK.");
    }
});

app.get("/bot", function(req, res){
    res.redirect("https://discordapp.com/oauth2/authorize?client_id=622550617419939890&scope=bot&permissions=1275456593");
});

module.exports = router;