var service = {
	
    validateLogin: function (uname, pwd) {
        console.log("service called");

        var loginJSONReq = {
            "username": uname,
            "password": pwd
        };
        console.log(loginJSONReq);
        $.ajax({
            type: 'GET',
            url: APIBaseURL + "getUserValidated",
            contentType: "application/json",
            dataType: "json",
            timeout: 180000,  //180 sec
            //data: JSON.stringify(loginJSONReq),
            data: "username="+uname+"&password="+pwd,
            success: function (data) {
                console.log(data);
                if (data.msg === "Success") {
                    sessionStorage.setItem("userName", data.name);
                    window.location.href = "index.html";
                }
                else {
                    alert("Login Failed");
                }

            },
            error: function (x, t, m) {
                alert("Error connecting to server");
                if (t === "timeout") {
                    alert("timeout");
                } else {
                    //alert(t);
                }
            }

        });
    },

    validateUname: function (uname) {
        console.log("val uname");
        $.ajax({
            type: 'GET',
            url: APIBaseURL + "getUserNameValidated",
            contentType: "application/json",
            dataType: "json",
            timeout: 180000,  //180 sec
            data: "username=" + uname,
            success: function (data) {
                sessionStorage.setItem("unameAvailability", data.msg);
                if ($("#reg-uname").val() === "") {
                    $("#uname-check").css("opacity", "0");
                }
                else if (data.msg === "Success") {
                    $("#uname-check i.fa").removeClass("fa-close").addClass("fa-check");
                    $("#uname-check").css("opacity", "1");
                    $("#uname-check").css("color", "#33cc33");
                    $("#uname-check #avail-message").html("&nbsp;&nbsp;This username is available");
                }
                else {
                    $("#uname-check i.fa").removeClass("fa-check").addClass("fa-close");
                    $("#uname-check").css("opacity", "1");
                    $("#uname-check").css("color", "#ff3300");
                    $("#uname-check #avail-message").html("&nbsp;&nbsp;This username is taken");
                }
            },
            error: function (x, t, m) {
                alert("Error connecting to server");
                if (t === "timeout") {
                    alert("timeout");
                } else {
                    //alert(t);
                }
            }
        });
    },
	
	registerUser: function(arr){
		console.log("service called");
		// Array order - First Name, Email Id, User Name, Last Name, Phone, Password, App Name, App Description, Timeout, App Category, App Icon, Timezone
		//					0			1			2			3		4		5		6				7			8			9			10		11

		var registerJSONReq = {
			"user": {
                    "fn": arr[0],
                    "ln": arr[3],
                    "email": arr[1],
                    "phone": arr[4],
                    "uname": arr[2],
                    "pass": arr[5]
            },
            "app": {
                    "name": arr[6],
                    "ctg": arr[9],
                    "desc": arr[7],
                    "icon": arr[10],
                    "tz": arr[11],
                    "to": arr[8]
            }
		}
		
		console.log(registerJSONReq);
		$.ajax({
		    type: 'POST',
		    url: APIBaseURL + "registerUser",
		    contentType: "application/json",
		    datatype: "json",
		    timeout: 180000,
		    data: JSON.stringify(registerJSONReq),
		    success: function (data) {
		        console.log(data);
		        $("#modalRegister").modal('hide');
		        swal({
		            title: 'Congratulations!',
		            text: '<p style="font-size:14px; padding-top: 30px;">You have successfully registered with us.</p>' +
                            '<p style="font-size:14px;">Your application key is -</p>' +
                            '<h3>'+data.akey+'</h3>',
		            html: true
		        });
            },
		    error: function (x, t, m) {
		        alert("Error connecting to server");
		        if (t === "timeout") {
		            alert("timeout");
		        } else {
		            //alert(t);
		        }
		    }

		});
	
	},

	makeCampaign: function (arr) {
	    console.log(arr);
	    // ["Name", "Title", "Message", "everyone", "immediately", trigger_time]
        //    0        1         2           3            4              5
	    if (arr[4] === "immediately") {
	        var makeCampaignJSONReq = {
	            "schdule_type": "Immediate",
	            "recursive": false,
	            "trigger_time": arr[5],
	            "name": arr[0],
	            "pn_title": arr[1],
	            "status": "active",
	            "date": new Date(),
	            "pn_msg": arr[2],
	            "query": {}
	        }
	    }
	    console.log(makeCampaignJSONReq);

	    $.ajax({
	        type: 'POST',
	        url: APIBaseURL + "createCampaign?akey="+appKey,
	        contentType: "application/json",
	        datatype: "json",
	        timeout: 180000,
	        data: JSON.stringify(makeCampaignJSONReq),
	        success: function (data) {
	            if (data.msg === "success") {
	                window.location.href = "messaging.html";
	            }

	        },
	        error: function (x, t, m) {
	            alert("Error connecting to server");
	            if (t === "timeout") {
	                alert("timeout");
	            } else {
	                //alert(t);
	            }
	        }
	    })
	},
	
	deleteCampaign:function(campaignid){
		$.ajax({
			type: 'DELETE',
			url: APIBaseURL + "deleteCampaign?akey="+appKey+"&campaignid="+campaignid,
			success: function (data) {
			    if (data.msg === "Success") {
			        swal("Deleted!", "Record has been deleted.", "success");
			        window.location.href = window.location.href;
			    }
				
			},
	        error: function (x, t, m) {
	            alert("Error connecting to server");
	            if (t === "timeout") {
	                alert("timeout");
	            } else {
	                //alert(t);
	            }
	        }
		})
	},

	changeCampaignStatus: function (currentStatus, campaignid, rowcounter) {
	    console.log(currentStatus);
	    if ($("tr#" + rowcounter + " ." + currentStatus).next().hasClass("status-inactive")) {
			console.log($("tr#" + rowcounter + " ." + currentStatus).next());
	        var status = "active";
			alert(status);
	    }
	    if ($("tr#" + rowcounter + " ." + currentStatus).prev().hasClass("status-active")) {
			console.log($("tr#" + rowcounter + " ." + currentStatus).prev());
	        var status = "inactive";
			alert(status);
	    }

	    var changeStatusJSONReq = {
	        "status": status
	    }
	    console.log(changeStatusJSONReq);

	    $.ajax({
	        type: 'PUT',
	        url: APIBaseURL + "updateCampaign?akey=" + appKey + "&campaignid=" + campaignid,
	        contentType: "application/json",
	        datatype: "json",
	        timeout: 180000,
	        data: JSON.stringify(changeStatusJSONReq),
	        success: function (data) {
	            console.log(data);
	            if (data.msg === "Success") {
	                if (status === "active") {
	                    console.log("active");
	                    $("tr#" + rowcounter + " ." + currentStatus).next().removeClass("status-inactive");
	                    $("tr#" + rowcounter + " ." + currentStatus).addClass("status-active");
	                    $("tr#" + rowcounter + " ." + currentStatus).next().addClass("status-none");
	                    $("tr#" + rowcounter + " .status-active").removeClass("status-none");
	                    $("tr#" + rowcounter + " .status-none").attr("onclick", "changeStatus('status-none','" + campaignid + "','" + rowcounter + "')");
						$("tr#" + rowcounter + " .status-active").attr("onclick", "changeStatus('status-active','" + campaignid + "','" + rowcounter + "')");
	                }
	                else if (status === "inactive") {
	                    console.log("inactive");
	                    $("tr#" + rowcounter + " ." + currentStatus).prev().removeClass("status-active");
	                    $("tr#" + rowcounter + " ." + currentStatus).addClass("status-inactive");
	                    $("tr#" + rowcounter + " ." + currentStatus).prev().addClass("status-none");
	                    $("tr#" + rowcounter + " .status-inactive").removeClass("status-none");
	                    $("tr#" + rowcounter + " .status-none").attr("onclick", "changeStatus('status-none','" + campaignid + "','" + rowcounter + "')");
						$("tr#" + rowcounter + " .status-active").attr("onclick", "changeStatus('status-active','" + campaignid + "','" + rowcounter + "')");
	                }
					
				}
	        },
	        error: function (x, t, m) {
	            alert("Error connecting to server");
	            if (t === "timeout") {
	                alert("timeout");
	            } else {
	                //alert(t);
	            }
	        }
	    })

	}
	
};