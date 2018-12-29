var 
regList=["txgainPassThrough", "micSpacing", "lineIn", "micInput", "lineOut", "txMin",
    "aecReference", "dtdThreshold", "micBulkDelay", "appprocmod"],

speakerOutText={
	spkOut:"0x681 0x{{regVal}} 4wireSPI_32inx_16dat  Write       * OUT1LMIX Input 1 Volume(681H): {{regVal}}  OUT1LMIX_VOL1={{desc}}dB"+"\n"+
		"0x689 0x{{regVal}} 4wireSPI_32inx_16dat  Write       * OUT1RMIX Input 1 Volume(689H): {{regVal}}  OUT1RMIX_VOL1={{desc}}dB"+"\n"+
		"0x6B1 0x{{regVal}} 4wireSPI_32inx_16dat  Write       * OUT4LMIX Input 1 Volume(6B1H): {{regVal}}  OUT4LMIX_VOL1={{desc}}dB"+"\n"+
		"0x6B3 0x{{regVal}} 4wireSPI_32inx_16dat  Write       * OUT4LMIX Input 2 Volume(6B3H): {{regVal}}  OUT4LMIX_VOL2={{desc}}dB"+"\n"
}

speakerOutWisceList=["0x681","0x689","0x6B1", "0x6B3"],

micWisceText={
 	DSP2L:"0x980 0x{{regVal}} 4wireSPI_32inx_16dat  Write		   * DSP2LMIX Input 1 Source(980H): {{regVal}}  DSP2LMIX_STS1=0, DSP2LMIX_SRC1={{desc}}",
	ISRC1DEC1:"0xB00 0x{{regVal}} 4wireSPI_32inx_16dat  Write		   * ISRC1DEC1MIX Input 1 Source(B00H): {{regVal}}  ISRC1DEC1MIX_STS=0, ISRC1DEC1_SRC={{desc}}",
	ISRC1DEC2:"0xB08 0x{{regVal}} 4wireSPI_32inx_16dat  Write		   * ISRC1DEC2MIX Input 1 Source(B08H): {{regVal}}  ISRC1DEC2MIX_STS=0, ISRC1DEC2_SRC={{desc}}"
},
micWisceList=["0x980","0xB00","0xB08"],
regWisceText={
		
	txgainPassThrough_1:"0x3A8280 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_TRPGA_TXGAINS4_1(3A8280H): {{index1}}  SC_FF_DUET_TRPGA_TXGAINS4={{desc1}}",
	txgainPassThrough_0:"0x3A8281 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_TRPGA_TXGAINS4_0(3A8281H): {{index0}}  SC_FF_DUET_TRPGA_TXGAINS4={{desc0}}",
	
	micSpacing_1:"0x3A80C0 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCMMCONFIG_MICSPACINGMMS9_1(3A80C0H): {{index1}}  SC_FF_DUET_SCMMCONFIG_MICSPACINGMMS9={{desc1}}",
	micSpacing_0:"0x3A80C1 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCMMCONFIG_MICSPACINGMMS9_0(3A80C1H): {{index0}}  SC_FF_DUET_SCMMCONFIG_MICSPACINGMMS9={{desc0}}",
	
	lineIn_1:"0x3A800C 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_LINEINGAINS4_1(3A800CH): {{index1}}  SC_FF_DUET_SCPGA_LINEINGAINS4={{desc1}}",
	lineIn_0:"0x3A800D 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_LINEINGAINS4_0(3A800DH): {{index0}}  SC_FF_DUET_SCPGA_LINEINGAINS4={{desc0}}",
	
	//speakerOut_1:"0x3A800E 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_SPKROUTGAINS4_1(3A800EH): {{index1}}  SC_FF_DUET_SCPGA_SPKROUTGAINS4={{desc1}}",
	//speakerOut_0:"0x3A800F 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_SPKROUTGAINS4_0(3A800FH): {{index0}}  SC_FF_DUET_SCPGA_SPKROUTGAINS4={{desc0}}",
	
	micInput_1:"0x3A8008 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_MICINGAINS4_1(3A8008H): {{index1}}  SC_FF_DUET_SCPGA_MICINGAINS4={{desc1}}",
	micInput_0:"0x3A8009 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_MICINGAINS4_0(3A8009H): {{index0}}  SC_FF_DUET_SCPGA_MICINGAINS4={{desc0}}",
	
	lineOut_1:"0x3A800A 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_LINEOUTGAINS4_1(3A800AH): {{index1}}  SC_FF_DUET_SCPGA_LINEOUTGAINS4={{desc1}}",
	lineOut_0:"0x3A800B 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCPGA_LINEOUTGAINS4_0(3A800BH): {{index0}}  SC_FF_DUET_SCPGA_LINEOUTGAINS4={{desc0}}",
	
	txMin_1:"0x3A804A 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCVAD_TXMINSPEECHTHRESHSQRTS1_1(3A804AH): {{index1}}  SC_FF_DUET_SCVAD_TXMINSPEECHTHRESHSQRTS1={{desc1}}",
	txMin_0:"0x3A804B 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCVAD_TXMINSPEECHTHRESHSQRTS1_0(3A804BH): {{index0}}  SC_FF_DUET_SCVAD_TXMINSPEECHTHRESHSQRTS1={{desc0}}",
	
	aecReference_1:"0x3A8020 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCEC1CONFIG_BULKDELAYMSS11_1(3A8020H): {{index1}}  SC_FF_DUET_SCEC1CONFIG_BULKDELAYMSS11={{desc1}}",
	aecReference_0:"0x3A8021 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCEC1CONFIG_BULKDELAYMSS11_0(3A8021H): {{index0}}  SC_FF_DUET_SCEC1CONFIG_BULKDELAYMSS11={{desc0}}",
	
	dtdThreshold_1:"0x3A8032 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCVAD_DTDTHRESHS0_1(3A8032H): {{index1}}  SC_FF_DUET_SCVAD_DTDTHRESHS0={{desc1}}",
	dtdThreshold_0:"0x3A8033 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCVAD_DTDTHRESHS0_0(3A8033H): {{index0}}  SC_FF_DUET_SCVAD_DTDTHRESHS0={{desc0}}",
	
	micBulkDelay_1:"0x3A8024 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCEC1CONFIG_TXBULKDELAYMSS11_1(3A8024H): {{index1}}  SC_FF_DUET_SCEC1CONFIG_TXBULKDELAYMSS11={{desc1}}",
	micBulkDelay_0:"0x3A8025 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_SCEC1CONFIG_TXBULKDELAYMSS11_0(3A8025H): {{index0}}  SC_FF_DUET_SCEC1CONFIG_TXBULKDELAYMSS11={{desc0}}",
	
	appprocmod_1:"0x3A827E 0x{{index1}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_APPPROCMODE_MODE_1(3A827EH): {{index1}}  SC_FF_DUET_APPPROCMODE_MODE={{desc1}}",
	appprocmod_0:"0x3A827F 0x{{index0}} 4wireSPI_32inx_16dat  Write            * SC_FF_DUET_APPPROCMODE_MODE_0(3A827FH): {{index0}}  SC_FF_DUET_APPPROCMODE_MODE={{desc0}}",
	  
},
regWisceList={
	"0x3A8280":"txgainPassThrough_1",
	"0x3A8281":"txgainPassThrough_0",
		
	"0x3A80C0":"micSpacing_1",
	"0x3A80C1":"micSpacing_0",
	
	"0x3A800C":"lineIn_1",
	"0x3A800D":"lineIn_0",
	
	//"0x3A800E":"speakerOut_1",
	//"0x3A800F":"speakerOut_0",
	
	"0x3A8008":"micInput_1",
	"0x3A8009":"micInput_0",
	
	"0x3A800A":"lineOut_1",
	"0x3A800B":"lineOut_0",
	
	"0x3A804A":"txMin_1",
	"0x3A804B":"txMin_0",
	
	"0x3A8020":"aecReference_1",
	"0x3A8021":"aecReference_0",
	
	"0x3A8032":"dtdThreshold_1",
	"0x3A8033":"dtdThreshold_0",
	
	"0x3A8024":"micBulkDelay_1",
	"0x3A8025":"micBulkDelay_0",
	
	"0x3A827E":"appprocmod_1",
	"0x3A827F":"appprocmod_0",
		
},
filterGainWisceList=["0xE10", "0xE11"],
eqWisceList=["0xE12","0xE13", "0xE14", "0xE15", "0xE16", "0xE17", "0xE18", "0xE19", "0xE1A", "0xE1B", "0xE1C","0xE1D", "0xE1E", "0xE1F", "0xE20", "0xE21", "0xE22", "0xE23", "0xE24"],

filterGainWisceTest={
		 reg1: "0xE10 0x{{reg1}} 4wireSPI_32inx_16dat  Write            * EQ1_1(E10H):             {{reg1}}  {{{regDesc1}}}",
		 reg2: "0xE11 0x{{reg2}} 4wireSPI_32inx_16dat  Write            * EQ1_2(E11H):             {{reg2}}  {{{regDesc2}}}"
},

eqWisceText={
	  //bandpass: 0,
	  band1a: "0xE12 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_3(E12H):             {{band}}  EQ1_B1_A={{bandBin}}",
	  band1b: "0xE13 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_4(E13H):             {{band}}  EQ1_B1_B={{bandBin}}",
	  band1pg: "0xE14 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_5(E14H):             {{band}}  EQ1_B1_PG={{bandBin}}",
	  band2a: "0xE15 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_6(E15H):             {{band}}  EQ1_B2_A={{bandBin}}",
	  band2b: "0xE16 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_7(E16H):             {{band}}  EQ1_B2_B={{bandBin}}",
	  band2c: "0xE17 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_8(E17H):             {{band}}  EQ1_B2_C={{bandBin}}",
	  band2pg: "0xE18 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_9(E18H):             {{band}}  EQ1_B2_PG={{bandBin}}",
	  band3a: "0xE19 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_10(E19H):            {{band}}  EQ1_B3_A={{bandBin}}",
	  band3b: "0xE1A 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_11(E1AH):            {{band}}  EQ1_B3_B={{bandBin}}",
	  band3c: "0xE1B 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_12(E1BH):            {{band}}  EQ1_B3_C={{bandBin}}",
	  band3pg: "0xE1C 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_13(E1CH):            {{band}}  EQ1_B3_PG={{bandBin}}",
	  band4a: "0xE1D 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_14(E1DH):            {{band}}  EQ1_B4_A={{bandBin}}",
	  band4b: "0xE1E 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_15(E1EH):            {{band}}  EQ1_B4_B={{bandBin}}",
	  band4c: "0xE1F 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_16(E1FH):            {{band}}  EQ1_B4_C={{bandBin}}",
	  band4pg: "0xE20 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_17(E20H):            {{band}}  EQ1_B4_PG={{bandBin}}",
	  band5a: "0xE21 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_18(E21H):            {{band}}  EQ1_B5_A={{bandBin}}",
	  band5b: "0xE22 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_19(E22H):            {{band}}  EQ1_B5_B={{bandBin}}",
	  band5pg: "0xE23 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_20(E23H):            {{band}}  EQ1_B5_PG={{bandBin}}",
	  band1c: "0xE24 0x{{band}} 4wireSPI_32inx_16dat  Write            * EQ1_21(E24H):            {{band}}  EQ1_B1_C={{bandBin}}"
},
duetReg={
	  micSpacing: "DSP3Y Misc 1005 SCMMCONFIG_MICSPACINGMMS9", 
	  lineIn: "DSP3Y Misc 1005 SCPGA_LINEINGAINS4", 
	  micInput: "DSP3Y Misc 1005 SCPGA_MICINGAINS4",
	  lineOut: "DSP3Y Misc 1005 SCPGA_LINEOUTGAINS4",
	  speakerOut: "HPOUT1L Input 1 Volume",
	  //speakerOut: "DSP3Y Misc 1005 SCPGA_SPKROUTGAINS4",
	  speakerOut2: "HPOUT1R Input 1 Volume",
	  txMin: "DSP3Y Misc 1005 VAD_TXMINSPEECHTHRESHSQRTS1",
	  aecReference: "DSP3Y Misc 1005 SCEC1CONFIG_BULKDELAYMSS11",
	  dtdThreshold: "DSP3Y Misc 1005 SCVAD_DTDTHRESHS0",
	  micBulkDelay: "DSP3Y Misc 1005 CEC1CONFIG_TXBULKDELAYMSS11",
	  
	  readregid: "DSP3Y Misc 1005 READREGID",
	  writeregid: "DSP3Y Misc 1005 WRITEREGID",
	  
	  FrameCntr: "DSP3Y Misc 1005 APPCNRSTATS_FRAMECNTR",
	  Mic1InAbsMax: "DSP3Y Misc 1005 APPCNRSTATS_MICINABSMAX",
	  Mic2InAbsMax: "DSP3Y Misc 1005 APPCNRSTATS_MIC1INABSMAX",
	  LineOutAbsMax: "DSP3Y Misc 1005 APPCNRSTATS_LINEOUTABSMAX",
	  LineInAbsMax: "DSP3Y Misc 1005 APPCNRSTATS_LINEINABSMAX",
	  //SpkrOutAbsMax: "DSP3Y Misc 1005 APPCNRSTATS_SPKROUTABSMAX",
	  MicInPga: "DSP3Y Misc 1005 SCPGA_MICINGAINS4",
	  LineInPga: "DSP3Y Misc 1005 SCPGA_LINEINGAINS4",
	  ScRsvdStatsAudioMode: "DSP3Y Misc 1005 ISCRSVDSTATS_SCRSVDSTATS",
	  ScRsvdStatsAecInAvg: "DSP3Y Misc 1005 ISCRSVDSTATS_SCRSVDSTATS",
	  ScRsvdStatsAecOutAvg: "DSP3Y Misc 1005 ISCRSVDSTATS_SCRSVDSTATS",
	  ScRsvdStatsAec2InAvg: "DSP3Y Misc 1005 ISCRSVDSTATS_SCRSVDSTATS",
	  ScRsvdStatsAec2OutAvg: "DSP3Y Misc 1005 ISCRSVDSTATS_SCRSVDSTATS",
	  ScRsvdStatsDtdQuotient: "DSP3Y Misc 1005 ISCRSVDSTATS_SCRSVDSTATS",
	  appprocmod: "DSP3Y Misc 1005 APPPROCMODE_MODE", 
	  micInClip: "DSP3Y Misc 1005 APPCNRSTATS_MICINCLIPCNT",
	  mic1InClip: "DSP3Y Misc 1005 APPCNRSTATS_MIC1INCLIPCNT",
	  lineOutClip: "DSP3Y Misc 1005 APPCNRSTATS_LINEOUTCLIPCNT",
	  //speakerOutClip: "DSP3Y Misc 1005 APPCNRSTATS_SPKROUTCLIPCNT",
	  lineInClip: "DSP3Y Misc 1005 APPCNRSTATS_LINEINCLIPCNT",
	  txgainPassThrough: "DSP3Y Misc 1005 TRPGA_TXGAINS4", 
	  EQ: "EQ1 Coefficients",
	  filterGain1: "EQ1 B1 Volume",
	  filterGain2: "EQ1 B2 Volume", 
	  filterGain3: "EQ1 B3 Volume", 
	  filterGain4: "EQ1 B4 Volume", 
	  filterGain5: "EQ1 B5 Volume" 
},
regconversion={
	  micSpacing: 0,
	  lineIn: 1,
	  micInput: 1,
	  lineOut: 1,
	  speakerOut: 0,
	  //speakerOut: 1,
	  txMin: 1,
	  aecReference: 0,
	  dtdThreshold: 0,
	  micBulkDelay: 0,
	  Mic1InAbsMax: 0,
	  Mic2InAbsMax: 0,
	  SpkrOutAbsMax: 0,
	  LineOutAbsMax: 0,
	  LineInAbsMax: 0,
	  MicInPga: 0,
	  LineInPga: 0,
	  ScRsvdStatsAudioMode: 0,
	  ScRsvdStatsAecInAvg: 0,
	  ScRsvdStatsAecOutAvg: 0,
	  ScRsvdStatsAec2InAvg: 0,
	  ScRsvdStatsAec2OutAvg: 0,
	  ScRsvdStatsDtdQuotient: 0,
	  appprocmod: 0,
	  FrameCntr: 0,
	  micInClip: 0,
	  mic1InClip: 0,
	  lineOutClip: 0,
	  speakerOutClip: 0,
	  lineInClip: 0,
	  txgainPassThrough: 1,
	  EQ: 0,
	  filterGain1: 0,
	  filterGain2: 0,
	  filterGain3: 0,
	  filterGain4: 0,
	  filterGain5: 0
},
regFractions={
	  micSpacing: 11,
	  lineIn: 16,
	  micInput: 16,
	  lineOut: 16,
	  speakerOut: 0,
	  //speakerOut: 16,
	  txMin: 19,
	  aecReference: 9,
	  dtdThreshold: 20,
	  micBulkDelay: 9,
	  Mic1InAbsMax: 20,
	  Mic2InAbsMax: 20,
	  LineOutAbsMax: 20,
	  LineInAbsMax: 20,
	  SpkrOutAbsMax: 20,
	  MicInPga: 16,
	  LineInPga: 16,
	  ScRsvdStatsAudioMode: 0,
	  ScRsvdStatsAecInAvg: 34,
	  ScRsvdStatsAecOutAvg: 34,
	  ScRsvdStatsAec2InAvg: 34,
	  ScRsvdStatsAec2OutAvg: 34,
	  ScRsvdStatsDtdQuotient: 20,
	  appprocmod: 0,
	  FrameCntr: 0,
	  micInClip: 0,
	  mic1InClip: 0,
	  lineOutClip: 0,
	  speakerOutClip: 0,
	  lineInClip: 0,
	  txgainPassThrough: 16,
	  EQ: 12,
	  filterGain1: 0,
	  filterGain2: 0,
	  filterGain3: 0,
	  filterGain4: 0,
	  filterGain5: 0
},

regIds={
	  diagnostics: 23, //25
	  stats: 17, //19,
	  micInput: 0,
	  lineIn: 0,
	  micSpacing: 9, //10,
	  lineOut: 0,
	  speakerOut: 0,
	  txMin: 5,
	  aecReference: 3,
	  dtdThreshold: 5,
	  micBulkDelay: 3,
	  ScRsvdStatsAudioMode: 17, //19,
	  ScRsvdStatsAecInAvg: 17, //19,
	  ScRsvdStatsAecOutAvg: 17, //19,
	  ScRsvdStatsAec2InAvg: 17, //19,
	  ScRsvdStatsAec2OutAvg: 17, //19,
	  ScRsvdStatsDtdQuotient: 17, //19,
	  appprocmod: 18, //20,
	  txgainPassThrough: 19, //21
},

eqind={
	  bandpass: 0,
	  band1a: 4,
	  band1b: 8,
	  band1pg: 12,
	  band2a: 16,
	  band2b: 20,
	  band2c: 24,
	  band2pg: 28,
	  band3a: 32,
	  band3b: 36,
	  band3c: 40,
	  band3pg: 44,
	  band4a: 48,
	  band4b: 52,
	  band4c: 56,
	  band4pg: 60,
	  band5a: 64,
	  band5b: 68,
	  band5pg: 72,
	  band1c: 76
},
avsProps=[
	{name:"Client ID",property:"clientId",variable:"avsClientId",type:"string",app: "avs"},
	{name:"Client Secret",property:"clientSecret",variable:"avsClientSecret",type:"string",app: "avs"},
	{name:"Product ID",property:"productId",variable:"avsProductId",type:"string",app: "avs"},
	{name:"Device Serial Number",property:"dsn",variable:"dsn",app: "avs"},
	{name:"LWA API Host",property:"lwaApiHost",variable:"lwaApiHost",app: "avs"},
	{name:"LWA Redirect Host",property:"lwaRedirectHost",variable:"lwaRedirectHost",app: "avs"},
	{name:"Redirect URL",property:"redirectUrl",variable:"avsRedirectUrl",app: "avs"},
	{name:"Service Log",property:"app.avs.service.log",variable:"avsServiceLog",app: "avs"},
	{name:"Service Status",property:"app.avs.service.status",variable:"avsServiceStatus",app: "avs"},
	{name:"Service Start",property:"app.avs.service.start",variable:"avsServiceStart",app: "avs"},
	{name:"Service Stop",property:"app.avs.service.stop",variable:"avsServiceStop",app: "avs"}
	],
apps={
	  avs: {
		    name: "AVS",
		    controls: !0,
		    start: "avsServiceStart",
		    stop: "avsServiceStop",
		    status: "avsServiceStatus",
		    log: "avsServiceLog"
		    
		  }
	},
properties=[{name:"Environment Profile",property:"environment.profile",variable:"environmentProfile"}]

properties=properties.concat(avsProps);
exports.duetReg = duetReg;
exports.regconversion = regconversion;
exports.regFractions = regFractions;
exports.regIds = regIds;
exports.eqind = eqind;

exports.avsProps = avsProps;
exports.apps = apps;
exports.properties = properties;
exports.eqWisceText = eqWisceText;
exports.filterGainWisceTest=filterGainWisceTest;
exports.filterGainWisceList=filterGainWisceList;
exports.eqWisceList=eqWisceList;
exports.regList=regList;
exports.regWisceText=regWisceText;
exports.regWisceList=regWisceList;
exports.micWisceText=micWisceText;
exports.micWisceList=micWisceList;
exports.speakerOutText=speakerOutText;
exports.speakerOutWisceList=speakerOutWisceList;