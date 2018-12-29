var N = 50, zero_array = [], arrayMicIn1 = [], arrayMicIn2 = [], arrayLineOut = [], arrayLineIn = [], arraySpeaker = [],arrayAudioMode = [],
 arrayERLE1 = [],arrayERLE2 = [], arrayDTD1 = [], arrayDTD2 = [], arrayEQ = [],

dataInput = {
    labels: zero_array,
    scaleOverride : true,
    scaleSteps : 10,
    scaleStepWidth : 50,
    scaleStartValue : 0,
    datasets:  [
        {
            label: "Mic In 1",
            data: arrayMicIn1,
            borderColor: "rgba(52, 152, 219, 1)",
            backgroundColor: "rgba(52, 152, 219, 1)",
            fill: false
        },
        {
            label: "Mic In 2",
            data: arrayMicIn2, 
            borderColor: "rgba(192, 57, 43, 1)",
            backgroundColor:  "rgba(192, 57, 43, 1)",
            fill: false
        },
        {
            label: "Line Out",
            data: arrayLineOut,
            borderColor:  "rgba(230, 126, 34, 1)",
            backgroundColor: "rgba(230, 126, 34, 1)",
            fill: false
        }
    ]
},
dataOutput = {
    labels: zero_array,
    scaleOverride : true,
    scaleSteps : 10,
    scaleStepWidth : 50,
    scaleStartValue : 0,
    datasets:  [
        {
            label: "Line In",
            data: arrayLineIn, 
            borderColor: "rgba(241, 196, 15, 1)",
            backgroundColor: "rgba(241, 196, 15, 1)",
            fill: false
        }
       /* ,
        {
            label: "Speaker",
            data: arraySpeaker,
            borderColor: "rgba(46, 204, 113, 1)",
            backgroundColor: "rgba(46, 204, 113, 1)",
            fill: false
        }*/
    ]
},
dataAudioMode = {
    labels: zero_array,
    scaleOverride : true,
    scaleSteps : 15,
    scaleStepWidth : 50,
    scaleStartValue : 0,
    datasets:  [
        {
            label: "Audio Mode",
            data: arrayAudioMode,
            borderColor: "rgba(230, 126, 34, 1)",
            backgroundColor: "rgba(230, 126, 34, 1)",
            fill: true
        }
    ]
},
dataERLE = {
    labels: zero_array,
    scaleOverride : true,
    scaleSteps : 15,
    scaleStepWidth : 50,
    scaleStartValue : 0,
    datasets:  [
        {
            label: "AEC1",
            data: arrayERLE1,
            borderColor: "rgba(241, 196, 15, 1)",
            backgroundColor: "rgba(241, 196, 15, 1)",
            fill: false
        },
        {
            label: "AEC2",
            data: arrayERLE2,
            borderColor: "rgba(46, 204, 113, 1)",
            backgroundColor: "rgba(46, 204, 113, 1)",
            fill: false
        }
    ]
},
dataDTD = {
    labels: zero_array,
    scaleOverride : true,
    scaleSteps : 15,
    scaleStepWidth : 50,
    scaleStartValue : 0,
    datasets:  [
        {
            label: "Quotient",
            data: arrayDTD1,
            borderColor: "rgba(241, 196, 15, 1)",
            backgroundColor: "rgba(241, 196, 15, 1)",
            fill: false
        },
        {
            label: "Threshold",
            data: arrayDTD2,
            borderColor: "rgba(46, 204, 113, 1)",
            backgroundColor: "rgba(46, 204, 113, 1)",
            fill: false
        }
    ]
},
dataEQ = {
    labels: zero_array,
    scaleOverride : true,
    scaleSteps : 15,
    scaleStepWidth : 50,
    scaleStartValue : 0,
    datasets:  [
        {
            label: "Gain",
            data: arrayEQ,
            borderColor: "rgba(25, 181, 254,1)",
            backgroundColor: "rgba(25, 181, 254,1)",
            fill: false
        }
    ]
},
audioInputChart,audioOutputChart,audioModeChart,erleChart,dtdChart,eqChart;
var mic1Btn=false, mic2Btn=false, lineOutBtn=false, 
lineInBtn=false, speakerBtn=false, 
audioModeBtn=false, 
aec1Btn=false,aec2Btn=false,
quotientBtn=false, thresholdBtn=false, 
gainBtn=false;

var mic1Stk, mic2Stk, lineOutStk, 
lineInStk, speakerStk, 
audioModeStk, 
aec1Stk,aec2Stk,
quotientStk, thresholdStk, 
gainStk;

window.onload = function main() {
    var inputctx = document.getElementById("chartInputGain").getContext("2d"),
    outputctx = document.getElementById("chartOutputGain").getContext("2d"),
    audioModeCtx = document.getElementById("chartAudioMode").getContext("2d"),
    erleCtx = document.getElementById("chartERLE").getContext("2d"),
    dtdCtx = document.getElementById("chartDTD").getContext("2d"),
    eqCtx = document.getElementById("chartEQ").getContext("2d");


    audioInputChart = new Chart(inputctx , {
        type: "line",
        data: dataInput,
        options : {
        	legend: {
        		position: 'top',
        		/*maxHeight: 5,
        		labels: {
        		      boxWidth: 20,
        		}*/
        		//maxWidth: 100,
        		/*"maxSize" : {
                    "height" : 10
                },*/
        		/*itemStyle: {
        	        width: 150 // or whatever, auto-wrap
        	    },*/
        		//itemWidth: 200,
        	    onClick: function(e, legendItem){
        			var index = legendItem.datasetIndex;
        			       			
        			if(index==0){
	        			if(mic1Btn){mic1Btn=false;}
	        			else{mic1Btn=true;}
        			}else if(index==1){
	        			if(mic2Btn){mic2Btn=false;}
	        			else {mic2Btn=true;}
        			}
        			else if(index==2){
	        			if(lineOutBtn){lineOutBtn=false;}
	        			else{lineOutBtn=true;}
        			}
        			var ci = this.chart;
        		    var meta = ci.getDatasetMeta(index);
        		    // See controller.isDatasetVisible comment
        		    meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
        		    ci.update();
        		}
        	},
        	elements: { point: { radius: 1, hitRadius: 10, hoverRadius: 10 } },
            scales: {
                yAxes: [{
                    ticks:{
                        beginAtZero : false,
                        //min: -100,
                        //max: 20
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'dB'
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Time(s)'
                    }
                }]
            }
        }
    });

    audioOutputChart = new Chart(outputctx , {
        type: "line",
        data: dataOutput,
        options : {
        	legend: {
        		position: 'top',
        		onClick: function(e, legendItem){
        			var index = legendItem.datasetIndex;
        			if(index==0){
	        			if(lineInBtn){lineInBtn=false;}
	        			else {lineInBtn=true;}
        			}
        			/*else if(index==1){
	        			if(speakerBtn){speakerBtn=false;}
	        			else{speakerBtn=true;}
        			}*/
        			var ci = this.chart;
        		    var meta = ci.getDatasetMeta(index);
        		    //console.log("hidden value : "+meta.hidden);
        		    // See controller.isDatasetVisible comment
        		    meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
        		    ci.update();
        		}
        	},
            elements: { point: { radius: 1, hitRadius: 10, hoverRadius: 10 } },
            scales: {
                yAxes: [{
                    ticks:{
                        beginAtZero : false,
                        //min: -100,
                        //max: 20
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'dB'
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Time(s)'
                    }
                }]
            }
        }
    });

    audioModeChart = new Chart(audioModeCtx , {
        type: "line",
        data: dataAudioMode,
        options : {
        	legend: {
        		position: 'top',
        		onClick: function(e, legendItem){
        			var index = legendItem.datasetIndex;
        			if(index==0){
	        			if(audioModeBtn){audioModeBtn=false;}
	        			else {audioModeBtn=true;}
        			}
        			var ci = this.chart;
        		    var meta = ci.getDatasetMeta(index);
        		    console.log("hidden value : "+meta.hidden);
        		    // See controller.isDatasetVisible comment
        		    meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
        		    ci.update();
        		}
        	},
            elements: { point: { radius: 1, hitRadius: 10, hoverRadius: 10 } },
            scales: {
                yAxes: [{
                    ticks:{
                        min: 0,
                        max: 4,
                        callback: function(value, index, values) {
                            if(value == 0){
                                var dasLabel='Silence';
                            }
                            if(value == 1){
                                var dasLabel='TX';
                            }
                            if(value == 2){
                                var dasLabel='RX';
                            }
                            if(value == 3){
                                var dasLabel='TX & RX';
                            }

                            return dasLabel;
                        }
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Time(s)'
                    }
                }]
            }
        }
    });


    erleChart = new Chart(erleCtx , {
        type: "line",
        data: dataERLE,
        options : {
        	legend: {
        		position: 'top',
        		onClick: function(e, legendItem){
        			var index = legendItem.datasetIndex;
        			if(index==0){
	        			if(aec1Btn){aec1Btn=false;}
	        			else {aec1Btn=true;}
        			}else if(index==1){
	        			if(aec2Btn){aec2Btn=false;}
	        			else{aec2Btn=true;}
        			}
        			var ci = this.chart;
        		    var meta = ci.getDatasetMeta(index);
        		    console.log("hidden value : "+meta.hidden);
        		    // See controller.isDatasetVisible comment
        		    meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
        		    ci.update();
        		}
        	},
            elements: { point: { radius: 1, hitRadius: 10, hoverRadius: 10 } },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'dB'
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Time(s)'
                    }
                }]
            }
        }
    });


    dtdChart = new Chart(dtdCtx , {
        type: "line",
        data: dataDTD,
        options : {
        	legend: {
        		position: 'top',
        		onClick: function(e, legendItem){
        			var index = legendItem.datasetIndex;
        			if(index==0){
	        			if(quotientBtn){quotientBtn=false;}
	        			else {quotientBtn=true;}
        			}else if(index==1){
	        			if(thresholdBtn){thresholdBtn=false;}
	        			else{thresholdBtn=true;}
        			}
        			var ci = this.chart;
        		    var meta = ci.getDatasetMeta(index);
        		   // See controller.isDatasetVisible comment
        		    meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
        		    ci.update();
        		}
        	},
            elements: { point: { radius: 1, hitRadius: 10, hoverRadius: 10 } },
            scales: {
                yAxes: [{
                    ticks:{
                        beginAtZero : true,
                        min: 0,
                        max: 1
                    }
                }],
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Time(s)'
                    }
                }]
            }
        }
    });

    eqChart = new Chart(eqCtx , {
        type: "line",
        data: dataEQ,
        options : {
            elements: { point: { radius: 1, hitRadius: 10, hoverRadius: 10 } },
            scales: {
                yAxes: [{
                    ticks:{
                        beginAtZero : false,
                        min: -40,
                        max: 20
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'dB'
                    }
                }],
                xAxes: [{
                    type: 'logarithmic',
                    position: 'bottom',
                    ticks:{
                        min: 100,
                        max: 24000,
                        autoSkip: false,
                        callback: function(tick, index, ticks) {
                            if(tick == 100 || tick == 1000 || tick == 10000 || tick == 24000){
                                //console.log("TICK: " + tick + " INDEX: " + index);
                                return tick.toLocaleString();
                            }else{
                                return "";
                            }
                        }
                    },
                    afterBuildTicks: function(eqChart) {
                        eqChart.ticks = [];
                        eqChart.ticks.push(100);
                        eqChart.ticks.push(200);
                        eqChart.ticks.push(300);
                        eqChart.ticks.push(400);
                        eqChart.ticks.push(500);
                        eqChart.ticks.push(600);
                        eqChart.ticks.push(700);
                        eqChart.ticks.push(800);
                        eqChart.ticks.push(900);
                        eqChart.ticks.push(1000);
                        eqChart.ticks.push(2000);
                        eqChart.ticks.push(3000);
                        eqChart.ticks.push(4000);
                        eqChart.ticks.push(5000);
                        eqChart.ticks.push(6000);
                        eqChart.ticks.push(7000);
                        eqChart.ticks.push(8000);
                        eqChart.ticks.push(9000);
                        eqChart.ticks.push(10000);
                        eqChart.ticks.push(20000);
                        eqChart.ticks.push(24000);
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Frequency (Hz)'
                    }
                }]
            }
        }
    });

    audioInputChart.options.tooltips.enabled = false;
    audioOutputChart.options.tooltips.enabled = false;
    audioModeChart.options.tooltips.enabled = false;
    erleChart.options.tooltips.enabled = false;
    dtdChart.options.tooltips.enabled = false;
}

var duetSocketGain, duetSocketOutGain, duetSocketClip, duetSocketAudioMode, duetSocketErle, duetSocketDtd, duetSocketEQ;

function enableGainSocket() {
    //reset all of the graphs
    dataInput.datasets[0].data = [];
    dataInput.datasets[1].data = [];
    dataInput.datasets[2].data = [];

    duetSocketGain = io('/graphs-duet-gain');
    duetSocketGain.on('new-graph-data-gain', function(graphData) {
        var g1 = {x: graphData["x"], y: graphData["y1"]};
        var g2 = {x: graphData["x"], y: graphData["y2"]};
        var g3 = {x: graphData["x"], y: graphData["y3"]};
       
        if(dataInput.datasets[0].data.length > N){
            dataInput.datasets[0].data.shift();
        }
        

        if(dataInput.datasets[1].data.length > N){
            dataInput.datasets[1].data.shift();
        }
        if(dataInput.datasets[2].data.length > N){
            dataInput.datasets[2].data.shift();
        }
        
        dataInput.datasets[0].data.push(g1);
        dataInput.datasets[1].data.push(g2);
        dataInput.datasets[2].data.push(g3);
       
        if(!mic1Btn){
        	mic1Stk = graphData["y1"].toFixed(1);
        }
        if(!mic2Btn){
        	mic2Stk = graphData["y2"].toFixed(1);
        }
        if(!lineOutBtn){
        	lineOutStk = graphData["y3"].toFixed(1);
        }
        dataInput.datasets[0].label = 'Mic In 1 '+mic1Stk+' dB';
        dataInput.datasets[1].label = 'Mic In 2 '+mic2Stk+' dB';
        dataInput.datasets[2].label = 'Line Out '+lineOutStk+' dB';
        
        audioInputChart.update();

    });
}

function enableOutGainSocket() {
    dataOutput.datasets[0].data = [];
    //dataOutput.datasets[1].data = [];

    duetSocketOutGain = io('/graphs-duet-out-gain');
    duetSocketOutGain.on('new-graph-data-out-gain', function(graphData) {
        var g4 = {x: graphData["x"], y: graphData["y4"]};
       // var g5 = {x: graphData["x"], y: graphData["y5"]};

        if(dataOutput.datasets[0].data.length > N){
            dataOutput.datasets[0].data.shift();
        }
        dataOutput.datasets[0].data.push(g4);

        /*if(dataOutput.datasets[1].data.length > N){
            dataOutput.datasets[1].data.shift();
        }
        dataOutput.datasets[1].data.push(g5);
        */
        if(!lineInBtn){
        	lineInStk=graphData["y4"].toFixed(1);
        }
        /*if(!speakerBtn){
        	speakerStk=graphData["y5"].toFixed(1);
        } */       
        dataOutput.datasets[0].label = 'Line In '+lineInStk+' dB';
        //dataOutput.datasets[1].label = 'Speaker '+speakerStk+' dB';
        
        audioOutputChart.update();

    });
}

function enableClipSocket() {
    duetSocketClip = io('/graphs-duet-clips');
    duetSocketClip.on('new-graph-data-clips', function(graphData) {
        var micInClip = graphData["micInClip"];
        var mic1InClip = graphData["mic1InClip"];
        var lineOutClip = graphData["lineOutClip"];
        var lineInClip = graphData["lineInClip"];
        //var speakerOutClip = graphData["speakerOutClip"];

        if(($("#micInClipText").val() == "" || $("#micInClipText").val() == "0") && !isNaN(micInClip)){
            if(micInClip != 0) {$("#micInClipText").addClass("input-error")};
            //$("#micInClipText").val(micInClip);
        }

        if(($("#mic1InClipText").val() == "" || $("#mic1InClipText").val() == "0") && !isNaN(mic1InClip)){
            //$("#mic1InClipText").val(mic1InClip);
            if(mic1InClip != 0) {$("#mic1InClipText").addClass("input-error")};
        }
        if(($("#lineOutClipText").val() == "" || $("#lineOutClipText").val() == "0") && !isNaN(lineOutClip)){
           // $("#lineOutClipText").val(lineOutClip);
            if(lineOutClip != 0) {$("#lineOutClipText").addClass("input-error")};
        }
        if(($("#lineInClipText").val() == "" || $("#lineInClipText").val() == "0") && !isNaN(lineInClip)){
           // $("#lineInClipText").val(lineInClip);
            if(lineInClip != 0) {$("#lineInClipText").addClass("input-error")};
        }
        /*if(($("#speakerOutClipText").val() == "" || $("#speakerOutClipText").val() == "0") && !isNaN(speakerOutClip)){
            //$("#speakerOutClipText").val(speakerOutClip);
            if(speakerOutClip != 0) {$("#speakerOutClipText").addClass("input-error")};
        }*/

    });
}

function enableAudioModeSocket() {
    dataAudioMode.datasets[0].data = [];
    duetSocketAudioMode = io('/graphs-duet-audiomode');
    duetSocketAudioMode.on('new-graph-data-audiomode', function(graphData) {
        var g1 = {x: graphData["x"], y: graphData["y"]};
        if(dataAudioMode.datasets[0].data.length > N){
            dataAudioMode.datasets[0].data.shift();
        }
        dataAudioMode.datasets[0].data.push(g1);
         
        if(!audioModeBtn){
        	audioModeStk = graphData["y"].toFixed(0);
        }
        dataAudioMode.datasets[0].label = 'Audio Mode '+audioModeStk;
        audioModeChart.update();
    });
}

function enableErleSocket() {
    dataERLE.datasets[0].data = [];
    dataERLE.datasets[1].data = [];
    duetSocketErle = io('/graphs-duet-erle');
    duetSocketErle.on('new-graph-data-erle', function(graphData) {
        var g1 = {x: graphData["x"], y: graphData["y1"]};
        var g2 = {x: graphData["x"], y: graphData["y2"]};

        if(dataERLE.datasets[0].data.length > N){
            dataERLE.datasets[0].data.shift();
        }

        dataERLE.datasets[0].data.push(g1);
        if(dataERLE.datasets[1].data.length > N){
            dataERLE.datasets[1].data.shift();
        }
        dataERLE.datasets[1].data.push(g2);
        ////aec1Btn=false,aec2Btn=false,
      
        if(!aec1Btn){
        	aec1Stk = graphData["y1"].toFixed(1);
        }
        
        if(!aec2Btn){
        	aec2Stk=graphData["y2"].toFixed(1)
        }
        dataERLE.datasets[0].label = 'AEC1 '+aec1Stk+' dB';
        dataERLE.datasets[1].label = 'AEC2 '+aec2Stk+' dB';
        erleChart.update();
    });
}

function enableDtdSocket() {
    dataDTD.datasets[0].data = [];
    dataDTD.datasets[1].data = [];
    duetSocketDtd = io('/graphs-duet-dtd');
    duetSocketDtd.on('new-graph-data-dtd', function(graphData) {
        var g1 = {x: graphData["x"], y: graphData["y1"]};
        var audioMode = graphData["y2"];
        var dtdThresh = {x: graphData["x"], y: $("#dtdThreshold").val()};
        console.log("dtdThresh : "+$("#dtdThreshold").val());

        if(dataDTD.datasets[0].data.length > N){
            dataDTD.datasets[0].data.shift();
        }
        dataDTD.datasets[0].data.push(g1);

        if(dataDTD.datasets[1].data.length > N){
            dataDTD.datasets[1].data.shift();
        }
       
        if(!quotientBtn){
        	quotientStk=graphData["y1"].toFixed(2);
        }
        
        if(!thresholdBtn){
        	thresholdStk=$("#dtdThreshold").val();
        }
        
        dataDTD.datasets[0].label = 'Quotient '+quotientStk;
        dataDTD.datasets[1].label = 'Threshold '+thresholdStk;
        
        dataDTD.datasets[1].data.push(dtdThresh);


        switch(audioMode){
            case 0:
                document.getElementById("circleSilence").classList.add('circleActive');
                document.getElementById("circleTX").classList.remove('circleActive');
                document.getElementById("circleRX").classList.remove('circleActive');
                document.getElementById("circleTXandRX").classList.remove('circleActive');
                break;
            case 1:
                document.getElementById("circleTX").classList.add('circleActive');
                document.getElementById("circleSilence").classList.remove('circleActive');
                document.getElementById("circleRX").classList.remove('circleActive');
                document.getElementById("circleTXandRX").classList.remove('circleActive');
                break;
            case 2:
            	document.getElementById("circleRX").classList.add('circleActive');
                document.getElementById("circleSilence").classList.remove('circleActive');
                document.getElementById("circleTX").classList.remove('circleActive');
                document.getElementById("circleTXandRX").classList.remove('circleActive');
                break;
            case 3:
                document.getElementById("circleTXandRX").classList.add('circleActive');
                document.getElementById("circleSilence").classList.remove('circleActive');
                document.getElementById("circleTX").classList.remove('circleActive');
                document.getElementById("circleRX").classList.remove('circleActive');
                break;
        }

        dtdChart.update();
    });
}
function enableEQSocket() {
    dataEQ.datasets[0].data = [];
    duetSocketEQ = io('/graphs-duet-eq');
    duetSocketEQ.on('new-graph-data-eq', function(graphData) {
    	
    	console.log("EQ socket.....");
        var  dLen = dataEQ.datasets[0].data.length;
        //console.log("dLen : "+dLen);
        for (var i = 0; i < graphData.length; i++) {
            var x = (( dLen + i) / 8192) * 48000;

            var g1 = {x: x, y:graphData[i]};
            //console.log("g1 : "+JSON.stringify(g1));
            dataEQ.datasets[0].data.push(g1);
        }

        eqChart.update();
    });
}

$( "#realtimeInputGainOn" ).click(function() {
    
    if(duetSocketGain.connected){
        return;
    }
    audioInputChart.reset();
    //audioOutputChart.reset();
    enableGainSocket();
});

$( "#realtimeInputGainOff" ).click(function() {
   
    if(!duetSocketGain.connected){
        return;
    }
    duetSocketGain.disconnect();
    //enable tooltips
    audioInputChart.options.tooltips.enabled = true;
    audioOutputChart.options.tooltips.enabled = false;
    audioModeChart.options.tooltips.enabled = false;
    erleChart.options.tooltips.enabled = false;
    dtdChart.options.tooltips.enabled = false; 
    
});

$( "#realtimeOutputGainOn" ).click(function() {
    
    if(duetSocketOutGain.connected){
        return;
    }
    audioOutputChart.reset();
    enableOutGainSocket();
});

$( "#realtimeOutputGainOff" ).click(function() {
   
    if(!duetSocketOutGain.connected){
        return;
    }
    duetSocketOutGain.disconnect();
    //enable tooltips
    audioInputChart.options.tooltips.enabled = false;
    audioOutputChart.options.tooltips.enabled = true;
    audioModeChart.options.tooltips.enabled = false;
    erleChart.options.tooltips.enabled = false;
    dtdChart.options.tooltips.enabled = false; 
    
});

//Audio mode
$( "#realtimeAudioModeOn" ).click(function() {
    
    
    if(duetSocketAudioMode.connected){
        return;
    }
    audioModeChart.reset();
    enableAudioModeSocket();
});

$( "#realtimeAudioModeOff" ).click(function() {

    if(!duetSocketAudioMode.connected){
        return;
    }
    duetSocketAudioMode.disconnect();
    //enable tooltips
    audioInputChart.options.tooltips.enabled = false;
    audioOutputChart.options.tooltips.enabled = false;
    audioModeChart.options.tooltips.enabled = true;
    erleChart.options.tooltips.enabled = false;
    dtdChart.options.tooltips.enabled = false;
});

//ERLE
$( "#realtimeERLEOn" ).click(function() {

    if(duetSocketErle.connected){
        return;
    }
    erleChart.reset();
    enableErleSocket();
});

$( "#realtimeERLEOff" ).click(function() {
   
    if(!duetSocketErle.connected){
        return;
    }
    duetSocketErle.disconnect();
    //enable tooltips
    audioInputChart.options.tooltips.enabled = false;
    audioOutputChart.options.tooltips.enabled = false;
    audioModeChart.options.tooltips.enabled = false;
    erleChart.options.tooltips.enabled = true;
    dtdChart.options.tooltips.enabled = false;
});

//DTD
$( "#realtimeDtdOn" ).click(function() {

    if(duetSocketDtd.connected){
        return;
    }
    dtdChart.reset();
    enableDtdSocket();
});

$( "#realtimeDtdOff" ).click(function() {
    if(!duetSocketDtd.connected){
        return;
    }
    duetSocketDtd.disconnect();
    //enable tooltips
    audioInputChart.options.tooltips.enabled = false;
    audioOutputChart.options.tooltips.enabled = false;
    audioModeChart.options.tooltips.enabled = false;
    erleChart.options.tooltips.enabled = false;
    dtdChart.options.tooltips.enabled = true;
});

$( "#eqButton" ).click(function() {
    duetSocketEQ.disconnect();
    enableEQSocket();
});

/*$('input[type=number]').focusout(function(){
    if(validate(this)){
        if($(this).attr('id').includes("filter")){
        	if(!duetSocketEQ.connected){
                return;
            }
            duetSocketEQ.disconnect();
            enableEQSocket();
        }
    }
});*/

$('input[type=radio][name=bandpass]').change(function() {
    duetSocketEQ.disconnect();
    enableEQSocket();
});

// By default enable this
enableGainSocket();
enableClipSocket();

//switching tabs causes the graphs to stop/start
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href") // activated tab
    switch(target){
        case '#tab_1':
        	current_tab=1;
            audioInputChart.reset();
            //audioOutputChart.reset();

            enableGainSocket();
            if (typeof duetSocketOutGain != 'undefined') duetSocketOutGain.disconnect();
            if (typeof duetSocketAudioMode != 'undefined') duetSocketAudioMode.disconnect();
            if (typeof duetSocketErle != 'undefined') duetSocketErle.disconnect();
            if (typeof duetSocketDtd != 'undefined') duetSocketDtd.disconnect();
            if (typeof duetSocketEQ != 'undefined') duetSocketEQ.disconnect();
            break;
        case '#tab_1_b':
        	current_tab=1;
            //audioInputChart.reset();
        	audioOutputChart.reset();

            enableOutGainSocket();
            if (typeof duetSocketGain != 'undefined')duetSocketGain.disconnect();
            if (typeof duetSocketAudioMode != 'undefined') duetSocketAudioMode.disconnect();
            if (typeof duetSocketErle != 'undefined') duetSocketErle.disconnect();
            if (typeof duetSocketDtd != 'undefined') duetSocketDtd.disconnect();
            if (typeof duetSocketEQ != 'undefined') duetSocketEQ.disconnect();
            break;
        case '#tab_2':
        	current_tab=2;
            audioModeChart.reset();

            enableAudioModeSocket();
            if (typeof duetSocketOutGain != 'undefined') duetSocketOutGain.disconnect();
            if (typeof duetSocketGain != 'undefined')duetSocketGain.disconnect();
            if (typeof duetSocketErle != 'undefined') duetSocketErle.disconnect();
            if (typeof duetSocketDtd != 'undefined') duetSocketDtd.disconnect();
            //if (typeof duetSocketClip != 'undefined') duetSocketClip.disconnect();
            if (typeof duetSocketEQ != 'undefined') duetSocketEQ.disconnect();
            break;
        case '#tab_3':
        	current_tab=3;
            erleChart.reset();

            enableErleSocket();
            if (typeof duetSocketOutGain != 'undefined') duetSocketOutGain.disconnect();
            if (typeof duetSocketAudioMode != 'undefined') duetSocketAudioMode.disconnect();
            if (typeof duetSocketGain != 'undefined') duetSocketGain.disconnect();
            if (typeof duetSocketDtd != 'undefined') duetSocketDtd.disconnect();
            //if (typeof duetSocketClip != 'undefined') duetSocketClip.disconnect();
            if (typeof duetSocketEQ != 'undefined') duetSocketEQ.disconnect();
            break;
        case '#tab_4':
        	current_tab=4;
            dtdChart.reset();

            enableDtdSocket();
            if (typeof duetSocketOutGain != 'undefined') duetSocketOutGain.disconnect();
            if (typeof duetSocketAudioMode != 'undefined') duetSocketAudioMode.disconnect();
            if (typeof duetSocketErle != 'undefined') duetSocketErle.disconnect();
            if (typeof duetSocketGain != 'undefined') duetSocketGain.disconnect();
            //if (typeof duetSocketClip != 'undefined') duetSocketClip.disconnect();
            if (typeof duetSocketEQ != 'undefined') duetSocketEQ.disconnect();

            break;
        case '#tab_5':
        	current_tab=5;
            enableEQSocket();
            if (typeof duetSocketOutGain != 'undefined') duetSocketOutGain.disconnect();
            if (typeof duetSocketDtd != 'undefined') duetSocketDtd.disconnect();
            if (typeof duetSocketAudioMode != 'undefined') duetSocketAudioMode.disconnect();
            if (typeof duetSocketErle != 'undefined') duetSocketErle.disconnect();
            if (typeof duetSocketGain != 'undefined') duetSocketGain.disconnect();
            //if (typeof duetSocketClip != 'undefined') duetSocketClip.disconnect();
            //if (typeof duetSocketEQ != 'undefined') duetSocketEQ.disconnect();
            break;
    }
});