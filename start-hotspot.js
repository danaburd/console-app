var fs = require('fs');
var exec = require('exec');

var DHCPCD_CONFIG = "/etc/dhcpcd.conf";
var INTERFACES_CONFIG = "/etc/network/interfaces";

var HOTSPOT_DHCPCD_VAR = ["nohook wpa_supplicant", "interface wlan0", "static ip_address=192.168.220.1/24",
	"static routers=192.168.220.0","denyinterfaces wlan0"];

var HOTSPOT_INTERFACES_VAR = ["auto lo","iface lo inet loopback","iface eth0 inet manual","allow-hotplug wlan0"];

fs.readFile(DHCPCD_CONFIG, function(err, contents) {
  if(err) {
    console.log(err);
    return;
  }
  
  
  var newContents = [];
  var addedLine = true;
  contents = contents + "";
  
  contents.split("\n").forEach(function(line) {
	 
	if(!HOTSPOT_DHCPCD_VAR.includes(line.trim())){
		var lineLength=	line.trim().length;
		
		if(lineLength==0 && addedLine){
			newContents.push(line);
			addedLine = false;
		}else if(lineLength>0){
			newContents.push(line);
			addedLine = true;
		}
	}
 });

  newContents = newContents.join("\n")+"\n"+HOTSPOT_DHCPCD_VAR.join("\n")+"\n";
  //console.log("DHCPCD newContents : "+newContents);
  
    
  fs.writeFile(DHCPCD_CONFIG, newContents, function(err) {
    if(err) {
      console.log(err);
      return;
    }
    
    fs.readFile(INTERFACES_CONFIG, function(err, contents) {
      if(err) {
        console.log(err);
        return;
      }
      
      var newContents = [];
      addedLine = true;
      contents = contents + "";
      contents.split("\n").forEach(function(line) {
    	  if(!HOTSPOT_INTERFACES_VAR.includes(line.trim())){
    		  var lineLength=	line.trim().length;
    		  if(lineLength==0 && addedLine){
    			  newContents.push(line);
    				addedLine = false;
    			}else if(lineLength>0){
    				newContents.push(line);
    				addedLine = true;
    			}
    	  }
	  });
      newContents = newContents.join("\n")+"\n"+HOTSPOT_INTERFACES_VAR.join("\n")+"\n";
      
      //console.log("Interface newContents : "+newContents);
      
      fs.writeFile(INTERFACES_CONFIG, newContents, function(err) {
        if(err) {
          console.log(err);
          return;
        }
        exec('sudo service dhcpcd restart; sudo ifdown wlan0; sudo ifup wlan0; sudo service hostapd restart;sudo sleep 10 ; sudo service dnsmasq restart', function(err, stdout, stderr) {
          
        });
             
      });
      
    });
  });
  
});
var startsWithSpace = function(string) {
	  return string.indexOf(string.trim()) != 0;
	};