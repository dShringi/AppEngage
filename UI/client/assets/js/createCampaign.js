var ddArr = [];

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
    $("div.new-audience").hide();
    $("select#dropdown-mnu").show();
    $("select#dropdown-model").hide();
    $("select#dropdown-appversion").hide();
    $("select#dropdown-platform").hide();
    $("select#dropdown-dt").hide();
    $("select#dropdown-os").hide();

    $('input[type=radio][name=audience-type]').change(function () {
        if (this.value === 'new') {
            $("div.new-audience").show();
            if (!$.trim($("div.new-audience").html())) {
                $("div.new-audience").append("<div id='new-audi-row1'></div>")
                $("div.new-audience #new-audi-row1").append("<span>Devices having</span>\
                                            <select class='form-control dropdown-audience' onchange='addSubFilter(this)'>\
                                                <option value='mnu'>Manufacturer</option>\
                                                <option value='model'>Model</option>\
                                                <option value='appversion'>Application Version</option>\
                                                <option value='platform'>Platform</option>\
                                                <option value='dt'>Device Type</option>\
                                                <option value='os'>OS</option>\
                                            </select>");
                $("div.new-audience #new-audi-row1").append("<div class='hidden-field' style='display: none'>mnu</div>");
                $("div.new-audience #new-audi-row1").append("<select class='audience-sub-dropdown form-control' id='dropdown-mnu' multiple size='1' style='opacity:0'></select>");
                //$("div.new-audience #new-audi-row1 select.audience-sub-dropdown").select2();
                $("div.new-audience #new-audi-row1").append("<i class='fa fa-plus-square' onclick='addAudienceFilter(this)' aria-hidden='true'></i>")
                service.populateFilters("mnu");
            }
        }
        else if (this.value === 'everyone') {
            $("div.new-audience").hide();
        }

        // height of side-line
        $("div.audience-row .side-line .div2").css("line-height", $("div.audience-row .section-audience .col-md-11").height() + 20);
                

    });

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
        var caudiencetype = $("input[name='audience-type']:checked").val()
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

        if (caudiencetype === "everyone") {
            var audienceQuery = {};
            carr.push(audienceQuery);
        }
        else if (caudiencetype === "new") {
            var audienceQuery = {}
            var newCount = $(".new-audience").children().length;
            for (i = 1; i <= newCount; i++) {
                var keyAQ = $(".new-audience #new-audi-row" + i + " div.hidden-field").text();
                var valAQ = $(".new-audience #new-audi-row" + i + " .ms-choice span").text();

                finalArr = valAQ.split(", ");
                console.log(finalArr);

                audienceQuery[keyAQ] = finalArr;
                
            }
            console.log(audienceQuery);
            carr.push(audienceQuery);
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


function addAudienceFilter(currdiv) {

    ddArr = [];
    $(currdiv).parent().siblings().each(function(){
        //$(currdiv).parent().siblings().children().first().next().each(function () {
        //if ($(this).hasClass("select.dropdown-audience")) {
        //    alert("hi");
            console.log($(this).children().next().next().first().text());
            if ($(this).children().next().next().first().text() != null || $(this).children().next().next().first().text() != "") {
                //console.log($(this).val());
                //ddArr.push($(this).val());
                console.log($(this).children().next().next().first().text());
                ddArr.push($(this).children().next().next().first().text());
            }
       //}
        
    })
    //console.log($(currdiv).parent().siblings().children().next().val());
    console.log($(currdiv).parent().children().next().val());
    ddArr.push($(currdiv).parent().children().next().val());
    console.log(ddArr);
    console.log($(currdiv).parent().parent().children().length);
    var cntfilter = $(currdiv).parent().parent().children().length + 1;

    $("div.new-audience").append("<div id='new-audi-row"+cntfilter+"'></div>")
    $("div.new-audience #new-audi-row"+cntfilter).append("<span>Devices having</span>\
                                            <select class='form-control dropdown-audience' onchange='addSubFilter(this)'>\
                                                <option value='mnu'>Manufacturer</option>\
                                                <option value='model'>Model</option>\
                                                <option value='appversion'>Application Version</option>\
                                                <option value='platform'>Platform</option>\
                                                <option value='dt'>Device Type</option>\
                                                <option value='os'>OS</option>\
                                            </select>");
    $("div.new-audience #new-audi-row" + cntfilter).append("<i class='fa fa-trash-o pull-right' onclick='removeFilter(this)'  aria-hidden='true'></i>");
    $(currdiv).parent().children().attr("disabled", "disabled");
    $(currdiv).parent().children().children().attr("disabled", "disabled");
    $(currdiv).parent().children().nextAll(".hidden-field").removeAttr("disabled");
    //$(curr).parent().prev().remove(".fa-trash-o");
    $(currdiv).prevAll("i.fa.fa-trash-o.pull-right").remove();
    $(currdiv).remove();
    $("div.new-audience #new-audi-row" + cntfilter + " select.dropdown-audience > option").each(function () {
        //console.log($(this).val());
        if ($.inArray($(this).val(), ddArr) != -1) {
            //console.log($(this).val());
            $(this).attr("disabled", "disabled");
        }
    })

    // height of side-line
    $("div.audience-row .side-line .div2").css("height", $("div.audience-row .section-audience .col-md-11").height() + 20);

    if ($("div.new-audience #new-audi-row" + cntfilter + " select.dropdown-audience").val() === "mnu") {
        $("div.new-audience #new-audi-row" + cntfilter).append("<div class='hidden-field' style='display: none'>mnu</div>");
        $("div.new-audience #new-audi-row" + cntfilter).append("<select class='audience-sub-dropdown form-control' id='dropdown-mnu' multiple size='1' style='opacity:0'></select>");
        service.populateFilters("mnu");
        $("div.new-audience #new-audi-row" + cntfilter).append("<i class='fa fa-plus-square' onclick='addAudienceFilter(this)' aria-hidden='true'></i>");
    }
    
}

function addSubFilter(curr) {
    if ($(curr).parent().children().hasClass("audience-sub-dropdown")) {
        $(curr).nextAll(".audience-sub-dropdown").remove();
        $(curr).nextAll(".fa-plus-square").remove();
    }
    if ($(curr).parent().children().hasClass("hidden-field")) {
        $(curr).nextAll(".hidden-field").remove();
    }
    switch ($(curr).val()) {
        case "mnu":
            $(curr).parent().append("<div class='hidden-field' style='display: none'>mnu</div>");
            $(curr).parent().append("<select class='audience-sub-dropdown form-control' id='dropdown-mnu' multiple size='1' style='opacity:0'></select>");                                    
            break;                                               
        case "model":
            $(curr).parent().append("<div class='hidden-field' style='display: none'>model</div>");
            $(curr).parent().append("<select class='audience-sub-dropdown form-control' id='dropdown-model' multiple size='1' style='opacity:0'></select>");
            break;                                               
        case "appversion":
            $(curr).parent().append("<div class='hidden-field' style='display: none'>appversion</div>");
            $(curr).parent().append("<select class='audience-sub-dropdown form-control' id='dropdown-appversion' multiple size='1' style='opacity:0'></select>");
            break;                                               
        case "platform":
            $(curr).parent().append("<div class='hidden-field' style='display: none'>platform</div>"); 
            $(curr).parent().append("<select class='audience-sub-dropdown form-control' id='dropdown-platform' multiple size='1' style='opacity:0'></select>");
            break;                                               
        case "dt":
            $(curr).parent().append("<div class='hidden-field' style='display: none'>dt</div>");
            $(curr).parent().append("<select class='audience-sub-dropdown form-control' id='dropdown-dt' multiple size='1' style='opacity:0'></select>");
            break;                                               
        case "os":
            $(curr).parent().append("<div class='hidden-field' style='display: none'>os</div>");
            $(curr).parent().append("<select class='audience-sub-dropdown form-control' id='dropdown-os' multiple size='1' style='opacity:0'></select>");
            break;
        default:
            break;
    }
    service.populateFilters($(curr).val());
    //$("select.audience-sub-dropdown").select2();
    $(curr).parent().append("<i class='fa fa-plus-square' onclick='addAudienceFilter(this)' aria-hidden='true'></i>");
    
}

// remove filter
function removeFilter(curr) {
    ddArr.pop();
    console.log(ddArr);
    //re-enable the prev div
    $(curr).parent().prev().children().removeAttr("disabled");
    $(curr).parent().prev().children().children().removeAttr("disabled");

    // re-disable the already selected values of dropdown
    $(curr).parent().prev().children().next().first().children().each(function () {
        //console.log($(this).val());
        if ($.inArray($(this).val(), ddArr) != -1) {
            //console.log($(this).val());
            $(this).attr("disabled", "disabled");
        }
    })

    //check if its first filter row; if it is then dont append trash can
    if (!$(curr).parent().prev().is("#new-audi-row1")) {
        $(curr).parent().prev().append("<i class='fa fa-trash-o pull-right' onclick='removeFilter(this)' aria-hidden='true'></i>");
    }
    //append add filter sign
    $(curr).parent().prev().append("<i class='fa fa-plus-square' onclick='addAudienceFilter(this)' aria-hidden='true'></i>");

    //remove this entire div
    $(curr).parent().remove();

    // height of side-line
    $("div.audience-row .side-line .div2").css("height", $("div.audience-row .section-audience .col-md-11").height() + 20);
}

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

function showSelected(abc, event) {
    if ($(abc).children().first().html() != "") {
        $("body").append("<div class='tooltipee'></div>");
        $("div.tooltipee").css("left", event.pageX + 15);
        $("div.tooltipee").css("top", event.pageY - 35);
        $("div.tooltipee").html($(abc).children().first().html());
    }
    else {
        return;
    }
    
}

function removeTooltip(abc) {
    $("div.tooltipee").remove();
}