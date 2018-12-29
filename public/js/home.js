$(document).ready(function(){
		$(".logContent").show();
		
		var getAppStatus = function() {
			$.ajax({ 
				url: "/getAppStatus",
				success: function(res){
				  if(res.app_status == "inactive"){
						showStartButton();
						stopLog();
						changeAppStatus("Stopped");
				  }else{
						changeAppStatus("Running");
						startLog();
						showStopButton();
				  }
	      },
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					changeAppStatus("Error " + errorThrown);
				}
			});
		}
		
		var changeAppStatus = function(status) {
			var statusElement = $("#app-avs").find(".status");
			statusElement.html(status);
		};
		
		var showStartButton = function() {
			var toggle = $("#app-avs").find('.toggle');
			toggle.val("start");
			toggle.find('.stop-button').hide();
			toggle.find('.start-button').show();
		}
		var showStopButton = function() {
			var toggle = $("#app-avs").find('.toggle');
			toggle.val("stop");
			toggle.find('.start-button').hide();
			toggle.find('.stop-button').show();
		}
		var enableToggle = function(enable) {
			var toggle = $("#app-avs").find('.toggle');
			if(enable) {
				toggle.find(".btn").removeClass('disabled');
			} else {
				toggle.find(".btn").addClass('disabled');
			}
		}
	
		$(".toggle").click(function(e){
			e.preventDefault();
			var req_url;
			enableToggle(false);
			var toggle = $(this);
			if(toggle.val() == "stop"){
				req_url = "/stopApp";
				changeAppStatus("Stopping...");
			}else{
				req_url = "/startApp";
				changeAppStatus("Starting...");
			}
			$.ajax({ 
				url: req_url,
				success: function(res){
					if(res.app_status ==  "started"){
						changeAppStatus("App is running.");
						showStopButton();
						enableToggle(true);
					}else{
						changeAppStatus("App is not running.");
						showStartButton();
						enableToggle(true);
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					console.log("Error " + errorThrown);
					enableToggle(true);
					if(req_url == "/stopApp"){
						changeAppStatus("App is running.");
					}else{
						changeAppStatus("App is not running.");
					}
				}
			});
		});
		
		var logInterval = {};
		$(".log-toggle").find('.stop-log').hide();
		
		$(".log-toggle").click(function(e) {
			e.preventDefault();
			var toggle = $(this);
			var startingLog = toggle.val() != 'stop';
			if(startingLog) {
				startLog();
			} else {
				stopLog();
			}
			toggle.val(startingLog ? 'stop' : 'start');
			toggle.find('.btn').hide();
			toggle.find('.' + (startingLog ? 'stop-log' : 'start-log')).show();
		});
		
		var getLogContent = function() {
			return $("#app-avs").find('.logContent');
		};
		
		updateScroll = function(){
		    var element = getLogContent().find("pre").get(0);
		    element.scrollTop = element.scrollHeight;
		};
		var startLog = function() {
			var logContent = getLogContent();
			if(socket['avs'] === 0) {
				socket['avs'] = io('/logs-avs');
				socket['avs'].on('log-update', function(logUpdate) {
					var logContentPre = logContent.find('pre');
					if(logContentPre[0].scrollHeight - logContentPre.scrollTop() > logContentPre.outerHeight()) {
						return;
					}
					logContent.show();
					logContent.find("pre").html(logUpdate);
					updateScroll();
				});
			}
		};
		var stopLog = function() {
			if(socket['avs'] !== 0) {
				socket['avs'].disconnect();
				socket['avs'] = 0;
			}
			
			getLogContent().hide();
		};
		var refreshLog = function() {
			if(socket['avs'] === 0) {
				return;
			}
			socket['avs'].emit('request-log-update');
		}
		$(".clear").click(function(e){
			e.preventDefault();
			$.ajax({ url: "/clearLog",
				success: function(res){
					var logContent = getLogContent();
					logContent.show();
					logContent.find('pre').html(res);
				}
			,
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("Error " + XMLHttpRequest.responseText);
			}
			});
		});
		
		var apps = $(".app-container").map(function(index, e) {
			return $(e).attr('value');
		}).get();
		socket = {};
		apps.forEach(function() {
			getAppStatus();
			socket['avs'] = 0;
			var logContentPre = getLogContent().find('pre');
			logContentPre.scroll(function() {
				if(logContentPre[0].scrollHeight - logContentPre.scrollTop() <= logContentPre.outerHeight()) {
					refreshLog();
				}
			});
		});
});