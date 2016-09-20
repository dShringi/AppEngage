$(document).ready(function () {

    $('.left-side').load("menu.html");
    $('.left-side').addClass('wdt80');

    $.get("header.html", function (data) {
        $(".main-container").prepend(data);
    });

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

    $('input[type=radio][name=immediate-type]').change(function () {
        if (this.value == 'now') {
            $(".date-time-block").slideUp();
        }
        else if (this.value == 'later') {
            $(".date-time-block").slideDown();
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
            }
            else {
                var selecteddate = moment($("#datepck").val()).format("YYYYMMDD");
                var selectedtime = ($("#clockpck").val()).substr(0, 2) + ($("#clockpck").val()).substr(3, 2);
                immediatedate = selecteddate + selectedtime;
            }
            carr.push(immediatedate);
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