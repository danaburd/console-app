
function error(e,t,i){var n=new Error;return n.name=e,n.message=t,n.status=i,n}

/**
 * @param res
 * @returns - Redirect to Login with Amazon.
 * Once Amazon process Authentication is done it will be redirected to https://raspberrypi:3000/
 */


function redirectToAmazon(reqHt,res){
	res.statusCode=302;
	var oAuthServer="https://"+config.lwaRedirectHost+"/ap/oa"; 
	var t=oAuthServer+"?client_id="+config.avsClientId+"&response_type=code&redirect_uri="+getDomainUrl(reqHt),//config.avsRedirectUrl,
		i=uuid.v4(),
		n={productID:config.avsProductId,productInstanceAttributes:{deviceSerialNumber:config.dsn}},
		s={};
	s["alexa:all"]=n;
	var r="&scope="+encodeURIComponent("alexa:all")+"&state="+encodeURIComponent(i)+"&scope_data="+encodeURIComponent(JSON.stringify(s)),
		o=t+r;
	res.setHeader("Location",o),res.end()
}

/** 
 * Reading all default properties from Helper class
 */
var regHelper = require("./RegHelper.js");
avsProps=regHelper.avsProps,
//duetProps=regHelper.duetProps,
apps=regHelper.apps,
duetRegisters=regHelper.duetReg,
duetRegisterConversion=regHelper.regconversion,
duetRegisterFractionalBits=regHelper.regFractions,
duetRegisterIds=regHelper.regIds,
eqIndices=regHelper.eqind,
properties=regHelper.properties;
eqWisceText = regHelper.eqWisceText;
filterGainWisceTest = regHelper.filterGainWisceTest;	
filterGainWisceList=regHelper.filterGainWisceList;
eqWisceList=regHelper.eqWisceList;
regList=regHelper.regList;
regWisceText=regHelper.regWisceText;
regWisceList=regHelper.regWisceList;
micWisceText=regHelper.micWisceText;
micWisceList=regHelper.micWisceList;
speakerOutText=regHelper.speakerOutText;
speakerOutWisceList=regHelper.speakerOutWisceList;


var Mustache = require("mustache");
var json = require('comment-json');
var LineByLineReader = require('line-by-line');


var rpiStatus = require('rpi-status'),
serialNumber=rpiStatus.getSerialNumber();
console.log("raspberry serial number : "+serialNumber);

/**
 * @param appName
 * Adding properties to apps array, declared in Helper class.
 *  */
properties.forEach(function(appName){
	var appModule=apps[appName.app];
	appModule&&("properties"in appModule||(appModule.properties=[]),appModule.properties.push(appName))
}),

/**
 * Get App and DSP properties by Value
 */

getPropsByValue=function(){
	return propsByVar={},
	properties.forEach(function(obj){
		propsByVar[obj.variable]=obj
	}),
	propsByVar
},

/**
 * Get App and DSP properties by Name
 */
getPropsByName=function(){
	return propsByPropName={},
	properties.forEach(function(obj){
		propsByPropName[obj.property]=obj
	}),
	propsByPropName
};

/**
 * Register Getter and Setter Commands.
 */
var tinymixSetReadRegIDCommand='tinymix set "DSP3Y Misc 1005 READREGID" ',
	tinymixSetWriteRegIDCommand='tinymix set "DSP3Y Misc 1005 WRITEREGID" ',
	tinymixGetCommand="tinymix get ",
	tinymixSetCommand="tinymix set ",
	eqGetCoefCommand="./WMEqFilters.exe Coefficients ",
	eqGetSettingsCommand="./WMEqFilters.exe Settings ",
	eqGetResponseCommand="./WMEqFilters.exe Response ",
	micSource=0,
	micSourceCommand='nanomix "DSP2L Input 1"',
	activeRegister={};

/**
 * Dependencies..
 */
var https=require("https"),
	uuid=require("node-uuid"),
	PropertiesReader=require("properties-reader"),
	exec=require("child_process").exec,
	execSync=require("child_process").execSync,
	fs=require("fs"),
	request=require("request"),
	NetworkConfigurations=require("./network.js");	
	

/**
 *  
 */
var configPath=process.env["win32"==process.platform?"USERPROFILE":"HOME"]+"/console-app/console.properties";
	config={},
	duetConfig={},
	eqRegisters={},
	localIP="",
	wifiIP="";
	
	var getDomainUrl =function(req){
		return req.protocol+"://"+req.hostname+":3000/authresponse";
	};
	/**
	 * Reading console.properties files  and create config{} array
	 * Building config{} on Startup.
	 */ 
	readConfigFile=function(){
		var e=PropertiesReader(configPath);
		config={},
		properties.forEach(function(t){
			if(t.property=='dsn') {
				config[t.variable]=serialNumber;
			}
			else{
				config[t.variable]=e.getRaw(t.property)
			}
		})
	};readConfigFile();
		
	/**
	 * Convert Decimal value to Hexadecimal based on Fractions
	 */
var toRegister=function(regVal,regName){
		var i=regVal;
		if(duetRegisterConversion[regName]==1) {
			i=Math.pow(10,regVal/20);
		}
		i=Math.round(i*Math.pow(2,duetRegisterFractionalBits[regName]));
		var n=i.toString(16);
		if(n.length<8){
			for(var s="",r=0;r<8-n.length;r++)
				s+="0";
			n=s+n
		}
		return console.log('toRegister',n),n
	},
	
	/**
	 * Convert Hexadecimal value to Decimal based on Fractions
	 */
	fromRegister=function(e,t){
		var i=e/Math.pow(2,duetRegisterFractionalBits[t]);
		return 1==duetRegisterConversion[t]?(20*Math.log10(i)).toFixed(4):i
	},
	
	/**
	 * 			 band_number bandFrequency bandBandwidth Bandpass
	 * @param -- bandnumber, filterCutoff, filterBandWidth, bandpass
	 * UI:
	 * == 
	 * EQ Filter Gains (dB): filterGain1, filterGain2, filterGain3, filterGain4, filterGain5
	 * Cutoff/Center Frequency (Hz): filterCutoff1, filterCutoff2, filterCutoff3, filterCutoff4 , filterCutoff5
	 * Bandwidth (octaves):  filterBandwidthM1, filterBandwidthM2, filterBandwidthM3, filterBandwidthM4, filterBandwidthM5
	 * 
	 */
	eqSetCoefficients=function(bno,fco,fbw,bp){
		var s; s="0001"==bp&&1==bno?1:0;
		var cmd=exec(eqGetCoefCommand+bno+" "+s+" "+fco+" "+fbw);
		//console.log('eqSetCoefficients : '+eqGetCoefCommand+bno+" "+s+" "+fco+" "+fbw);
		cmd.stdout.on("data",function(e,t){
			var i=t.split(" ").join("");
			i=i.split(",");
			//,console.log("res: "+i);
			var n=i[0].trim(),s=i[1].trim(),r=i[2].trim(),o=i[3].trim();

			if(1==e)eqRegisters.band1a=n,eqRegisters.band1b=s,eqRegisters.band1c=r,eqRegisters.band1pg=o;
			else if(2==e)eqRegisters.band2a=n,eqRegisters.band2b=s,eqRegisters.band2c=r,eqRegisters.band2pg=o;
			else if(3==e)eqRegisters.band3a=n,eqRegisters.band3b=s,eqRegisters.band3c=r,eqRegisters.band3pg=o;
			else if(4==e)eqRegisters.band4a=n,eqRegisters.band4b=s,eqRegisters.band4c=r,eqRegisters.band4pg=o;
			else if(5==e){
				eqRegisters.band5a=n,eqRegisters.band5b=s,eqRegisters.band5c=r,eqRegisters.band5pg=o;
						
				/**
				 * Once We get all inputs from array then do nanomix.
				 */
				var a="";
				for(var eR in eqRegisters){
					var tR=eqRegisters[eR];
				}
				for(var eI in eqIndices){
					a=a+" "+eqRegisters[eI].substring(0,2)+" "+eqRegisters[eI].substring(2,4);
				}
				var p='nanomix "'+duetRegisters.EQ+'" '+a;
				//console.log("NANOMIX CMD : "+p), //filterCutoff1 values are writing here.
				global.blockReading=true;
				exec(p)
				global.blockReading=false;
			}
			//console.log("A coef: "+n),console.log("B coef: "+s),console.log("C coef: "+r),console.log("PG coef: "+o)
		}.bind(null,bno))
	},
	pad_with_zeroes=function(number, length) {

	    var my_string = '' + number;
	    while (my_string.length < length) {
	        my_string = '0' + my_string;
	    }

	    return my_string;

	},
	eqtoWISCETxt=function(){
		var fileContent="";
		
		//except EQ and Filtergains
		for(var eR in activeRegister){
					
			var regVal=activeRegister[eR].trim();
			var key1=eR+"_1", key0=eR+"_0",
			str1=regWisceText[key1], str0=regWisceText[key0],
			index1=regVal.slice(0, 4), index0=regVal.slice(4, 8);
			var index1Json={}, index0Json={};
			index1Json['index1']=index1;
			index1Json['desc1']=pad_with_zeroes(index1,8).match(/[\s\S]{1,4}/g).join('_');
			var reg1Output = Mustache.render(str1, index1Json);
			
			index0Json['index0']=index0;
			index0Json['desc0']=pad_with_zeroes(index0,16).match(/[\s\S]{1,4}/g).join('_');
			var reg0Output = Mustache.render(str0, index0Json);
			
			fileContent = fileContent+""+reg1Output+"\n"+reg0Output+"\n";
			
			
		}
		// process filters
		
		//console.log("eqRegisters :"+JSON.stringify(eqRegisters));
		
		var bpVal;bpVal="0000"!=eqRegisters['bandpass']?1:0;
		var eqDefaultExt=0,
		f1=pad_with_zeroes(Number(parseInt(eqRegisters.filterGain1)+12).toString(2),5),
		f2=pad_with_zeroes(Number(parseInt(eqRegisters.filterGain2)+12).toString(2),5),
		f3=pad_with_zeroes(Number(parseInt(eqRegisters.filterGain3)+12).toString(2),5),
		f4=pad_with_zeroes(Number(parseInt(eqRegisters.filterGain4)+12).toString(2),5),
		f5=pad_with_zeroes(Number(parseInt(eqRegisters.filterGain5)+12).toString(2),5),
		    
		reg1=f1+""+f2+""+f3+""+eqDefaultExt;
		//console.log("reg1 : "+reg1);
		var
		regDesc1="EQ1_B1_GAIN="+[f1.slice(0, 1), '_', f1.slice(1)].join('')
			  +", EQ1_B2_GAIN="+[f2.slice(0, 1), '_', f2.slice(1)].join('')
			  +", EQ1_B3_GAIN="+[f3.slice(0, 1), '_', f3.slice(1)].join('')
			  +", EQ1_ENA=0",				
		reg2=f4+""+f5+""+bpVal+"00000",
		regDesc2="EQ1_B4_GAIN="+[f4.slice(0, 1), '_', f4.slice(1)].join('')
			  +", EQ1_B5_GAIN="+[f5.slice(0, 1), '_', f5.slice(1)].join('')
			  +", EQ1_B1_MODE=0";
			  
		var hexReg1 = pad_with_zeroes(parseInt(reg1, 2).toString(16),4);
		var hexReg2 = pad_with_zeroes(parseInt(reg2, 2).toString(16),4);
		
			
		reg1Json={}, reg2Json={};
		
		reg1Json['reg1']=hexReg1;
		reg1Json['regDesc1']=regDesc1;
		var reg1Output = Mustache.render(filterGainWisceTest['reg1'], reg1Json);
		
		reg2Json['reg2']=hexReg2;
		reg2Json['regDesc2']=regDesc2;
		var reg2Output = Mustache.render(filterGainWisceTest['reg2'], reg2Json);
		
		fileContent = fileContent+""+reg1Output+"\n"+reg2Output+"\n";
		
		//process registers
		for(var eR in eqRegisters){
			if(eR in eqWisceText){
			
				var str = eqWisceText[eR];
				var regVal=eqRegisters[eR];
				
				var regValBin = pad_with_zeroes(parseInt('0x'+regVal, 16).toString(2),16).match(/[\s\S]{1,4}/g).join('_'); //(parseInt('0x'+regVal, 10).toString(2));
				var jsonStr={};
				jsonStr['band']=regVal;
				jsonStr['bandBin']=regValBin;
				var output = Mustache.render(str, jsonStr);
				
				fileContent = fileContent+output+"\n";
			}			
		}
		
		// process mic
		//IN2L
		var dsp2lVal="0012",isrc1dec1Val="0012", isrc1dec2Val="0013",
		dsp2Desc="IN2L", isrc1dec1Desc="IN2L", isrc1dec2Desc="IN2R";
		
		if(micSource==0){
			//IN1L
			dsp2lVal="0010",isrc1dec1Val="0010", isrc1dec2Val="0011",
			dsp2Desc="IN1L", isrc1dec1Desc="IN1L", isrc1dec2Desc="IN1R";
		}
		var dspReg={},dec1Reg={},dec2Reg={};
		dspReg.regVal=dsp2lVal,dec1Reg.regVal=isrc1dec1Val,dec2Reg.regVal=isrc1dec2Val;
		dspReg.desc=dsp2Desc,dec1Reg.desc=isrc1dec1Desc,dec2Reg.desc=isrc1dec2Desc;
		
		fileContent = fileContent+Mustache.render(micWisceText['DSP2L'], dspReg)+"\n"
		+Mustache.render(micWisceText['ISRC1DEC1'], dec1Reg)+"\n"+Mustache.render(micWisceText['ISRC1DEC2'], dec2Reg)+"\n";
				
		
		//SpeakerOut
		var spkRegVal=	((parseInt(duetConfig['speakerOut'])+64)*2),
		hexSpeakerOut = pad_with_zeroes(parseInt(spkRegVal, 10).toString(16),4),
		spkReg={};
		spkReg.regVal=hexSpeakerOut;
		spkReg.desc=duetConfig['speakerOut'];
		fileContent = fileContent+Mustache.render(speakerOutText['spkOut'], spkReg)+"\n"

		/*fs.writeFile(process.env["win32"==process.platform?"USERPROFILE":"HOME"]+"/SampleWisce.txt",fileContent,function(e){
			return e?console.log(e):void console.log("SampleWisce.txt file saved successfully!")
		})*/
		return fileContent;
	}	
	
	eqWISCtoReg=function(req, res){
		 var filePath = path.join(__dirname, '/uploads');
	     var lr = new LineByLineReader(filePath+'/duet_wisce.txt');
		 var cofArr=["00","00"];
		 var tempArr={}, isSpeakerAdded=false;
				 
		 lr.on('error', function (err) {
		 	console.log("error in reading file");
		 });

		 lr.on('line', function (line) {
			var i=line.split(" ");
			if(i.length>1){
		 	var regIndex=i[0].trim();
		 	var regVal=i[1].trim();
		 	
			 	if(regIndex in regWisceList){
			 		
			 		var regSubName = regWisceList[regIndex]; 
			 		tempArr[regSubName]=regVal;
			 		
			 	}else if(filterGainWisceList.includes(regIndex)){
			 	
			 		var hextobin=pad_with_zeroes(parseInt(regVal, 16).toString(2),16);
		 			
		 			var parts = hextobin.match(/[\s\S]{1,5}/g) || [];
		 		
			 		if(regIndex=="0xE10"){
			 			var fg1=parseInt(parts[0], 2).toString(10),
			 				fg2=parseInt(parts[1], 2).toString(10),
			 				fg3=parseInt(parts[2], 2).toString(10),
			 				eqDefaultExt=parseInt(parts[3], 2).toString(10);
			 				
			 			//console.log('fg1 : '+fg1+'---fg2 : '+fg2+'---fg3 : '+fg3);
			 			eqRegisters.filterGain1=parseInt(fg1)-12,
			 			eqRegisters.filterGain2=parseInt(fg2)-12,
			 			eqRegisters.filterGain3=parseInt(fg3)-12;
			 				 					 			
			 		}
			 		else if(regIndex=="0xE11"){
			 			var fg4=parseInt(parts[0], 2).toString(10),
		 				fg5=parseInt(parts[1], 2).toString(10),
		 				bp=parseInt(parts[2], 2).toString(10).slice(0, 1); //banpass
		 			//console.log('fg4 : '+fg4+'---fg5 : '+fg5+'---bp : '+bp);
		 			eqRegisters.filterGain4=parseInt(fg4)-12,
		 			eqRegisters.filterGain5=parseInt(fg5)-12,
		 			eqRegisters.bandpass=bp;
		 			}
			 	}
			 	else if(eqWisceList.includes(regIndex)){
			 		regVal = regVal.replace(/0x/gi,'');
			 		cofArr.push(regVal.substring(0,2)),
			 		cofArr.push(regVal.substring(2,4));
			 	}
			 	else if(micWisceList.includes(regIndex) && regIndex=="0x980"){
			 		/**
			 		 * Setting mic
			 		 * Write only for 0x980 and not required for otheres.
			 		 */
			 		
			 		var micSouceQuery='';
			 		if(regVal=="0x0010" || regVal=="0X0010" ){
			 			//IN1L - internal mic
			 			micSouceQuery='nanomix "DSP2L Input 1" IN1L; nanomix "ISRC1DEC1 Input" IN1L; nanomix "ISRC1DEC2 Input" IN1R';
			 			micSource=0;
			 		}else{
			 			//IN2L - external mic
			 			micSouceQuery='nanomix "DSP2L Input 1" IN2L; nanomix "ISRC1DEC1 Input" IN2L; nanomix "ISRC1DEC2 Input" IN2R';
			 			micSource=1;
			 		}
			 		exec(micSouceQuery);		 			
			 	}
				else if(speakerOutWisceList.includes(regIndex) && !isSpeakerAdded){

					isSpeakerAdded=true;
					//console.log("reg Index------------------- : "+regIndex);
					//console.log("reg Value------------------- : "+regVal);
					//var newHexa= ((regVal/2)-0x40);
					//conv2dec( (Register value in hex/2) - 0x40)
					var spkDisply= (((parseInt(regVal, 16).toString(10))/2)-64);
					//console.log("spkDisply -------------------: "+spkDisply);

					var n=0;
					n=parseInt(spkDisply)+32;
					var regQuery=tinymixSetCommand+'"'+duetRegisters.speakerOut+'" '+n+" ;"+
						tinymixSetCommand+'"'+duetRegisters.speakerOut2+'" '+n+" ;"+
						tinymixSetCommand+'"SPKOUT Input 1 Volume" '+n+" ;"+
						tinymixSetCommand+'"SPKOUT Input 2 Volume" '+n+" ;"
		
					//console.log('regQuery',regQuery);
					var cmd=exec(regQuery);
						global.blockReading=true;
						cmd.stdout.on("data",function(e){
							//console.log("Output data "+e)
							}),
						cmd.on("exit",function(code){
							//console.log("Finsihed writing to register"),
							global.blockReading=false;
						}),
		
					duetConfig["speakerOut"]=spkDisply
				}
		 	}
		 	
		 });
		 
		 lr.on('end', function () {
			
			var finalRegData={};
			
			for(var rL in regList){
				var registerName = regList[rL],
				key1=registerName+"_1", key0=registerName+"_0",
				regVal1=tempArr[key1],
				regVal0=tempArr[key0];
				
								
				var r=""+regVal1.replace(/0x/gi,'')+""+regVal0.replace(/0x/gi,'');
				
				for(var o="",a=0,p=r.length;a<p;a+=2)o+="0x"+r.substring(a,a+2)+" ";
				global.blockReading=true;
				var cmdResults=execSync(tinymixSetCommand+'"'+duetRegisters[registerName]+'" '+o+" ;"+
						 tinymixSetWriteRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds[registerName]+"; y=`"+
						 tinymixGetCommand+'"DSP3Y Misc 1005 WRITEREGID"`; echo "$y"').toString();
				
				global.blockReading=false;
				
			}
			var p='nanomix "'+duetRegisters.EQ+'" '+cofArr.join(" ");
			//console.log("NANOMIX CMD from File : "+p), //filterCutoff1 values are writing here.
			global.blockReading=true;
			exec(p);
			eqSetAllFileters();
			getBoardProps();
			global.blockReading=false;
		 });
		 
		//while infinite loop here 
		 setTimeout(function(){
			var newRegData = {};
			newRegData.duetConfig=duetConfig;
			newRegData.eqRegisters=eqRegisters;
			newRegData.micSource=micSource;
			//console.log("duetConfig: "+JSON.stringify(duetConfig));
			//console.log("eqRegisters: "+JSON.stringify(eqRegisters));
			
			res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify(newRegData));
		}, 10000);
		 
			
	}
	/**
	 * Setup all Coefficients.
	 */
	eqSetAllCoefficients=function(){
		eqSetCoefficients(1,eqRegisters.filterCutoff1,eqRegisters.filterBandwidthM1,eqRegisters.bandpass),
		eqSetCoefficients(2,eqRegisters.filterCutoff2,eqRegisters.filterBandwidthM2,eqRegisters.bandpass),
		eqSetCoefficients(3,eqRegisters.filterCutoff3,eqRegisters.filterBandwidthM3,eqRegisters.bandpass),
		eqSetCoefficients(4,eqRegisters.filterCutoff4,eqRegisters.filterBandwidthM4,eqRegisters.bandpass),
		eqSetCoefficients(5,eqRegisters.filterCutoff5,eqRegisters.filterBandwidthM5,eqRegisters.bandpass)
	},
	
	/**
	 * Setup all Filters.
	 */
	eqSetAllFileters=function(){
		var fg1=parseInt(eqRegisters.filterGain1)+12,
			fg2=parseInt(eqRegisters.filterGain2)+12,
			fg3=parseInt(eqRegisters.filterGain3)+12,
			fg4=parseInt(eqRegisters.filterGain4)+12,
			fg5=parseInt(eqRegisters.filterGain5)+12;
		
		var	excCmd=tinymixSetCommand+'"'+duetRegisters.filterGain1+'" '+fg1;console.log('set '+excCmd),exec(excCmd);
			excCmd=tinymixSetCommand+'"'+duetRegisters.filterGain2+'" '+fg2;console.log('set: '+excCmd),exec(excCmd);
			excCmd=tinymixSetCommand+'"'+duetRegisters.filterGain3+'" '+fg3;console.log('set: '+excCmd),exec(excCmd);
			excCmd=tinymixSetCommand+'"'+duetRegisters.filterGain4+'" '+fg4;console.log('set: '+excCmd),exec(excCmd);
			excCmd=tinymixSetCommand+'"'+duetRegisters.filterGain5+'" '+fg5;console.log('set: '+excCmd),exec(excCmd);
	},
	
	/**
	 * bno band number
	 * bp band pass
	 * # represt number
	 * bNa  band#a
	 * bNb band#b
	 * bNc band#c
	 * bNpg band#pg
	 * Read EQ settings of bandwidth and frequency
	 */
	eqGetSettings=function(bno,bp,bNa,bNb,bNc,bNpg){
		var bpVal;bpVal="0000"!=bp?1:0;
		var cmd=exec(eqGetSettingsCommand+bno+" "+bpVal+" "+bNa+" "+bNb+" "+bNc+" "+bNpg);
		//console.log("eqGetSettings : "+eqGetSettingsCommand+bno+" "+bpVal+" "+bNa+" "+bNb+" "+bNc+" "+bNpg);
		cmd.stdout.on("data",function(e,data){
			var i=data.split(" ").join("");
			i=i.split(",");
			var frequency=parseFloat(parseFloat(i[0].trim()).toFixed(2)), bandwidth=parseFloat(parseFloat(i[1].trim()).toFixed(2));
			
			var fc="filterCutoff"+e; fbm="filterBandwidthM"+e;
			eqRegisters[fc]=parseFloat(parseFloat(frequency).toFixed(0)), //frequency,
			eqRegisters[fbm]=parseFloat(parseFloat(bandwidth).toFixed(1)) //bandwidth
		//console.log("band: "+e+" bandwidth: "+parseFloat(parseFloat(bandwidth).toFixed(2))+"frequency: "+parseFloat(parseFloat(frequency).toFixed(2)));
		}.bind(null,bno))
	},
	
	/**
	 * Get Response to plot graph
	 */
	eqGetResponse=function(e){ 
	
	    //console.log("eqRegisters : "+JSON.stringify(eqRegisters));
		var t="0000"==eqRegisters.bandpass?0:1,
		qry=eqGetResponseCommand+t+" "+
		eqRegisters.band1a+" "+eqRegisters.band1b+" "+eqRegisters.band1c+" "+eqRegisters.band1pg+" "+eqRegisters.filterGain1+" "+
		eqRegisters.band2a+" "+eqRegisters.band2b+" "+eqRegisters.band2c+" "+eqRegisters.band2pg+" "+eqRegisters.filterGain2+" "+
		eqRegisters.band3a+" "+eqRegisters.band3b+" "+eqRegisters.band3c+" "+eqRegisters.band3pg+" "+eqRegisters.filterGain3+" "+
		eqRegisters.band4a+" "+eqRegisters.band4b+" "+eqRegisters.band4c+" "+eqRegisters.band4pg+" "+eqRegisters.filterGain4+" "+
		eqRegisters.band5a+" "+eqRegisters.band5b+" "+0+" "+eqRegisters.band5pg+" "+eqRegisters.filterGain5;
		//console.log("Get Response : "+qry);
		
		var cmd=exec(qry);
		cmd.stdout.on("data",function(e,t){
			for(var i=[],n=t.split("\n"),s=0;s<n.length;s++){
				var r=n[s].split(",");
				"undefined"!=typeof r[0]&&"undefined"!=typeof r[1]&&i.push(parseFloat(r[1].trim()))
			}
			e.emit("new-graph-data-eq",i)
		}.bind(null,e)),
		cmd.stderr.on("data",function(e,t){
			var i=t.split("\n");
			for(k in i){
				var n=k.split(",");
				//console.log("res: "+n),
				gContents={x:parseInt(n[0].trim()),y:parseInt(n[1].trim())},
				e.emit("new-graph-data-eq",gContents)
			}
		}.bind(null,e))
	},
	/**
	 * read all EQ Settings
	 */
	getAllEQSettings=function(coeffData){
		for(var t in eqIndices){
			eqRegisters[t]=coeffData.slice(eqIndices[t],eqIndices[t]+4);
		}
		eqGetSettings(1,eqRegisters.bandpass,eqRegisters.band1a,eqRegisters.band1b,eqRegisters.band1c,eqRegisters.band1pg),
		eqGetSettings(2,!1,eqRegisters.band2a,eqRegisters.band2b,eqRegisters.band2c,eqRegisters.band2pg),
		eqGetSettings(3,!1,eqRegisters.band3a,eqRegisters.band3b,eqRegisters.band3c,eqRegisters.band3pg),
		eqGetSettings(4,!1,eqRegisters.band4a,eqRegisters.band4b,eqRegisters.band4c,eqRegisters.band4pg),
		eqGetSettings(5,!1,eqRegisters.band5a,eqRegisters.band5b,0,eqRegisters.band5pg)
		
	},

	/**
	 * ON Load Read all existing properties 
	 * 1) EQ's
	 * 2) Filter Gains
	 * 3) DSP3Y Misc 1005
	 */
	getBoardProps=function(){
		
		for(var e in duetRegisters){
			var cmd=exec(tinymixGetCommand+'"'+duetRegisters[e]+'"');
			
			cmd.stdout.on("data",function(e,t){
				var op=t.replace(/\s/g,"");
				op=op.replace(/,/g,"");
				if("EQ"==e){
					getAllEQSettings(op);
				}else if(e.includes("filterGain")){
					var n=t.split(" ");
					eqRegisters[e]=parseInt(n[0])-12
				}else if("speakerOut"==e){
					var s=parseInt(op),op=fromRegister(s,e);
					duetConfig[e]=parseFloat(parseFloat(op).toFixed(2))-32

				}else{
					if(regList.includes(e)){
						activeRegister[e]=op;
					}
					//console.log(e);
					var s=parseInt(op,16),op=fromRegister(s,e);
					duetConfig[e]=parseFloat(parseFloat(op).toFixed(2))					
				}
			}.bind(null,e))
		}
		
		/**
		 * Getting Mic souce props
		 * Here mic souce is global value, we are updating it.
		 */
		var cmd=exec(micSourceCommand);
		cmd.stdout.on("data",function(e,t){
			var i=t.replace(/\s/g,"");
			e=i.includes("1")?0:1;
		}.bind(null,micSource)) 
	};getBoardProps();
	
	/**
	 * Grab IP Address
	 */
	getLocalIP=function(){
		var e=require("os"),
		t=e.networkInterfaces(),
		i=[];
		try{
			i[0]=t.eth0[0].address
		}catch(n){
			i[0]=""
		}try{
			i[1]=t.wlan0[0].address
		}catch(n){
			i[1]=""
		}return i
	};

var adr=getLocalIP();
	localIP=adr[0],
	wifiIP=adr[1];
	module.exports=duetConfig,
	module.exports=eqRegisters,
	module.exports=micSource,
	module.exports=localIP,
	module.exports=wifiIP;

readLogs=function(appName,maxLogLines,cb){
	return(app=apps[appName])
		?void(maxLogLines>0?exec("tail -"+maxLogLines+" "+config[app.log],function(err,stdout,stderr){
				return err instanceof Error?
						void cb(error("Not Found",config[app.log]+" file not found",404))
						:void cb(null,stdout)
				})
				:fs.readFile(config[app.log],"utf8",function(err,stdout){
					err?cb(error("Not Found",config[app.log]+" file not found",404))
					 :cb(null,stdout)
					}))
		:cb(error("Not Found","Could not find app: "+appName))
},
clearLog=function(cb){
	return(app=apps['avs'])
			?void fs.writeFile(config[app.log],"",function(err,data){
							err
							?cb(error("Not Found",config[app.log]+" file not found",404))
							:cb(null,data)
							})
			:cb(error("Not Found","Could not find Property in AVS configuration"))
},
getAvsStatus=function(cb){
		var i=apps['avs']; 
		return i?void exec(config[i.status],function(err,stdout,stderr){
			return err instanceof Error?void cb(null,{app_status:"inactive"})
								:void(stdout.indexOf("Active: active")>=0||
									 stdout.indexOf("service is running")>=0?
											cb(null,{app_status:"active"}):
											cb(null,{app_status:"inactive"})
									)})
				:cb(error("Not Found","Could not find AVS Service "))
},
startAVS=function(cb){
	var i=apps['avs'];	
	return i?void exec(config[i.start],function(err,stdout,stderr){
		return err&&err.length>1?(
						console.log("failed to start "+i.name+" service."),
						void cb(error("InternalError","Failure to start "+i.name+" service",500))
						):
						(console.log("Log : "+i.name+" service started."),
     					   void cb(null,{app_status:"started"})
						)})
				:cb(error("Not Found","Could not find AVS Service"))
},
stopAVS=function(cb){
	var i=apps['avs'];
	return i?void exec(config[i.stop],function(err,stdout,stderr){
		return err instanceof Error?(
								console.log("failed to stop "+i.name+" service."),
								void cb(error("InternalError","Failure to stop "+i.name+" service",500))
							   ):
							   (console.log("Log : "+i.name+" service stopped."),
								void cb(null,{app_status:"stopped"})
							   )}):cb(error("Not Found","Could not find AVS Service"))
},

triggerApp=function(cb){
	triggerIO['avs'].emit("trigger",""),
	cb(null,"")
},

/**
 * Reg amazon call back function
 */
registerWithAmazon=function(req,res,callbackfun){	
	redirectToAmazon(req, res)},

/**
 * LWA authresponse method
 */
authresponse=function(reqHt, code,state,cb){
	var n=[],s=!1;
	if(code||n.push("code"),state||n.push("state"),n.length>0)
		// if not find code and state return error object, error code 400
		return void cb(error("MissingParams","The following parameters were missing or empty strings: "+n.join(", "),400));
	
	var options={
			host:config.lwaApiHost,
			path:"/auth/o2/token",
			method:"POST",
			port:443,
			headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
			rejectUnauthorized:true
		},
	query="grant_type=authorization_code&code="+code+
	  "&redirect_uri="+getDomainUrl(reqHt)+//config.avsRedirectUrl+
	  "&client_id="+config.avsClientId+
	  "&client_secret="+config.avsClientSecret,

	httpsRequest=https.request(options,function(e){
		var buf=null;
		e.on("end",function(){
			if(200===e.statusCode&&null!==buf){
				
				var content;				
				var awsRespnse=JSON.parse(buf);
				// First I want have read the file  and get refresh token from json
				var fCont = fs.readFileSync(process.env["win32"==process.platform?"USERPROFILE":"HOME"]+"/sdk-folder/sdk-build/Integration/AlexaClientSDKConfig.json");
				content = json.parse(fCont), 
				content.authDelegate.clientSecret=config.avsClientSecret,
				content.authDelegate.deviceSerialNumber=config.dsn,
				content.authDelegate.refreshToken=awsRespnse.refresh_token,
				content.authDelegate.clientId=config.avsClientId,
				content.authDelegate.productId=config.avsProductId,
				fs.writeFileSync(process.env["win32"==process.platform?"USERPROFILE":"HOME"]+"/sdk-folder/sdk-build/Integration/AlexaClientSDKConfig.json", json.stringify(content, null, 2)),

				!s&&cb(null,"device tokens ready"),
				s=!0 // making s=ture
			}
			else{
				!s&&cb(error("TokenRetrievalFailure","Unexpected failure while retrieving tokens.",e.statusCode)),
				s=!0
			    }
		}),
		e.on("data",function(n){
			200===e.statusCode?buf=null===buf?n:Buffer.concat([buf,n]):
			(!s&&cb(error("TokenRetrievalFailure","Unexpected failure while retrieving tokens.",e.statusCode)),s=!0)
		})
	});

	httpsRequest.on("error",function(e){console.error("Failed to post request: "+e.message)}),
	httpsRequest.write(query),
	httpsRequest.end()
},

updateConfigValues=function(formFields){
	var t=getPropsByValue();
	for(key in formFields)key in t&&(config[key]=formFields[key]);
	
	
	updateConfigFile()
},

getConfig=function(){return config},

updateConfigFile=function(){
	var e,t=getPropsByName(),i="";
	fs.readFileSync(configPath).toString().split("\n").forEach(function(n){
		n.indexOf("=")>-1&&n.split("=")[0]in t?(e=n.split("=")[0],i+=e+"="+config[t[e].variable]+"\n"):i+=n+"\n"
	}),
	fs.writeFileSync(configPath,i)
};

var LOG_LINES=100,watchingLog={},

watchlogs=function(appName){
	fs.watch(config[apps[appName].log],{encoding:"UTF8"},function(t,logFileData){
		readLogs(appName,LOG_LINES,function(t,logFileData){
			logsocketIO[appName].emit("log-update",logFileData)
		})
	})
},

clientLogUpdate=function(appName,browserData){
	readLogs(appName,LOG_LINES,function(err,logFileData){
		return err?console.log(err):void browserData.emit("log-update",logFileData)
	})
};


onLogSubscribe=function(app,browserData){
	fs.existsSync(config[apps[app].log])&&
	(1!=watchingLog[app]&&(watchingLog[app]=!0,watchlogs(app)),clientLogUpdate(app,browserData))
}

getWifiSettings=function(e){
	var scanList = NetworkConfigurations.scanSource();
		e(scanList);
};

var express=require("express"),
	path=require("path"),
	bodyParser=require("body-parser"),
	session=require("express-session"),
	flash=require("connect-flash"),
	//minify = require('express-minify'),
	async=require("async"),
	formidable = require('formidable')
	;
	
	var app=express();
	io=void 0,
	//app.use(minify());
	app.use(session({secret:"kitkat", resave: true, saveUninitialized: true})),
	app.use(flash()),
	app.use(bodyParser.json()),
	app.use("/css",express["static"](__dirname+"/public/css")),
	app.use("/js",express["static"](__dirname+"/public/js")),
	app.use("/fonts",express["static"](__dirname+"/public/fonts")),
	app.use("/images",express["static"](__dirname+"/public/images")),
	app.use(bodyParser.json()),
	app.use(bodyParser.urlencoded({extended:!1})),
	app.use(function(e,t,i){t.locals.message=e.flash(),i()}),
	app.set("view engine","ejs"),
	app.engine('html', require('ejs').renderFile);

	
/**
 * Controllers for Web
 */
app.get("/",function(req,res){
	res.render("avs-config-new.html",
	{
		page:"avs-config",
		avsClientId:config.avsClientId,
		avsClientSecret:config.avsClientSecret,
		avsProductId:config.avsProductId,
		localIP:localIP
	})
}),
app.post("/uploadFile", function(req,res){
	var form = new formidable.IncomingForm();
	form.multiples = false;
	form.uploadDir = path.join(__dirname, '/uploads');
	var targetFileName = "duet_wisce.txt";
	form.on('file', function(field, file) {
		//console.log("file : "+JSON.stringify(file));
		fs.chmodSync(form.uploadDir+"/"+targetFileName, '777');
		fs.rename(file.path, path.join(form.uploadDir, targetFileName), function(err){
			console.log("File upload completed.");
			eqWISCtoReg(req,res);
			
		});
	});

	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
	});

	form.on('end', function() {
	
	});
	form.parse(req);
	
	
	
}),

app.get("/downloadFile", function(req,res){
	var buf = Buffer.from(eqtoWISCETxt());
	var date = new Date();
    var day = date.getDate();
    var monthIndex = date.getMonth() + 1;
    var year = date.getFullYear();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var configFileName = "duet_" + year + "-" + monthIndex + "-" + day + "_" + h + "-" + m + "-" + s + ".txt";
    
    
	res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-disposition': 'attachment; filename=\"'+configFileName+'\"'
    });
	
    res.write(buf);
    res.end();
    
}),
//this is added for new req.

app.get("/avs-config",function(req,res){
	res.render("avs-config-new.html",
	{
		page:"avs-config",
		avsClientId:config.avsClientId,
		avsClientSecret:config.avsClientSecret,
		avsProductId:config.avsProductId,
		localIP:localIP
	})
}),

app.post("/avs-config",function(req,res){
	updateConfigValues(req.body),
	req.flash("success","Properties updated successfully"),
	res.redirect("/avs-config")
}),

app.get("/avs-login",function(req,res,next){
	res.render("avs-login.html",{page:"avsLogin",localIP:localIP})
}),
app.post("/avs-login",function(req,res,next){
	registerWithAmazon(req,res,function(e){
		res.status(e.status),
		res.send({error:e.name,message:e.message}),
		next(e)
	})
}),
app.get("/network-properties",function(e,t){
	
	return"raspberrypi"!=config.environmentProfile?t.send("Only Available on Raspberry Pi"):void getWifiSettings(function(scanList){
		//console.log("Scanned networkds : "+JSON.stringify(scanList));
		var hotconfig = require('./hotspotconfig.js');
		var hotspot = hotconfig.isHotspotOn();
		var htpStatus ;	
		var currentWifi='off/any'
		if(hotspot == "Master"){
			htpStatus = 1 ;
		}else{
			htpStatus = 2 ;
			currentWifi = hotconfig.getConnectedWifi();
		}
		console.log("Wifi name : "+currentWifi);
		t.render("network-config.html",
		{
			page:"networkSettings",
			wifiSettings:scanList,
			localIP:localIP,
			hotspt:htpStatus,
			currentWifi:currentWifi
		})
	})
}),

app.get("/dsp-properties",function(req,res){
	//console.log("micsouce: "+micSource);
	res.render("duet-config.html",
	{
		page:"dspSettings",
		duetConfig:duetConfig,
		eqRegisters:eqRegisters,
		micSource:micSource,
		localIP:localIP,
		config:config,
		path:"/dsp-properties"
	})
}),
app.get("/avs-properties",function(req,res){
	res.render("avs-config.html",
	{
		page:"avsSettings",
		avsClientId:config.avsClientId,
		avsClientSecret:config.avsClientSecret,
		avsProductId:config.avsProductId,
		localIP:localIP
	})
}),
app.post("/avs-properties",function(req,res){
	updateConfigValues(req.body),
	req.flash("success","Properties updated successfully"),
	res.redirect("/avs-properties")
}),
app.get("/clearLog",function(req,res,next){
	clearLog(function(errObj,num){
		errObj?
			(res.status(errObj.status),res.send({error:errObj.name,message:errObj.message})):
				res.send(num)
	})
}),
app.get("/getAppStatus",function(req,res){
	getAvsStatus(function(errObj,num){
		errObj?
			(res.status(errObj.status),res.send({error:errObj.name,message:errObj.message})):
				res.json(num)
	})
}),
app.get("/startApp",function(req,res){
	startAVS(function(errObj,num){
		errObj?
			(res.status(errObj.status),res.send({error:errObj.name,message:errObj.message})):
				res.send(num)
	})
}),
app.get("/stopApp",function(req,res){
	stopAVS(function(errObj,num){
		errObj?
			(res.status(errObj.status),res.send({error:errObj.name,message:errObj.message})):
				res.send(num)
	})
}),
app.post("/triggerApp",function(req,res){
	triggerApp(function(errObj,num){
		errObj?
			(res.setatus(errObj.status),res.send({error:errObj.name,message:errObj.message})):
				res.send(num)
	})
}),


app.get("/authresponse",function(req,res){
	authresponse(req, req.query.code,req.query.state,function(errObj,num){
		errObj?req.flash("error",errObj.name+" : "+errObj.message):(req.flash("success","Login Successful"),
		exec("sudo service avs-cpp restart")),
		res.redirect("/avs-config")
		
	})
}),

app.post("/network/save",function(e,t){
	var i={ssid:e.body.ssid,psk:e.body.password};
	
	NetworkConfigurations.addNew(e.body.ssid,e.body.password  ,function(){
		setTimeout(function(){				
				t.redirect("/network-properties");
			}, 10000);
	});

	}),


app.post("/network/connect",function(e,t){
	NetworkConfigurations.connect(e.body.ssid ,function(isHotOn){
		console.log("isHotOn : "+isHotOn);
		if(isHotOn){
			t.redirect("/network-properties");
			exec("sudo reboot");
		}
		else{
			setTimeout(function(){				
					t.redirect("/network-properties");
				}, 10000);
		}
	});
}),

app.post("/network/save/connect",function(e,t){
	var i={ssid:e.body.ssid,psk:e.body.password};
	NetworkConfigurations.saveAndConnect(e.body.ssid,e.body.password  ,function(isHotOn){
		//console.log("Save and Connect isHotOn : "+isHotOn);
		if(isHotOn){
			t.redirect("/network-properties");
			exec("sudo reboot");
		}
		else{
			setTimeout(function(){		
				t.redirect("/network-properties");
			}, 10000);
		}
		
	});
}),

app.post("/network/forget",function(e,t){
	forgetNetwork(e.body.ssid,function(){
		setTimeout(function(){				
				t.redirect("/network-properties");
			}, 10000);
	})
}),

app.get("/hotspotSetup",function(req,res){

	var hotconfig = require('./hotspotconfig.js');	
	//console.log("hotspotVal : "+req.query.hotspotVal);	
	var repString = "" ;
	if(req.query.hotspotVal == 1){
		repString = hotconfig.startHotSpotIfNeeded();		
		//res.redirect("/network-properties") ;
	}else{
		repString = hotconfig.stopHotSpotIfNeeded();		
	}

	res.send(repString);
	
	
}),

app.get("/refreshScan",function(req,res){

	var scanList = NetworkConfigurations.scanSource();
	res.send(JSON.stringify(scanList));
	
}),


app.get("/setMicSource",function(req,res,next){
	var micSouceQuery="";
		micSouceQuery="0"==req.query.val?'nanomix "DSP2L Input 1" IN1L; nanomix "ISRC1DEC1 Input" IN1L; nanomix "ISRC1DEC2 Input" IN1R'
					                    :'nanomix "DSP2L Input 1" IN2L; nanomix "ISRC1DEC1 Input" IN2L; nanomix "ISRC1DEC2 Input" IN2R',
	//console.log(micSouceQuery),
	exec(micSouceQuery),
	micSource=parseInt(req.query.val),
	res.send("Success")
}),

app.get("/setRegister",function(req,res){
	global.blockReading=true;
	var regQuer='', linerVal=0, regName=req.query.register, regVal=req.query.val;

	if("speakerOut"==req.query.register)
	{	
		var n=0;
		n=parseInt(req.query.val)+32;
		regQuery=tinymixSetCommand+'"'+duetRegisters.speakerOut+'" '+n+" ;"+
			tinymixSetCommand+'"'+duetRegisters.speakerOut2+'" '+n+" ;"+
			tinymixSetCommand+'"SPKOUT Input 1 Volume" '+n+" ;"+
			tinymixSetCommand+'"SPKOUT Input 2 Volume" '+n+" ;"
		
		//console.log('regQuery',regQuery);

	}else
	{
		for(var r=toRegister(regVal,regName),o="",a=0,p=r.length;a<p;a+=2)o+="0x"+r.substring(a,a+2)+" ";
		regQuery=tinymixSetCommand+'"'+duetRegisters[regName]+'" '+o+" ;"+
			 tinymixSetWriteRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds[regName]+"; y=`"+
			 tinymixGetCommand+'"DSP3Y Misc 1005 WRITEREGID"`; echo "$y"',
		activeRegister[regName]=r
	}

	//console.log('regQuery',regQuery);
	var cmd=exec(regQuery);
		cmd.stdout.on("data",function(e){console.log("Output data "+e)}),
		cmd.on("exit",function(code){
			console.log("Finsihed writing to register"),
			global.blockReading=false
		}),
		
	duetConfig[regName]=regVal,
	//console.log("activeRegister : "+JSON.stringify(activeRegister)),
	res.send("Success")
}),
app.get("/setMicSource",function(req,res,next){
	var micSouceQuery="";
		micSouceQuery="0"==req.query.val?'nanomix "DSP2L Input 1" IN1L; nanomix "ISRC1DEC1 Input" IN1L; nanomix "ISRC1DEC2 Input" IN1R'
					                    :'nanomix "DSP2L Input 1" IN2L; nanomix "ISRC1DEC1 Input" IN2L; nanomix "ISRC1DEC2 Input" IN2R',
	//console.log(micSouceQuery),
	exec(micSouceQuery),
	micSource=parseInt(req.query.val),
	res.send("Success")
}),

app.get("/setEQ",function(req,res,next){
	eqRegisters.filterCutoff1=req.query.filterCutoff1,
	eqRegisters.filterCutoff2=req.query.filterCutoff2,
	eqRegisters.filterCutoff3=req.query.filterCutoff3,
	eqRegisters.filterCutoff4=req.query.filterCutoff4,
	eqRegisters.filterCutoff5=req.query.filterCutoff5,
	eqRegisters.filterBandwidthM1=req.query.filterBandwidthM1,
	eqRegisters.filterBandwidthM2=req.query.filterBandwidthM2,
	eqRegisters.filterBandwidthM3=req.query.filterBandwidthM3,
	eqRegisters.filterBandwidthM4=req.query.filterBandwidthM4,
	eqRegisters.filterBandwidthM5=req.query.filterBandwidthM5,
	eqRegisters.filterGain1=req.query.filterGain1,
	eqRegisters.filterGain2=req.query.filterGain2,
	eqRegisters.filterGain3=req.query.filterGain3,
	eqRegisters.filterGain4=req.query.filterGain4,
	eqRegisters.filterGain5=req.query.filterGain5,
	eqRegisters.bandpass=req.query.bandpass,
	eqSetAllCoefficients(),
	eqSetAllFileters(),
	res.send("Success")
}),

app.get("/getIP",function(req,res,next){
	var n=getLocalIP();
	res.send({localIP:n[0],wifiIP:n[1]})
}),

app.use(function(err,req,res,next){
	console.log("error: ",err),res.status(err.status||500),res.send("error: "+err.message)
}),

global.framcnt=0,global.startframecnt=0,global.blockReading=!1;

var gainDelay,outGainDelay, clipDelay,audioModeDelay,erleDelay,dtdDelay;

var graphGainData=function(e){ 
	if(global.blockReading)
		console.log("Waiting for read to finish...");
	else{
		var qry=tinymixSetReadRegIDCommand+"0x00 0x00 0x00 0x"+duetRegisterIds.stats+"; x=`"+
		tinymixGetCommand+'"'+duetRegisters.Mic1InAbsMax+'"`; y=`'+
		tinymixGetCommand+'"'+duetRegisters.Mic2InAbsMax+'"`; z=`'+
		tinymixGetCommand+'"'+duetRegisters.LineOutAbsMax+'"`; '+tinymixSetReadRegIDCommand+'0x00 0x00 0x00 0x00; k=`'+
		tinymixGetCommand+'"'+duetRegisters.MicInPga+'"`; '+tinymixSetReadRegIDCommand+'0x00 0x00 0x00 0x17; t=`'+
		tinymixGetCommand+'"'+duetRegisters.FrameCntr+'"`; echo "$x, $y, $z, $k, $t"',
		
		cmd=exec(qry);
		//console.log('graphGainData:'+qry);
		cmd.stdout.on("data",function(e,t){
			var i=t.split(" ").join("");
			i=i.split(",");
			var n=parseInt(i[0]+i[1]+i[2]+i[3],16),
			s=parseInt(i[4]+i[5]+i[6]+i[7],16),
			r=parseInt(i[8]+i[9]+i[10]+i[11],16),
			o=parseInt(i[12]+i[13]+i[14]+i[15],16),
			a=parseInt(i[16]+i[17]+i[18]+i[19],16);
			
			0==global.framcnt&&(global.framcnt=1,global.startframecnt=a);
	
			var d=fromRegister(n,"Mic1InAbsMax"),
				u=fromRegister(s,"Mic2InAbsMax"),
				g=fromRegister(r,"LineOutAbsMax"),
				f=fromRegister(o,"MicInPga"),
				S=(a-global.startframecnt)/250,
				A=20*Math.log10(d)+20*Math.log10(f),
				R=20*Math.log10(u)+20*Math.log10(f),
				C=20*Math.log10(g);
				C==Number.NEGATIVE_INFINITY&&(C=-100),
				C<(-100)&&(C=-100),
	
				A>0&&(A=0),R>0&&(R=0),C>0&&(C=0),
				isNaN(S)||isNaN(A)||isNaN(R)||isNaN(C)||			
				(gContents={x:S,y1:A,y2:R,y3:C},
				e.emit("new-graph-data-gain",gContents))
		}.bind(null,e))
	}
},

graphOutGainData=function(e){ 
	if(global.blockReading)
		console.log("Waiting for read to finish...");
	else{
		
		var qry=tinymixSetReadRegIDCommand+'0x00 0x00 0x00 0x'+duetRegisterIds.stats+'; t=`'+
		tinymixGetCommand+'"'+duetRegisters.FrameCntr+'"`; '+tinymixSetReadRegIDCommand+'0x00 0x00 0x00 0x00; j=`'+
		tinymixGetCommand+'"'+duetRegisters.LineInPga+'"`; '+tinymixSetReadRegIDCommand+'0x00 0x00 0x00 0x17; l=`'+
		tinymixGetCommand+'"'+duetRegisters.LineInAbsMax+'"`; echo "$t, $j, $l, $o"',
		
		cmd=exec(qry);
		//console.log('graphGainData:'+qry);
		cmd.stdout.on("data",function(e,t){
			var i=t.split(" ").join("");
			i=i.split(",");
			var 
			a=parseInt(i[0]+i[1]+i[2]+i[3],16),
			p=parseInt(i[4]+i[5]+i[6]+i[7],16),
			c=parseInt(i[8]+i[9]+i[10]+i[11],16); //,
			//l=parseInt(i[12]+i[13]+i[14]+i[15],16);
			
			0==global.framcnt&&(global.framcnt=1,global.startframecnt=a);
	
			var 
				m=fromRegister(p,"LineInPga"),
				v=fromRegister(c,"LineInAbsMax"),
				//I=fromRegister(l,"SpkrOutAbsMax"),
				S=(a-global.startframecnt)/250,
				
				//y=20*Math.log10(I),
				b=20*Math.log10(m)+20*Math.log10(v);
	
				//y==Number.NEGATIVE_INFINITY&&(y=-99),
				b==Number.NEGATIVE_INFINITY&&(b=-99),
				//y>0&&(y=0),
				b>0&&(b=0),
				isNaN(S)||isNaN(b)||
				(gContents={x:S,y4:b},
				e.emit("new-graph-data-out-gain",gContents))
		}.bind(null,e))
	}
},
graphEQData=function(e){
	eqGetResponse(e)
}, 

graphClipData=function(e){
	if(!global.blockReading){
		var qry=tinymixSetReadRegIDCommand+"0x00 0x00 0x00 0x"+duetRegisterIds.stats+"; x=`"+
		tinymixGetCommand+'"'+duetRegisters.micInClip+'"`; y=`'+
		tinymixGetCommand+'"'+duetRegisters.mic1InClip+'"`; z=`'+
		tinymixGetCommand+'"'+duetRegisters.lineOutClip+'"`; t=`'+
		tinymixGetCommand+'"'+duetRegisters.lineInClip+'"`; echo "$x, $y, $z, $t"',
		
		cmd=exec(qry);
		cmd.stdout.on("data",function(e,t){
			var i=t.split(" ").join("");
			i=i.split(",");
			var n=parseInt(i[0]+i[1]+i[2]+i[3],16),
			s=parseInt(i[4]+i[5]+i[6]+i[7],16),
			r=parseInt(i[8]+i[9]+i[10]+i[11],16),
			a=parseInt(i[12]+i[13]+i[14]+i[15],16),
			//o=parseInt(i[12]+i[13]+i[14]+i[15],16),
			//a=parseInt(i[16]+i[17]+i[18]+i[19],16),
			p=fromRegister(n,"micInClip"),
			c=fromRegister(s,"mic1InClip"),
			l=fromRegister(r,"lineOutClip"),
			//d=fromRegister(o,"speakerOutClip"),
			u=fromRegister(a,"lineInClip");

			//console.log("micInClip:"+p+" mic1InClip: "+c+" lineOutClip: "+l+" lineInClip: "+u),
			gContents={micInClip:p,mic1InClip:c,lineOutClip:l,lineInClip:u},
			e.emit("new-graph-data-clips",gContents)
		}.bind(null,e))
	}
},

//
graphAudioModeData=function(e){
	if(!global.blockReading){
		var qry=tinymixSetReadRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds.diagnostics+
		"; t=`"+tinymixGetCommand+'"'+duetRegisters.FrameCntr+
		'"`; j=`'+tinymixSetReadRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds.stats+
		"`; l=`"+tinymixGetCommand+'"'+duetRegisters.ScRsvdStatsAudioMode+'"`; echo "$t, $j, $l"',
	
	cmd=exec(qry);
	//console.log("audio mode: "+qry);
	cmd.stdout.on("data",function(e,t){
		var i=t.split(" ").join("");
		i=i.split(",");
		var n=parseInt(i[0]+i[1]+i[2]+i[3],16),
			s=parseInt(i[5]+i[6]+i[7]+i[8],16);
		
		(global.framcnt=0)&&(global.framcnt=1,global.startframecnt=n);

		var r=fromRegister(s,"ScRsvdStatsAudioMode"),
		o=(n-global.startframecnt)/250;
		isNaN(o)||isNaN(r)||(//console.log("x: "+o+" audioMode: "+r),
		gContents={x:o,y:r},
		e.emit("new-graph-data-audiomode",gContents))
		}.bind(null,e))
	}
},


graphERLEData=function(e){
	if(!global.blockReading)
	{
		var qry=tinymixSetReadRegIDCommand+"0x00 0x00 0x00 "+
		duetRegisterIds.diagnostics+"; x=`"+
		tinymixGetCommand+'"'+duetRegisters.FrameCntr+'"`; j=`'+
		tinymixSetReadRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds.stats+"`; l=`"+
		tinymixGetCommand+'"'+duetRegisters.ScRsvdStatsAecInAvg+'"`; echo "$x, $j, $l"',
		cmd=exec(qry);
		//console.log("ERLE Data: "+qry);
		cmd.stdout.on("data",function(e,t){
			var i=t.split(" ").join("");
			i=i.split(",");
			var n=parseInt(i[0]+i[1]+i[2]+i[3],16),
			s=21,r=37,o=85,a=93,
			p=parseInt(i[s]+i[s+1]+i[s+2]+i[s+3],16),
			c=parseInt(i[s+4]+i[s+5]+i[s+6]+i[s+7],16),
			l=parseInt(i[r]+i[r+1]+i[r+2]+i[r+3],16),
			d=parseInt(i[r+4]+i[r+5]+i[r+6]+i[r+7],16),
			u=parseInt(i[o]+i[o+1]+i[o+2]+i[o+3],16),
			g=parseInt(i[o+4]+i[o+5]+i[o+6]+i[o+7],16),
			f=parseInt(i[a]+i[a+1]+i[a+2]+i[a+3],16),
			m=parseInt(i[a+4]+i[a+5]+i[a+6]+i[a+7],16);
			
			(global.framcnt=0)&&(global.framcnt=1,global.startframecnt=n);
			
			var v=(n-global.startframecnt)/250,
			
			I=10*Math.log10((p<<24)+c)-10*Math.log10((l<<24)+d),
			S=10*Math.log10((u<<24)+g)-10*Math.log10((f<<24)+m);
			
			/*I=10*Math.log10((p+c)/2)-10*Math.log10((l+d)/2),
			S=10*Math.log10((u+g)/2)-10*Math.log10((f+m)/2);*/
			
			I<0&&(I=0),
			S<0&&(S=0),
			
			gContents={x:v,y1:I,y2:S},
			isNaN(v)||isNaN(I)||isNaN(S)||(//console.log("x: "+gContents.x+" aec1: "+gContents.y1+" aec2: "+gContents.y2),
			e.emit("new-graph-data-erle",gContents))
		}.bind(null,e))
	}
},

graphDTDDtata=function(e){
	var qry=tinymixSetReadRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds.diagnostics+
	"; x=`"+tinymixGetCommand+'"'+duetRegisters.FrameCntr+
	'"`; j=`'+tinymixSetReadRegIDCommand+"0x00 0x00 0x00 "+duetRegisterIds.stats+
	"`; l=`"+tinymixGetCommand+'"'+duetRegisters.ScRsvdStatsAecInAvg+'"`; echo "$x, $j, $l"',
	cmd=exec(qry);
	//console.log("DTD Data: "+cmd);
	cmd.stdout.on("data",function(e,t){
		var i=t.split(" ").join("");
		i=i.split(",");
		var n=parseInt(i[0]+i[1]+i[2]+i[3],16),
		s=parseInt(i[5]+i[6]+i[7]+i[8],16),
		r=parseInt(i[109]+i[110]+i[111]+i[112],16);
		(global.framcnt=0)&&(global.framcnt=1,global.startframecnt=n);
		
		/**
		 * No need to handle Threshold, it will handled by JS in duet-graph.js
		 * getting reg value from fields #dtdThreshold
		 */ 
		var o=fromRegister(r,"ScRsvdStatsDtdQuotient"),
		a=(n-global.startframecnt)/250;
		gContents={x:a,y1:o,y2:s},
		isNaN(a)||isNaN(o)||isNaN(s)||(//console.log("x:"+a+" y1: "+o+" y2: "+s),
				e.emit("new-graph-data-dtd",gContents))
	}.bind(null,e))
};


function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};

httpIO=require("socket.io")(3030);

app.initSocketIO=function(e){
	socketIO=require("socket.io")(e),
	socketIO.of("/graphs-duet-gain").on("connection",function(e){
		console.log("Gain socket connected"),
		framcnt=0,
		gainDelay=setInterval(function(){graphGainData(e)},200),
		e.on("disconnect",function(){
			console.log("Gain socket disconnected"),clearInterval(gainDelay)})
		}),
		
	socketIO.of("/graphs-duet-out-gain").on("connection",function(e){
			console.log("Out Gain socket connected"),
			framcnt=0,
			outGainDelay=setInterval(function(){graphOutGainData(e)},200),
			e.on("disconnect",function(){
				console.log("Out Gain socket disconnected"),clearInterval(outGainDelay)})
			}),
	
	socketIO.of("/graphs-duet-clips").on("connection",function(e){
		console.log("Clips socket connected"),
		clipDelay=setInterval(function(){graphClipData(e)},1000),
		e.on("disconnect",function(){
			console.log("Clips socket disconnected"),
			clearInterval(clipDelay)
		})
	}),

	socketIO.of("/graphs-duet-audiomode").on("connection",function(e){
		console.log("Audio Mode socket connected"),
		framcnt=0,
		audioModeDelay=setInterval(function(){graphAudioModeData(e)},200),
		e.on("disconnect",function(){
			console.log("Audio Mode socket disconnected"),
			clearInterval(audioModeDelay)
		})
	}),
	
	socketIO.of("/graphs-duet-erle").on("connection",function(e){
		console.log("Erle socket connected"),
		framcnt=0,
		erleDelay=setInterval(function(){graphERLEData(e)},200),e.on("disconnect",function(){
				console.log("Erle socket disconnected"),clearInterval(erleDelay)
				})
			}),

	socketIO.of("/graphs-duet-dtd").on("connection",function(e){
		console.log("DTD socket connected"),
		framcnt=0,
		dtdDelay=setInterval(function(){graphDTDDtata(e)},200),
		e.on("disconnect",function(){
			console.log("DTD socket disconnected"),
			clearInterval(dtdDelay)
		})
	}),
	socketIO.of("/graphs-duet-eq").on("connection",function(e){
		console.log("EQ socket connected"),
		framcnt=0,
		graphEQData(e),
		e.on("disconnect",function(){
			console.log("EQ socket disconnected")
		})
	}),
	logsocketIO={},
	triggerIO={},
		triggerIO['avs']=httpIO.of("/trigger-avs"),
		logsocketIO['avs']=socketIO.of("/logs-avs").on("connection",function(browserData){
			onLogSubscribe('avs',browserData),
			browserData.on("request-log-update",function(){
				clientLogUpdate('avs',browserData)
			})
		})
	
};

module.exports=app;

var hotconfig = require('./hotspotconfig.js');

setTimeout(function(){
		console.log('checking hotspot');
		hotconfig.checkIfHotspotNeeded();
	}, 20000);
