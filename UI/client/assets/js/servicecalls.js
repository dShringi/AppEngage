var service = {
	
    validateLogin: function (uname, pwd) {
        console.log("service called");

        //var loginJSONReq = {
        //    "username": uname,
        //    "password": pwd
        //};
        //console.log(loginJSONReq);
        $.ajax({
            type: 'GET',
            url: "http://52.206.121.100/appengage/getUserValidated",
            contentType: "application/json",
            dataType: "json",
            timeout: 180000,  //180 sec
            //data: JSON.stringify(loginJSONReq),
            data: "username="+uname+"&password="+pwd,
            success: function (data) {
                console.log(data);
                if (data.msg === "Success") {
                    var name = data.name;
                    function sessionSet(name) {
                        sessionStorage.setItem("userName", name);
                    }
                    
                    window.location.href = "index.html";
                }
                else {
                    alert("Login Failed");
                }

            },
            error: function () {
                alert("Error");
            }

        });
    },
	
	registerUser: function(arr){
		console.log("service called");
		// Array order - First Name, Email Id, User Name, Last Name, Phone, Password, App Name, App Description, Timeout, App Category, App Icon, Timezone
		//					0			1			2			3		4		5		6				7			8			9			10		11
		console.log(arr[0]);
		console.log(arr[1]);
		console.log(arr[2]);
		console.log(arr[3]);
		console.log(arr[4]);
		console.log(arr[5]);
		console.log(arr[6]);
		console.log(arr[7]);
		console.log(arr[8]);
		console.log(arr[9]);
		console.log(arr[10]);
		console.log(arr[11]);
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
	
	}
	
};