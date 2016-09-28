$(document).ready(function () {

    $('.left-side').load("menu.html");
    $('.left-side').addClass('wdt80');

    $.get("header.html", function (data) {
        $(".main-container").prepend(data);
    });

    for (i = 1; i < 31;i++){
        $("select#day-number-type").append("<option value='"+i+"'>" + i + "</option>");
    }
    

    $("div.section-creative").css("display", "none");
    $("div.section-audience").css("display", "none");
    $("div.section-scheduling").css("display", "none");
    $("div.section-confirm").css("display", "none");
    $("div.campaign-editor .side-line .div2").css("display", "none");
    $("div.campaign-editor .campaign-row .side-line .div2").css("display", "block");
    $(".campaign-edit").hide();
    $(".creative-edit").hide();
    $(".audience-edit").hide();
    $(".scheduling-edit").hide();
    $(".scheduled-block").hide();
    $("select#dropdown-mnu").show();
    $("select#dropdown-model").hide();
    $("select#dropdown-appv").hide();
    $("select#dropdown-platform").hide();
    $("select#dropdown-devtype").hide();
    $("select#dropdown-osv").hide();

    service.populateMnu();

    $('input[type=radio][name=scheduling-type]').change(function () {
        if (this.value == 'immediately') {
            $(".scheduled-block").slideUp();
            $(".immediate-block").slideDown();
            //$(".date-time-block").slideDown();
            if ($('input[type=radio][name=immediate-type]:checked').val() == "later") {
                $(".scheduling-row .side-line .div2").css("height", "229px");
                $(".date-time-block").slideDown();
            }
            else if ($('input[type=radio][name=immediate-type]:checked').val() == "now") {
                $(".scheduling-row .side-line .div2").css("height", "170px");
            }
        }
        else if (this.value == 'scheduled') {
            $(".immediate-block").slideUp();
            $(".date-time-block").slideUp();
            $(".scheduled-block").slideDown();
            if ($("select#send-type").val() === "daily" || $("select#send-type").val() === "alternate") {
                $(".scheduling-row .side-line .div2").css("height", "237px");
            }
            else if ($("select#send-type").val() === "weekly" || $("select#send-type").val() === "monthly") {
                $(".scheduling-row .side-line .div2").css("height", "291px");
            }
        }
    });

    $('input[type=radio][name=immediate-type]').change(function () {
        if (this.value == 'now') {
            $(".date-time-block").slideUp();
            $(".scheduling-row .side-line .div2").css("height", "170px");
        }
        else if (this.value == 'later') {
            $(".date-time-block").slideDown();
            $(".scheduling-row .side-line .div2").css("height", "229px");
        }
    });

    if ($("select#send-type option:selected").val() == "daily") {
        $("span#on-day-text").hide();
        $("select#day-type").hide();
        $("select#day-number-type").hide();
    }

    $("select.dropdown-audience").change(function () {
        $("select.audience-sub-dropdown").hide();
        switch ($(this).val()) {
            case "mnu":
                $("select#dropdown-mnu").show();
                break;
            case "model":
                $("select#dropdown-model").show();
                break;
            case "appv":
                $("select#dropdown-appv").show();
                break;
            case "platform":
                $("select#dropdown-platform").show();
                break;
            case "devtype":
                $("select#dropdown-devtype").show();
                break;
            case "osv":
                $("select#dropdown-osv").show();
                break;
            default:
                break;
        }
    });

    $("select#send-type").change(function () {
        switch ($(this).val()) {
            case "daily":
                $("span#on-day-text").hide();
                $("select#day-type").hide();
                $("select#day-number-type").hide();
                $(".schedule-time-block").css("display", "inline-block");
                $(".schedule-time-block").css("padding-top", "0px");
                break;
            case "alternate":
                $("span#on-day-text").hide();
                $("select#day-type").hide();
                $("select#day-number-type").hide();
                $(".schedule-time-block").css("display", "inline-block");
                $(".schedule-time-block").css("padding-top", "0px");
                break;
            case "weekly":
                $("span#on-day-text").show();
                $("select#day-type").show();
                $("select#day-number-type").hide();
                $(".schedule-time-block").css("display", "block");
                $(".schedule-time-block").css("padding-top", "20px");
                break;
            case "monthly":
                $("span#on-day-text").show();
                $("select#day-type").hide();
                $("select#day-number-type").show();
                $(".schedule-time-block").css("display", "block");
                $(".schedule-time-block").css("display", "block");
                $(".schedule-time-block").css("padding-top", "20px");
                break;
            default:
                break;
        }

    });

    

    $("#btn-confirm").click(function () {
        var carr = [];
        var cname = $("#campaign-name").val();
        var ctitle = $("#campaign-title").val();
        var cmsg = $("#campaign-msg").val();
        var caudience = $("input[name='audience-type']:checked").val();
        var cscheduletype = $("input[name='scheduling-type']:checked").val();
        //alert(cname + ctitle + cmsg + caudience + cscheduletype);
        carr.push(cname, ctitle, cmsg, caudience, cscheduletype);

        if (cscheduletype === "immediately") {
            var cimmediatetype = $("input[name='immediate-type']:checked").val();
            var immediatedate;
            if (cimmediatetype === "now") {
                immediatedate = moment(new Date()).format("YYYYMMDDHHmm");
                carr.push("now");
            }
            else {
                var selecteddate = moment($("#datepck").val()).format("YYYYMMDD");
                var selectedtime = ($("#clockpck").val()).substr(0, 2) + ($("#clockpck").val()).substr(3, 2);
                immediatedate = selecteddate + selectedtime;
                carr.push("later");
            }
            carr.push(immediatedate);
        }
        
        if (cscheduletype === "scheduled") {
            var csendtype = $("select#send-type").val();
            carr.push(csendtype);

            var cscheduletime = moment(new Date()).format("YYYYMMDD") + ($("#clockpck2").val()).substr(0, 2) + ($("#clockpck2").val()).substr(3, 2);
            carr.push(cscheduletime);

            var selecteddate = moment($("#datepck2").val()).format("YYYYMMDD");
            //var scheduleenddate = selecteddate + "0000";
            carr.push(selecteddate);

            if (csendtype === "weekly") {
                var cweekday = "WEEKLY_" + $("select#day-type").val();
                carr.push(cweekday);

            }
            else if (csendtype === "monthly") {
                var cweekdaynumber = "MONTHLY_" + $("select#day-number-type").val();
                carr.push(cweekdaynumber);

            }
            //console.log(carr);
        }

        service.makeCampaign(carr);

    });

    $(".next-scheduling").click(function () {
        $(".section-confirm .text-creative").html($(".section-creative #campaign-title").val());

        switch ($("input[name=audience-type]:checked").val()) {
            case "everyone":
                $(".section-confirm .text-audience").html("Everyone will see your message.");
                break;
            case "saved":
                break;
            case "new":
                break;
            default:
                break;

        }
        switch($("input[name=scheduling-type]:checked").val()){
            case "immediately":
                if ($("input[name=immediate-type]:checked").val() === "now") {
                    $(".section-confirm .text-scheduling").html("Campaign is scheduled to send only once after you click confirm.");
                }
                else {
                    $(".section-confirm .text-scheduling").html("Campaign is scheduled to send once on " + $("#datepck").val() + " at " + $("#clockpck").val() + " hrs.");
                }
                break;
            case "scheduled":
                var msg;
                switch ($("select#send-type").val()) {
                    case "daily":
                        msg = "Campaign is scheduled to send daily until " + $("#datepck2").val();
                        break;
                    case "alternate":
                        msg = "Campaign is scheduled to send on alternate days until " + $("#datepck2").val();
                        break;
                    case "weekly":
                        msg = "Campaign is scheduled to send on " + $("#day-type").val().toUpperCase() + " of every week at " + $("#clockpck2").val() + " hrs until " + $("#datepck2").val();
                        break;
                    case "monthly":
                        msg = "Campaign is scheduled to send on day " + $("#day-number-type").val() + " of every month at " + $("#clockpck2").val() + " hrs until " + $("#datepck2").val();
                        break;
                    default:
                        break;
                }
                $(".section-confirm .text-scheduling").html(msg);
                break;
            default:
                break;
        }
        
    });

    $("input#campaign-title").keyup(function () {
        $("div.phone-title").html($("input#campaign-title").val());
    });

    $("textarea#campaign-msg").keyup(function () {
        $("div.phone-msg").html($("textarea#campaign-msg").val());
    });

});

function nextToggle(sectionClass, buttn) {
    var nxt = false;
    

    if ($(buttn).hasClass("next-campaign")) {
        if ($("#campaign-name").val() === "") {
            swal({title:"All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
        }
        else {
            nxt = true;
        }
    }
    if ($(buttn).hasClass("next-creative")) {
        if ($("#campaign-title").val() === "" || $("#campaign-msg").val() === "") {
            swal({ title: "All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
        }
        else{
            nxt = true;
        }
    }
    if ($(buttn).hasClass("next-audience")) {
        
            nxt = true;
    }
    if ($(buttn).hasClass("next-scheduling")) {
        
        if ($("input[name=scheduling-type]:checked").val() === "immediately" && $("input[name=immediate-type]:checked").val() === "now") {
            nxt = true;
        }
        else if ($("input[name=scheduling-type]:checked").val() === "immediately" && $("input[name=immediate-type]:checked").val() === "later") {
            if ($("#datepck").val() === "" || $("#clockpck").val() === "") {
                swal({ title: "All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
            }
            else {
                nxt = true;
            }
        }
        else if ($("input[name=scheduling-type]:checked").val() === "scheduled" && $("#datepck2").val() != "") {
            if ($("select#send-type").val() === "daily" || $("select#send-type").val() === "alternate") {
                if ($("#clockpck2").val() === "") {
                    swal({ title: "All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
                }
                else {
                    nxt = true;
                }
            }
            else if($("select#send-type").val() === "weekly"){
                if ($("#clockpck2").val() === "" || $("select#day-type").val === "") {
                    swal({ title: "All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
                }
                else {
                    nxt = true;
                }
            }
            else if ($("select#send-type").val() === "monthly") {
                if ($("#clockpck2").val() === "" || $("select#day-number-type").val === "") {
                    swal({ title: "All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
                }
                else {
                    nxt = true;
                }
            }
        }
        else {
            swal({ title: "All fields mandatory", type: "warning", text: "Please fill all details to proceed." });
        }
    }

    if (nxt === true) {
        $(sectionClass).slideUp();
        $(sectionClass).parent().children().children().next().slideUp();
        //$(sectionClass).parent().parent().next().children().first().children().next().show();
        console.log($(sectionClass).parent().parent().next().children().first().children().next().next());
        $(sectionClass).parent().parent().next().children().first().children().first().children().next().slideDown();
        $(sectionClass).parent().parent().next().children().first().children().next().next().slideDown();
        $(sectionClass).parent().parent().children().next().children().addClass("edited");
        $(sectionClass).parent().parent().next().children().next().children().removeClass("edited");
        $(sectionClass).parent().parent().next().children().next().children().hide();
        $(".edited").parent().children().fadeIn();
    }

}

function editToggle(thisClass) {
    if ($(thisClass).hasClass("campaign-edit")) {
        $(".section-campaign").slideDown();
        //console.log($(thisClass).parent().parent().siblings().children().children().next().children());
        //console.log($(".section-campaign").parent().parent().siblings().children().next().children());
    }
    if ($(thisClass).hasClass("creative-edit")) {
        $(".section-creative").slideDown();
    }
    if ($(thisClass).hasClass("audience-edit")) {
        $(".section-audience").slideDown();
    }
    if ($(thisClass).hasClass("scheduling-edit")) {
        $(".section-scheduling").slideDown();
        
    }
    //console.log($(thisClass).parent().parent().children().first().children().children().next());
    //$(thisClass).parent().parent().siblings().children().children().first().children().next().slideUp();
    $(".side-line .div2").slideUp();
    $(thisClass).parent().parent().children().first().children().children().next().slideDown();
    $(thisClass).parent().children().fadeOut();
    $(thisClass).removeClass("edited");
    $(thisClass).parent().parent().siblings().children().children().next().next().slideUp();
    console.log($(thisClass).parent().parent().siblings().children().next().children());
    $(thisClass).parent().parent().siblings().children().next().children().fadeIn();
    
}