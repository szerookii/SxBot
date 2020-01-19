const apktool = require("./apktool");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");
const Discord = require("discord.js");

const SX_REPO = "https://github.com/SxClient/SxClient.git";
const DOWNLOAD_APKTOOL = "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.3.4.jar";
const DOWNLOAD_TOOLBOX = "https://www.apkmirror.com/wp-content/themes/APKMirror/download.php?id=806940";
const DOWNLOAD_SIGNAPK = "https://github.com/appium/sign/raw/master/dist/signapk.jar";

class SxClientBuilder {

	constructor(){
	    try {
	        console.log("[Builder] Checking for ApkTool jar...");
	        if(!this.apktoolExists()){
	            console.log("[Builder] ApkTool not exists, downloading...");
	            exec(`cd ${__dirname} && wget --output-document=apktool.jar ${DOWNLOAD_APKTOOL}`, err => {
	                if(err){
	                    console.log("[Builder] An error occured while downloading ApkTool.");
	                }
	                console.log("[Builder] ApkTool downloaded.");
	            });
	        }
	        else {
	            console.log("[Builder] ApkTool found.");
	        }
	    }
	    catch(err){
	        console.log("[Builder] An error occured while checking for ApkTool.");
	    }
	    try {
	        console.log("[Builder] Checking for SignApk jar...");
	        if(!this.signapkExists()){
	            console.log("[Builder] SignApk not exists, downloading...");
	            exec(`cd ${__dirname} && wget --output-document=signapk.jar ${DOWNLOAD_SIGNAPK}`, err => {
	                if(err){
	                    console.log("[Builder] An error occured while downloading SignApk.");
	                }
	                console.log("[Builder] SignApk downloaded.");
	            });
	        }
	        else {
	            console.log("[Builder] SignApk found.");
	        }
	    }
	    catch(err){
	        console.log("[Builder] An error occured while checking for ApkTool.");
	    }
	    /* Need approvement.
       try {
	        console.log("[Builder] Checking for Toolbox APK...");
	        if(!this.toolboxExists()){
	            console.log("[Builder] Toolbox not exists, downloading...");
	            exec(`cd ${path.join(_dirname, "..", "assets")} && wget --output-document=Toolbox.apk ${DOWNLOAD_TOOLBOX}`, err => {
	                if(err){
	                    console.log("[Builder] An error occured while downloading Toolbox.");
	                }
	                console.log("[Builder] Toolbox has been downloaded.");
	            });
	        }
	        else {
	            console.log("[Builder] Toolbox found.");
	        }
	    }
	    catch(err){
	        console.log("[Builder] An error occured while checking for Toolbox.");
	    }*/
	    
		this.isBuilding = false;
	}

	async build(){
		return new Promise((resolve, reject) => {
		    if(!this.toolboxExists()){
		        reject(new Error("Cannot find valid Toolbox APK"));
		    }
		    if(!this.apktoolExists()){
		        reject(new Error("Cannot find valid ApkTool jar"));
		    }
			if(this.isBuilding){
				reject(new Error("Already building an APK"));
			}

			this.isBuilding = true;
			console.log("[Builder] Starting building APK...");
			this.createWorkspace().then(dir => {
				console.log("[Builder] Workspace created. Decompiling to " + dir + "...")
				apktool.decompile(path.join(__dirname, "../assets", "Toolbox.apk"), path.join(dir, "Toolbox")).then(dDir => {
					console.log("[Builder] APK decompiled. Cloning repository...");
					this.clone(dir).then(repoDir => {
						console.log("[Builder] Repository cloned. Copying files...");
						fs.copy(path.join(repoDir, "sxclient"), path.join(dDir, "assets", "legacy", "1.11.0", "mods", "lua_mods", "toolbox_menu"), { overwrite: true }, error => {
							if(error){
								reject(error);
							}
							console.log("[Builder] Files copied. Recompiling...");
							apktool.compile(dDir, path.join(dir, "Toolbox.apk")).then(apk => {
								console.log("[Builder] APK successfully built at : " + apk);
								console.log("[Builder] Signing APK...");
								let certPath = path.join(__dirname, "..", "assets", "key.pk8");
								exec(`java -jar ${path.join(__dirname, "signapk.jar")} ${path.join(__dirname, "..", "assets", "cert.pem")} ${path.join(__dirname, "..", "assets", "key.pk8")} ${path.resolve(apk)} ${path.join(dir , "Toolbox_signed.apk")}`, error => {
								    if(error){
								        reject(error);
								    }
								    console.log("APK signed, copying to data...");
								    fs.copySync(path.join(dir, "Toolbox_signed.apk"), path.join(__dirname, "..", "data", "SxClient.apk"), { overwrite: true });
								    console.log("APK copied, resetting workspace...");
									this.deleteWorkspace();
									this.isBuilding = false;
									console.log("Done.");
									
									resolve();
								});
							}).catch(error => {
								reject(error);
							});
						});
					}).catch(error => {
						reject(error)
					});
				}).catch(error => {
					reject(error);
				})
			}).catch(error => {
				reject(error);
			});
		});
	}

	async clone(dir){
		return new Promise((resolve, reject) => {
			exec(`cd ${dir} && git clone ${SX_REPO}`, (error) => {
				if(error){
					reject(error);
				}
				resolve(path.resolve("./workspace/SxClient"));
			});
		})
	}

	async createWorkspace(){
		return new Promise((resolve, reject) => {
			try {
				fs.mkdirSync("./workspace");
				resolve(path.resolve("./workspace"));
			}
			catch(error){
				try{
				    if(fs.existsSync("./workspace")){
				        this.deleteWorkspace();
				        resolve(this.createWorkspace());
				    }
				} catch(err){
				    reject(err);
				}
			}
		});
	}
	
	apktoolExists(){
	    try{
	        return fs.existsSync(path.join(__dirname, "apktool.jar"));
	    }
	    catch(err){
	        return false;
	    }
	}
	
	signapkExists(){
	    try{
	        return fs.existsSync(path.join(__dirname, "signapk.jar"));
	    }
	    catch(err){
	        return false;
	    }
	}
	
	toolboxExists(){
	    try{
	        return fs.existsSync(path.join(__dirname, "..", "assets", "Toolbox.apk"));
	    }
	    catch(err){
	        return false;
	    }
	}

	deleteWorkspace(){
		try {
			fs.removeSync("./workspace");
			return;
		}
		catch(error){
			return;
		}
	}
}

module.exports = SxClientBuilder;