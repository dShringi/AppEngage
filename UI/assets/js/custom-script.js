$(document).ready(function () {
    "use strict";
    $('.left-side').load("menu.html");
	
	$.get("header.html", function (data) {
		$(".main-container").prepend(data);
	});
    
    var displayDate = function (date) {
        var today = new Date(), month, day, year;
        year = today.getFullYear();
        month = today.getMonth();
        date = today.getDate();
        if ((month - 1) <= 0) {
            year = today.getFullYear() - 1;
        }
        
        var backdate = new Date(year, month - 1, date);
        
        return backdate;
    }, getFormattedDate = function (input) {
        var year = input.getFullYear(), month = input.getMonth(), date = input.getDate(), months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month] + " " + date + ", " + year;
    }, todayObj = new Date(), oneMonthAgoDateObj = displayDate(todayObj);
    
    $('.date-range').html(getFormattedDate(oneMonthAgoDateObj) + ' - ' + getFormattedDate(todayObj));
    
    $('.sel-range').daterangepicker({
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: "Select"
        },
        startDate: new Date(),
        endDate: displayDate(new Date())
    }, function (start, end, label) {
        $('.date-range').html(start.format('MMM DD, YYYY') + ' - ' + end.format('MMM DD, YYYY'));
    });
});

var showDeviceModelTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.model + "</td><td>" + row.users + "</td><td>" + row.time + "</td></tr>";
        
    });
    $("#" + tableId + " tbody").html(tableHTML);
};

var showDeviceMenufacturerTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.manufacturer + "</td><td>" + row.users + "</td><td>" + row.time + "</td></tr>";
        
    });
    $("#" + tableId + " tbody").html(tableHTML);
};

var showCrashReportTable = function (data, tableId) {
	"use strict";
	var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.date + "</td><td>" + row.plateform + "</td><td>" + row.os + "</td><td>" + row.app + "</td><td>" + row.totalCrashes + "</td></tr>";
        
    });
    $("#" + tableId + " tbody").html(tableHTML);
};

    