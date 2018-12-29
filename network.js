

var fs = require("fs");

const exec = require('child_process').execSync;

var scanCommand = "sudo iwlist wlan0 scan" ; // Command to get the list of available networks

var beforeText ;

//File stores all the saved networks  
var filePath = "/etc/wpa_supplicant/wpa_supplicant.conf";

function sourceObject(ssid , pwd , priority ,saved , secure){
	this.ssid = ssid ;
	this.pwd = pwd ;
	this.priority = priority ;
	this.isSaved = saved;
	this.isSecure= secure ;	
}


var exports = module.exports = {};

getSavedSources = function(){

//Change the Permissions of the file before Reading 
	try{
		exec('sudo chmod 777 /etc/wpa_supplicant/wpa_supplicant.conf') ;
	}catch(error){
		console.log("Error Changing Permissions" + error.stderr) ;
	}

	var contents = fs.readFileSync(filePath , 'UTF-8') ;


//	console.log("Contents" , contents);
	beforeText = contents.slice(0 , contents.indexOf("network={")); 
	var allLines = contents.toString().split("\n");
	var allSources = [] ;
	var uname , pwdd  ,priority = 0, networkFound = false;

	allLines.forEach(function(line){
		if(line.search("network") >= 0){
			networkFound = true ;
		}
		if(networkFound && line.search("ssid=") >= 0){
			var index1 = line.indexOf("\"") , index2 = line.lastIndexOf("\"");
			uname = line.slice(index1+1,index2);
		}
		if(line.search("psk=") >= 0 && uname != ""){
			var index1 = line.indexOf("\"") , index2 = line.lastIndexOf("\"");
			pwdd = line.slice(index1+1,index2);
		}
		if(line.search("priority=") >= 0 && uname != ""){
			var index1 = line.indexOf("=");
			var prio = line.slice(index1+1);
	
			if(!Number.isNaN(prio)){
				priority = parseInt(prio);
			}	
		}
		if(line.search("}") >= 0 && uname != ""){
			allSources.push(new sourceObject(uname , pwdd , priority));
			uname = "" , pwdd = ""  , priority = 0;
			networkFound = false ;				
	}

	});
	return allSources ;
}	


getsavedJson = function(){

	var allSources  = getSavedSources();
	var byPriority  = allSources.slice(0);
	var foundIndex  , length = allSources.length;
	byPriority.sort(function(a,b) {
	    return a.priority - b.priority;
	});

	var jsonObj  = {} ;
	var key  = "savedNetworks" ;
	jsonObj[key] = [] ;

	for(var i = 0 ; i<length ; i++ ){
		var data = {
			ssid 	 :  byPriority[i].ssid ,
			psk  	 :  byPriority[i].pwd ,
			priority :  byPriority[i].priority ,
			key_mgmt :  'WPA-PSK'		
		}
		jsonObj[key].push(data);
	}

	return jsonObj ;
}


/*
Function to read all the saved networks from the file.	
*/



scanSource = function(){

	//Check if hotspot is On
	/*var hotconfig = require('./hotspotconfig.js');
	var hotspot = hotconfig.isHotspotOn();
	if(hotspot == "Master"){
		return [];
	}*/

	var output , availableNetworks = [] ;	
	try{
		output = exec(scanCommand).toString() ;
		//console.log(output);
	}catch(error){
		console.log(error.stderr) ;
		return [] ;
	}
	var uniqList=[];
	var allLines = output.toString().split("\n");
	var svdSources = getSavedSources();
	var enc ;
	allLines.forEach(function(line){


		if(line.search("Encryption key:") >= 0){	
			var index1 = line.indexOf(":") ;
			enc  = line.slice(index1+1) ;
			//console.log("Key : " + enc);	
		
		}
		if(line.search("ESSID:") >= 0){
			var index1 = line.indexOf("\"") , index2 = line.lastIndexOf("\"");
			
			sid  = line.slice(index1+1,index2) ;
			//console.log("Ading" + sid);
			var saved = false;
			svdSources.forEach(function(var1){
				if(var1.ssid == sid){
					saved = true ;
					//console.log(sid +" Already Saved")	
					//break;	
				}
			});
			
			if(!uniqList.includes(sid)){
				uniqList.push(sid);
				availableNetworks.push(new sourceObject(sid , "" ,0 , saved , enc)) ;
				
			}
		}
	});
	//console.log("avbl : " + availableNetworks);
	return 	availableNetworks ;	

	//var output , availableNetworks = [] ;
	//var svdSources = getSavedSources();
	/*var Wifi = require('rpi-wifi-connection');
		var wifi = new Wifi();

			 
		wifi.scan().then((ssids) => {
		//    console.log(ssids);

			ssids.forEach(function(item){
				var sid  = item.ssid ;
		
				var saved = false;
				svdSources.forEach(function(var1){
					if(var1.ssid == sid){
						saved = true ;
					}
				});
				console.log("SSID :" +sid);	
				availableNetworks.push(new sourceObject(sid , "" ,0 , saved));
		
			})
	

		})
		.catch((error) => {
		//    console.log(error);
		});

		console.log(availableNetworks);
		return 	availableNetworks ;	
	*/

		/*try{
			output = exec(scanCommand).toString() ;
			console.log("output : "+output);
		}catch(error){
	//		console.log(error.stderr) ;
			return [] ;
		}
		var allLines = output.toString().split("\n");
		var svdSources = getSavedSources();
		allLines.forEach(function(line){
			if(line.search("ESSID:") >= 0){
				var index1 = line.indexOf("\"") , index2 = line.lastIndexOf("\"");
			
				var sid  = line.slice(index1+1,index2) ;
				var saved = false;
				svdSources.forEach(function(var1){
					if(var1.ssid == sid){
						saved = true ;
						//console.log(sid +" Already Saved")	
						//break;	
					}
				});
				availableNetworks.push(new sourceObject(sid , "" ,0 , saved));
			}		
		});	*/
		 
}


wifiReconfig = function(){
	var output;	
	try{
		output = exec('wpa_cli -i wlan0 reconfigure').toString() ;
	}catch(error){
		//console.log(error.stderr) ;
		return error.stderr ;
	}
	/*var sleep = require('sleep');
	sleep.msleep(500) ;
	return 	"Wifi Reconfigure Success" ;*/	
	
	setTimeout(function(){
		return 	"Wifi Reconfigure Success" ;
	}, 500);
}

writeFile = function(networkSources){
		
	var fileContents = beforeText.trim() + "\n";

	var length = networkSources.length;
	for(var i = 0 ; i < length ; i++){
		var wpapsk = "WPA-PSK" ;
		if(networkSources[i].pwd == "" || networkSources[i].pwd == undefined ){
			wpapsk = "NONE"
		}
		fileContents = fileContents +"\n"+ "network={\n" + "	ssid=\"" +networkSources[i].ssid + "\"\n" ;
		if(wpapsk != "NONE"){
			fileContents = fileContents + "	psk=\"" +networkSources[i].pwd 	+ "\"\n" ;
						    		
		}
						
		fileContents = fileContents  + "	priority=" +networkSources[i].priority + "\n"
					+ "	key_mgmt=" + wpapsk 

						+ "\n}\n\n" ;			
	}

	try{
		exec('sudo chmod 777 /etc/wpa_supplicant/wpa_supplicant.conf') ;
	}catch(error){
		//console.log("Error Changing Permissions" + error.stderr) ;
	}
	fs.writeFileSync(filePath, fileContents);	
} 
//Remove a Network Source frm the saved List .
forgetNetwork = function(uname , cb){
//	console.log("uname : "+uname);
//	console.log("start of forget function----------------------------");
	var allSources  = getSavedSources();
	var byPriority  = allSources.slice(0);
	var found = false , foundIndex  , length = allSources.length;
	byPriority.sort(function(a,b) {
	    return a.priority - b.priority;
	});
	for(var i = 0 ; i < length ; i++){
		if(found){
			byPriority[i].priority -= 1 ;			
		}
		if(byPriority[i].ssid == uname){
			found = true ;
			foundIndex = i ;
		}
	}	
	if(found){
		byPriority.splice(foundIndex , 1);
//		console.log(byPriority);	
		writeFile(byPriority);
		var hotconfig = require('./hotspotconfig.js');
		var hotspot = hotconfig.isHotspotOn();
		if(hotspot != "Master"){
			wifiReconfig();
		}

		
	}
	
//	console.log("End of forget function----------------------");
	cb();
}


//Get The list of all the SSIDS
getSavedSsids = function(){
	var allSources  = getSavedSources();
	var ssids = []  , length = allSources.length;
	for(var i = 0 ; i < length ; i++){
		ssids.push(allSources[i].ssid);
	}

	return ssids ;
}


connect = function(uname , cb){

	//Check if hotspot is On
	var hotconfig = require('./hotspotconfig.js');
	var hotspot = hotconfig.isHotspotOn();
	var isHotOn=false;
	if(hotspot == "Master"){
		//console.log("Stopping Hotspot");	
		isHotOn=true;
		try{
			output  = exec('bash stop-hotspot.sh').toString() ;
			
		}catch(error){
			console.log("Error stopping Hotspot" ) ;
			return "" ;
		}
	}

	var allSources  = getSavedSources();
	var pwdd = "" ;
	var byPriority  = allSources.slice(0);
	var found = false , length = allSources.length;
	
	byPriority.sort(function(a,b) {
	    return a.priority - b.priority;
	});
	//console.log(byPriority);

	for(var i = 0 ; i < length ; i++){
//	console.log("Priority is " + byPriority[i].priority +"\n");
		if(found && byPriority[i].priority > 0){
			byPriority[i].priority -= 1 ;			
		}
//		console.log(byPriority[i].ssid);
		if(byPriority[i].ssid == uname){
//			pwdd = 	byPriority[i].pwd ;
			forgetNetwork(uname , function(){});
//			console.log("Hello----------------------");
//			addNew(uname , pwdd , function(){})
//			console.log("Found SSID\n");
			found = true ;
			byPriority[i].priority = length ;
		}
	}

	if(found){
		
		byPriority.sort(function(a,b) {
	    		return a.priority - b.priority;
		});
		
		writeFile(byPriority);
		wifiReconfig();
	}
	cb(isHotOn);	

}


//Connect to a particular Wifi with username and Password.
addNew = function(uname , pwwd ,cb){
	
	var allSources  = getSavedSources();

	var byPriority  = allSources.slice(0);
	var alreadySaved  = false  , length = allSources.length ; 
	byPriority.sort(function(a,b) {
	    return a.priority - b.priority;
	});

	for(var i = 0 ; i < length ; i++){
		if(byPriority[i].ssid == uname){
			alreadySaved = true ;
			byPriority[i].pwd = pwwd ;
		}
	}
	if(!alreadySaved){
		var newObject = new sourceObject(uname , pwwd , 0)
		if(length == 0){
			byPriority.push(newObject);
		}else{
			byPriority.sort(function(a,b) {
		    		return a.priority - b.priority;
			});
			byPriority.unshift(newObject);
		}
	}
	writeFile(byPriority);		
	//Call Back function.
	cb();
	
} 

saveAndConnect = function(uname , pwwd , cb){
	addNew(uname , pwwd  , function(){
		connect(uname , cb);
	});
	
}


exports.getSavedSources = getSavedSources ;
exports.addNew = addNew ;
exports.connect = connect ;
exports.getSavedSsids = getSavedSsids ;
exports.forgetNetwork = forgetNetwork ;
exports.writeFile = writeFile ;
exports.wifiReconfig = wifiReconfig  ;
exports.scanSource = scanSource ;
exports.saveAndConnect = saveAndConnect ;
exports.getsavedJson = getsavedJson ;