function fileToRegisters(){
    var registers = ["txgainPassThrough", "micSpacing", "lineIn", "speakerOut", "micInput", "lineOut", "txMin",
    "aecReference", "dtdThreshold", "micBulkDelay"];

    for(var i=0; i < registers.length; i++){
        var element = "#" + registers[i];
        $.ajax({ url: "/setRegister?register=" +  $(element).attr('id') + "&val=" + $(element).val(),
            success: function(res){
                console.log("Success: " + res);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("Error " + XMLHttpRequest.responseText);
            }
        });
    }

    setEQ();

    $.ajax({ url: "/setMicSource?val=" + jQuery("input[name='micSource']:checked").val(),
        success: function(res){
            console.log("Success: " + res);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("Error " + XMLHttpRequest.responseText);
        }
    });

    var isSoundClearEnabled = $('#soundclearEnable').is(':checked');
	var soundVal=isSoundClearEnabled?1:2;
	 $.ajax({ url: "/setRegister?register=appprocmod&val="+soundVal,
         success: function(res){
             console.log("Success: " + res);
         },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
             console.log("Error " + XMLHttpRequest.responseText);
         }
     });
}

$(function(){
    var fileInput1 = document.getElementById('fileInput');
    
    fileInput1.addEventListener('change',function(e){
    	
    	var formData = new FormData();
        var file = document.getElementById('fileInput').files[0];
        
    	if (file === undefined || file === null) {
            console.log("file name is null");
            return;
        }
    	$("#file-upload-modal").modal();
    	$("#openConfigurationButton").val("Processing...");
    	$("#openConfigurationButton").attr('disabled','disabled');
    	$("#saveConfigurationButton").attr('disabled','disabled');
    	
    	var registers = ["txgainPassThrough", "micSpacing", "lineIn", "speakerOut", "micInput", "lineOut", "txMin",
    	    "aecReference", "dtdThreshold", "micBulkDelay"];
    	
    	var eqs = ["filterGain1", "filterGain2", "filterGain3", "filterGain4", "filterGain5", "filterCutoff1", "filterCutoff2",
    	    "filterCutoff3", "filterCutoff4", "filterCutoff5" , "filterBandwidthM1", "filterBandwidthM2",
    	    "filterBandwidthM3", "filterBandwidthM4", "filterBandwidthM5"];
    	   	
        formData.append('myFile', file);
        var xhr = new XMLHttpRequest();
        document.getElementById("openConfigurationButton").innnerHTML="Processing...";
        xhr.onreadystatechange = function() {
        	console.log("response : "+this.status);
            if (this.readyState == 4 && this.status == 200) {
            	var ajaxResponse =JSON.parse(this.responseText);
            	
            	var duetConfig=ajaxResponse['duetConfig'];
            	var eqRegisters=ajaxResponse['eqRegisters'];
            	var micSource=ajaxResponse['micSource'];
            	//console.log("duetConfig: "+JSON.stringify(duetConfig));
            	//console.log("eqRegisters: "+JSON.stringify(eqRegisters));
            	//console.log("micSource: "+JSON.stringify(micSource));
            	
            	//For Registers...
            	for(var rL in registers){
            		var rname=registers[rL];
            		 $("#"+rname).val(duetConfig[rname]);
            	}
            	//For eqs...            	
            	for(var rL in eqs){
            		var rname=eqs[rL];
            		 $("#"+rname).val(eqRegisters[rname]);
            	}
            	
            	
            	//radio button
            	if(micSource == "0"){
                    $("#micSourceInternal").prop('checked', true);
                }else{
                	$("#micSourceExternal").prop('checked', true);     
                }
            	console.log("appprocmod: "+duetConfig['appprocmod']);   
            	// check box
        		if(duetConfig['appprocmod']==1){
                    $("#soundclearEnable").prop("checked","checked");
                    $("#txgainPassThrough").attr("disabled", "disabled");
                    $("#txgainPassThroughButton").attr("disabled", "disabled");

                    $("#micSpacing").removeAttr("disabled");
                    $("#lineIn").removeAttr("disabled");
                    $("#speakerOut").removeAttr("disabled");
                    $("#micInput").removeAttr("disabled");
                    $("#lineOut").removeAttr("disabled");
                    $("#txMin").removeAttr("disabled");
                    $("#aecReference").removeAttr("disabled");
                    $("#dtdThreshold").removeAttr("disabled");
                    $("#micBulkDelay").removeAttr("disabled");
                    $("#micSpacingButton").removeAttr("disabled");
                    $("#lineInButton").removeAttr("disabled");
                    $("#micInputButton").removeAttr("disabled");
                    $("#lineOutButton").removeAttr("disabled");
                    $("#txMinButton").removeAttr("disabled");
                    $("#aecReferenceButton").removeAttr("disabled");
                    $("#dtdThresholdButton").removeAttr("disabled");
                    $("#micBulkDelayButton").removeAttr("disabled");
                    //show by default the first tab
                    $('.nav-tabs a[href="#tab_1"]').tab('show');
                    
                }else{
                    $("#soundclearEnable").removeAttr('checked',"");
                    
                    $("#txgainPassThrough").removeAttr("disabled");
                    $("#txgainPassThroughButton").removeAttr("disabled");
                    $("#micSpacing").attr("disabled", "disabled");
                    $("#lineIn").attr("disabled", "disabled");
                    $("#speakerOut").attr("disabled", "disabled");
                    $("#micInput").attr("disabled", "disabled");
                    $("#lineOut").attr("disabled", "disabled");
                    $("#txMin").attr("disabled", "disabled");
                    $("#aecReference").attr("disabled", "disabled");
                    $("#dtdThreshold").attr("disabled", "disabled");
                    $("#micBulkDelay").attr("disabled", "disabled");
                    $("#micSpacingButton").attr("disabled", "disabled");
                    $("#lineInButton").attr("disabled", "disabled");
                    $("#micInputButton").attr("disabled", "disabled");
                    $("#lineOutButton").attr("disabled", "disabled");
                    $("#txMinButton").attr("disabled", "disabled");
                    $("#aecReferenceButton").attr("disabled", "disabled");
                    $("#dtdThresholdButton").attr("disabled", "disabled");
                    $("#micBulkDelayButton").attr("disabled", "disabled");
                    //disable some of the graphs as well
                    var enableInputGain = true;
                    var enableOutputGain = false;
                    var enableAudioMode = false;
                    var enableDTD = false;
                    var enableERLE = false;
                   
                }
               	
        		$("#openConfigurationButton").removeAttr('disabled');
        		$("#saveConfigurationButton").removeAttr('disabled');
        		$("#openConfigurationButton").val("Open Configuration");
        		
        		$("#file-upload-modal").modal("hide")
        		
            	
            }
        };
        xhr.open('post', '/uploadFile', true);
        xhr.send(formData);
    });

    // This will act when the submit LINK is clicked
    $("#saveConfigurationButton").click(function(event){
        event.preventDefault();
        console.log("file downloading....");
        var newForm = jQuery('<form>', {
            'action': '/downloadFile',
            'method': 'GET'
        });
        $('body').append(newForm);
        newForm.submit();
        //Audio levels
        dataInput.datasets[0].data = [];
        dataInput.datasets[1].data = [];
        dataInput.datasets[2].data = [];

        dataOutput.datasets[0].data = [];
        dataOutput.datasets[1].data = [];
        
        // audio mode
        dataAudioMode.datasets[0].data = [];
        
        //ERLE
        dataERLE.datasets[0].data = [];
        dataERLE.datasets[1].data = [];
        
        //DTD
        dataDTD.datasets[0].data = [];
        dataDTD.datasets[1].data = [];
        
        //EQ
        dataEQ.datasets[0].data = [];
        
        
        return false;
     });

    $("#openConfigurationButton").click(function(event) {
        event.preventDefault();
        document.getElementById('fileInput').click();
    });
});

$('input[type="checkbox"]').on('click change', function(e) {
    if(soundclearEnable.checked == true){
        //Enable all of the fields, but disable TX gain
        $("#txgainPassThrough").attr("disabled", "disabled");
        $("#txgainPassThroughButton").attr("disabled", "disabled");

        $("#micSpacing").removeAttr("disabled");
        $("#lineIn").removeAttr("disabled");
        $("#micInput").removeAttr("disabled");
        $("#lineOut").removeAttr("disabled");
        $("#speakerOut").removeAttr("disabled");
        $("#txMin").removeAttr("disabled");
        $("#aecReference").removeAttr("disabled");
        $("#dtdThreshold").removeAttr("disabled");
        $("#micBulkDelay").removeAttr("disabled");
        $("#micSpacingButton").removeAttr("disabled");
        $("#lineInButton").removeAttr("disabled");
        $("#micInputButton").removeAttr("disabled");
        $("#lineOutButton").removeAttr("disabled");
        $("#txMinButton").removeAttr("disabled");
        $("#aecReferenceButton").removeAttr("disabled");
        $("#dtdThresholdButton").removeAttr("disabled");
        $("#micBulkDelayButton").removeAttr("disabled");
        //show by default the first tab
        $('.nav-tabs a[href="#tab_1"]').tab('show');

    }else{
        //disable soundclear
        $("#txgainPassThrough").removeAttr("disabled");
        $("#txgainPassThroughButton").removeAttr("disabled");
        $("#micSpacing").attr("disabled", "disabled");
        $("#lineIn").attr("disabled", "disabled");
        $("#speakerOut").attr("disabled", "disabled");
        $("#micInput").attr("disabled", "disabled");
        $("#lineOut").attr("disabled", "disabled");
        $("#txMin").attr("disabled", "disabled");
        $("#aecReference").attr("disabled", "disabled");
        $("#dtdThreshold").attr("disabled", "disabled");
        $("#micBulkDelay").attr("disabled", "disabled");
        $("#micSpacingButton").attr("disabled", "disabled");
        $("#lineInButton").attr("disabled", "disabled");
        $("#micInputButton").attr("disabled", "disabled");
        $("#lineOutButton").attr("disabled", "disabled");
        $("#txMinButton").attr("disabled", "disabled");
        $("#aecReferenceButton").attr("disabled", "disabled");
        $("#dtdThresholdButton").attr("disabled", "disabled");
        $("#micBulkDelayButton").attr("disabled", "disabled");
        //disable some of the graphs as well
        var enableInputGain = true;
        var enableOutputGain = false;
        var enableAudioMode = false;
        var enableDTD = false;
        var enableERLE = false;
    }
});
