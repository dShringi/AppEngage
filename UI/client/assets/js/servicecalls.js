var BaseURL = "http://52.206.121.100/appengage/";
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
            url: BaseURL+"getUserValidated",
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
            url: BaseURL+"getUserNameValidated",
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
		    url: BaseURL+"registerUser",
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
	
	}
	
};