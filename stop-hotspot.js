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
	  var addedLine = false;
	  contents = contents + "";
	  
	  contents.split("\n").forEach(function(line) {
		 
		if(!HOTSPOT_DHCPCD_VAR.includes(line.trim())){
			newContents.push(line);
		}
	 });

	  newContents = newContents.join("\n")+"\n";
	  console.log("DHCPCD newContents : "+newContents);
	  
	    
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
	      contents = contents + "";
	      contents.split("\n").forEach(function(line) {
	    	  if(!HOTSPOT_INTERFACES_VAR.includes(line.trim())){
	    		  newContents.push(line);
	    	  }
		  });
	      newContents = newContents.join("\n")+"\n";
	      
	      console.log("Interface newContents : "+newContents);
	      
	      fs.writeFile(INTERFACES_CONFIG, newContents, function(err) {
	        if(err) {
	          console.log(err);
	          return;
	        }
	        // I think we need to make it sync
	        exec('sudo service dnsmasq stop; sudo service hostapd stop; sudo service dhcpcd restart; sudo ifdown wlan0; sudo ifup wlan0', function(err, stdout, stderr) {
	          
	        });
	      });
	      
	    });
	  });
	  
	});



