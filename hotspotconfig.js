

const exec = require('child_process').execSync;

checkIfHotspotNeeded=function(){
	if("linux"!=process.platform){
		console.log("Raspberrypi Only");
		return ;
	}

	var accessPoint = getConnectedAccessPoint();
	if(accessPoint == "" || accessPoint == "off/any"){
		//console.log("No Access point found");	
		var hotspot = isHotspotOn() ;	
		if(hotspot != "Master"){
			console.log("Hotspot Not set")			
		//	console.log("Setting Hotspot");	
			setHotspot();			
		}else {
			console.log("Conneted to Master");	
		}
	}else {
		console.log("Connected to Wifi");
	}	
}


startHotSpotIfNeeded = function(){
	var hotspot = isHotspotOn() ;	
	if(hotspot != "Master"){
		console.log("Hotspot Not set")			
		return setHotspot();			
	}else {
		console.log("Conneted to Master");
		return "Success" ;	
	}


}

stopHotSpotIfNeeded = function(){
	var hotspot = isHotspotOn() ;	
	if(hotspot == "Master"){
		console.log("Hotspot Not set")			
		return stopHotspot();			
	}else {
		console.log("Hotspot is Off");
		return "Success" ;	
	}


}


getConnectedAccessPoint=function(n){

	var output = "" , temp = "" , retVal = "" , scanCommand = 'iwconfig 2>&1 | grep ESSID';
	try{
		output  = exec(scanCommand).toString() ;
		temp = output.split("ESSID:") ;	
		
		//if(temp.lenght > 1 ){				
			retVal = temp[1].split(" ")[0].trim();
		//}
	}catch(error){
		//console.log("Access Point Error" +error.stderr) ;
		return "" ;
	}
	return retVal ;
}

getConnectedWifi=function(n){

	var output = "" , temp = "" , retVal = "" , scanCommand = 'iwconfig 2>&1 | grep ESSID';
	try{
		output  = exec(scanCommand).toString() ;
		temp = output.split("ESSID:") ;
		console.log()
		
		//if(temp.lenght > 1 ){				
			retVal = temp[1].trim();
		retVal = retVal.replace('"','');
		retVal = retVal.replace('"','');
		//}
	}catch(error){
		//console.log("Access Point Error" +error.stderr) ;
		return "" ;
	}
	return retVal ;
}


isHotspotOn=function(n){

	var output = "" ,temp, retVal = "" , scanCommand = "iwconfig 2>&1 | grep Mode";
	try{
		output  = exec(scanCommand).toString();
		temp = output.split("Mode:");	
		//if(temp.lenght > 1 ){
			retVal = temp[1].split(" ")[0].trim();
		//}
		//console.log("Conneted Hotspot : "+ retVal);
	}catch(error){
		//console.log("hotspot Error" +error.stderr) ;
		return "" ;
	}
	return retVal ;

}

setHotspot=function(n,e){
	try{
		console.log("setting hotspot");
		output  = exec('bash start-hotspot.sh').toString() ;
		return "Success"
		//output  = exec('bash "+(n?"start":"stop")+"-hotspot.sh').toString() ;
	}catch(error){
		console.log("Error Setting Hotspot" ) ;
		return "Failed" ;
	}

}

stopHotspot=function(n,e){
	try{
		console.log("stopping hotspot");
		output  = exec('bash stop-hotspot.sh').toString() ;
		return "Success"
	}catch(error){
		console.log("Error stopping Hotspot" ) ;
		return "Failed" ;
	}

}



exports.isHotspotOn = isHotspotOn ;
exports.checkIfHotspotNeeded = checkIfHotspotNeeded ;
exports.getConnectedAccessPoint = getConnectedAccessPoint ;
exports.setHotspot = setHotspot ;
exports.startHotSpotIfNeeded = startHotSpotIfNeeded ;
exports.stopHotSpotIfNeeded = stopHotSpotIfNeeded ;
exports.getConnectedWifi=getConnectedWifi;
