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

    $('input[type=radio][name=scheduling-type]').change(function () {
        if (this.value == 'immediately') {
            $(".scheduled-block").slideUp();
            $(".immediate-block").slideDown();
            //$(".date-time-block").slideDown();
            if ($('input[type=radio][name=immediate-type]:checked').val() == "later") {
                $(".date-time-block").slideDown();
            }
        }
        else if (this.value == 'scheduled') {
            $(".immediate-block").slideUp();
            $(".date-time-block").slideUp();
            $(".scheduled-block").slideDown();
        }
    });

    $('input[type=radio][name=immediate-type]').change(function () {
        if (this.value == 'now') {
            $(".date-time-block").slideUp();
        }
        else if (this.value == 'later') {
            $(".date-time-block").slideDown();
        }
    });

    if ($("select#send-type option:selected").val() == "daily") {
        $("span#on-day-text").hide();
        $("select#day-type").hide();
        $("select#day-number-type").hide();
    }

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
            var selectedtime = ($("#clockpck3").val()).substr(0, 2) + ($("#clockpck3").val()).substr(3, 2);
            var scheduleenddate = selecteddate + selectedtime;
            carr.push(scheduleenddate);

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

});

function nextToggle(sectionClass) {
    $(sectionClass).slideUp();
    $(sectionClass).parent().children().children().next().slideUp();
    //$(sectionClass).parent().parent().next().children().first().children().next().show();
    console.log($(sectionClass).parent().parent().next().children().first().children().next().next());
    $(sectionClass).parent().parent().next().children().first().children().first().children().next().slideDown();
    $(sectionClass).parent().parent().next().children().first().children().next().next().slideDown();
    $(sectionClass).parent().parent().children().next().children().addClass("edited");
    $(sectionClass).parent().parent().next().children().next().children().removeClass("edited");
    $(sectionClass).parent().parent().next().children() .next().children().hide();
    $(".edited").parent().children().fadeIn();
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