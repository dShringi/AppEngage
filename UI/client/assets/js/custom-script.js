var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var color = d3.scale.ordinal().range(["#f47321", "#76bce6", "#75d3c5", "#379154", "#39B4BF", "#FFE666", "#E54E67", "#F75B49"]);
var todayObj = new Date(), appKey = '4170b44d6459bba992acaa857ac5b25d7fac6cc1';

var APIBaseURL = "http://52.206.121.100/appengage/";
//var APIBaseURL = "http://13.66.57.215/appengage/";

// Get donut chart SVG object
var getDonutSVG = function (chartHolder, width, height) {
	return d3.select(chartHolder).append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr('viewBox', '0 0 ' + width + ' ' + height)
			.attr('perserveAspectRatio', 'xMinYMid')
			.attr("class", "chart")
			.append("g")
			.attr("transform", "translate(" + ((width / 2)) + "," + height / 2 + ")");
};

function numFormate(nums) {
	//console.log(nums + " : " + nums.toString().length);
	var retStr = "";
	switch (nums.toString().length) {
		case 1:
		case 2:
		case 3:
			retStr = nums;
			break;
		case 4: //1000
			retStr = nums.toString().substr(0, 1) + "K+";
			break;
		case 5: //10000
			retStr = nums.toString().substr(0, 2) + "K+";
			break;
		case 6: //100000
			retStr = nums.toString().substr(0, 3) + "K+";
			break;
		case 7: //1000000
			retStr = nums.toString().substr(0, 1) + "M+";
			break;
		case 8: //10000000
			retStr = nums.toString().substr(0, 2) + "M+";
			break;
		case 9: //100000000
			retStr = nums.toString().substr(0, 1) + "B+";
			break;
		case 10: //1000000000
			retStr = nums.toString().substr(0, 2) + "B+";
			break;
	}
	//console.log(nums+" : "+nums.toString().length+" : "+retStr);
	
	return retStr;
}

$(document).ready(function () {
    "use strict";
    $('.left-side').load("menu.html");
	$('.left-side').addClass('wdt80');
    
	$.get("header.html", function (data) {
		$(".main-container").prepend(data);
	});
	
	$(window).on("resize", function() {
		var the_chart = $(".chart");
		var aspect = the_chart.width() / the_chart.height(),
		container = the_chart.parent();
		
		console.log('resize window');
		var targetWidth = container.width();
		console.log(the_chart.width());
		the_chart.attr("width", targetWidth);
		the_chart.attr("height", Math.round(targetWidth / aspect));
	}).trigger("resize");
    
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
    }, oneMonthAgoDateObj = displayDate(todayObj);
    
    var startDateCal = new Date(), endDateCal = displayDate(new Date()), type;
	function cb(start, end) {
        $('#dateRange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
		//alert(start+"--"+end);
		startDateCal = start;
		endDateCal = end;
        
        if($('#sel_deviceType').length){
            type = $('#sel_deviceType').val();
        } else {
            type = "A";
        }
		loadChart(parseInt(start/1000),parseInt(end/1000), appKey, type);
    }
    cb(moment().subtract(29, 'days'), moment());
	
    $('#dateRange').daterangepicker({
		ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'This Week': [moment().startOf('week'), moment().endOf('week')],
		   'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
		
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: "Select"
        },
        startDate: startDateCal,
        endDate: endDateCal
    }, cb);
    
    $('#sel_deviceType').on('change', function(){
        loadChart(parseInt(startDateCal/1000),parseInt(endDateCal/1000), appKey, $(this).val());
    });
});

var showError = function(err){
    //sweetAlert("Oops...", err, "error");
	swal({   title: "OOPS",   text: err,   imageUrl: "assets/img/error.png" });
}

var showDeviceModelTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.model + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showCitiesTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.city + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showDeviceCarrierTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.carrier + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    $("#" + tableId + " tbody").html(tableHTML);
	sortTable();
};

var showDeviceResolutionTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.resolution + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showDeviceOSVersionTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.osversion + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showDeviceAppVersionTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.appversion + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showDevicePlatformTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.platform + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showDeviceTypeTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.type + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showDeviceMenufacturerTable = function (data, tableId) {
	"use strict";
    var tableHTML = "";
    $.each(data, function (index, row) {
        //alert(JSON.stringify(row));
        tableHTML += "<tr><td>" + row.manufacturer + "</td><td>" + numFormate(row.users) + "</td><td>" + sec2ISO(row.time) + "</td></tr>";
        
    });
    updateTable(tableId, tableHTML);
};

var showCrashReportTable = function (data, tableId) {
	"use strict";
	var tableHTML = "";
	//console.log("Avi : "+JSON.stringify(data));
	//var $table = $('#'+tableId);
	    $.each(data, function (index, row) {
        tableHTML += "<tr><td>" + getFormatedDateDDMMYY(new Date(row.dt*1000)) + "</td><td>" + row.pf + "</td><td>" + row.os + "</td><td>" + row.avn + "</td><td>" + numFormate(row.totalCrashes) + "</td></tr>";
        
    });
	updateTable(tableId, tableHTML);
};


function updateTable(tableId, tableHTML){
	if ($('#'+tableId).find("tr").size() > 1){
		//console.log("empty table");
		$.tablesorter.clearTableBody( $('#'+tableId) );
		$("#" + tableId + " tbody").html(tableHTML);
		$("#" + tableId).trigger("update");
	} else {
		$("#" + tableId + " tbody").html(tableHTML);
		sortTable();
	}
}


var parseEventDate = function(eDate){
	if(eDate.length == "10"){
		year = eDate.substring(0,4);
		month = eDate.substring(4,6);
		day = eDate.substring(6,8);
		hour = eDate.substring(8,10);
	} else {
		year = eDate.substring(0,4);
		month = eDate.substring(4,6);
		day = eDate.substring(6,8);
		hour = 0;
	}
	
	//return date object
	return new Date(year,month-1,day,hour,0,0);
};

var removeNulls = function(arr){
	var arr1 = new Array(), arr2 = new Array();
	$.each(arr, function(i,v){
		//console.log("Outer Each" + JSON.stringify(v));
		arr2 = [];
		$.each(v.values, function(i1,v1){
			//console.log("Inner Each" + JSON.stringify(v1));
			if(v1 !== undefined){
				arr2.push(v1);
			}
		});
		arr1.push({
			"name":v.name,
			"values":arr2
		});
	});
	return arr1;
};

/*
	Function return an array in format
	'date':{date:"<date>", crashes:<crashCount>}
*/
var tempArr = new Array();
var datewiseTotalCrashes = function(data){
	tempArr = new Array();
	$.each(data, function(index, value){
		// update crashcount if already exist in array with corresponding timeStamp/date
		updateCrashCount(value, tempArr);
		//console.log("Avi" + JSON.stringify(tempArr));
		totalCrashCount += value.totalCrashes;
	});
	//console.log("Total : " + tempArr.length);
	//console.log(JSON.stringify(tempArr));
	return tempArr;
};

var updateCrashCount = function(currentElement, arr){
	var dateObj = getDateObj(currentElement.date);
	timeStamp = dateObj.getTime();
	var found = false;
	$.each(arr, function(i, v){
		if(v['timeStamp'] == timeStamp){
			found = true;
			//console.log(currentElement.date);
			//console.log("Already Exist");
			//console.log(" Old : " + v['crashes']);
			updatedCrashCount = v['crashes'] + currentElement.totalCrashes;
			tempArr[i]['crashes'] = updatedCrashCount;
			//console.log(i + " New : " + updatedCrashCount)
			//console.log(JSON.stringify(arr));
			//return arr;
		}
	});
	if(!found){
		tempArr.push({
			"date" : currentElement.date,
			"crashes" : currentElement.totalCrashes,
			"timeStamp" : timeStamp
		});
		//return arr;
	}
};

/*
	Function return array of date in format
	{d:<date>, m:<month in number>, y:<year>}
*/
var getDateObj = function(dateEle){
	var tempArrDate = dateEle.split("-");
	//console.log(JSON.stringify(tempArrDate));
	var year = tempArrDate[2] < 100 ? "20"+tempArrDate[2] : tempArrDate[2];
	//console.log(year);
	return new Date(year, (months.indexOf(tempArrDate[1]) + 1), tempArrDate[0], 0, 0, 0);
};

var totalCrashes = 0;

var showTotalCrashesChart = function(data,svg,pie){
	var g = svg.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");
	g.append("path")
		.attr("d", arc)
		.style("fill", function (d) { return color(d.data.TotalCrashes); });

	g.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("class", "inside")
		.attr("fill", "#616161")
		//.text(totalCrashes)
		.text(function (d) { return d.data.TotalCrashes; });
};
var showCrashesDonutChart = function(data,svg,pie,parentdiv,maxcrash){
	//console.log(JSON.stringify(data));
	var tooltip = d3.select("body")
		.append("div")  // declare the tooltip div 
		.attr("class", "map-tooltip shadow")              // apply the 'tooltip' class
		.style("opacity", 0);                  // set the opacity to nil

	var g = svg.selectAll(".arc")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "arc");

	var maxcrashName;
	
	for(var i = 0; i<data.length; i++){
		if(data[i].crash === maxcrash){
			var obj = data[i];
			console.log(obj);
			for(var j in obj){
				console.log(obj.name);
				maxcrashName = obj.name;
			}
		}
	
	}

	g.append("path")
		.attr("d", arc)
		.attr("data-legend", function (d) {return d.data.manufacturer; })
		//.attr("id", function(d) {'tag'+d.data.manufacturer.replace(/\s+/g, '')}) // assign ID
		.on("mouseenter", function (d) {
			d3.select(this)
				.transition()
				.duration(1000)
				.attr("class", "shadow")
				.attr("d", arcOver);
				$("."+parentdiv+" text.inside").html(d.data.crash);
				$("."+parentdiv+" text.inside-text").html(d.data.name);
				console.log(d.data);
			tooltip.transition().duration(200).style("opacity", 1);	
			tooltip.html(d.data.name +" : "+d.data.crash).style("left", (d3.event.pageX - 23) + "px").style("top", (d3.event.pageY - 46) + "px");
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.transition()
				.duration(1000)
				.attr("d", arc);
				$("."+parentdiv+" text.inside").html(maxcrash);
				$("."+parentdiv+" text.inside-text").html(maxcrashName);
			tooltip.transition().duration(200).style("opacity", 0);
		})
		.style("fill", function (d) { return color(d.data.name); });

	g.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("class", "inside")
		.attr("fill", "#616161")
		.text(maxcrash)
		.on("click", function (d) {
			//alert("aaa");
		});
		
	g.append("text")
		.attr("dy", "2.7em")
		.style("text-anchor", "middle")
		.style("font-size", "14px")
		.attr("class", "inside-text")
		.attr("fill", "#616161")
		.text(maxcrashName)
		.on("click", function (d) {
			//alert("aaa");
		});
};

/*********Return date in the format yyyymmdd **********/
var getFormatedDate = function(dateObj){
	year = dateObj.getFullYear();
	month = dateObj.getMonth()<10?"0"+dateObj.getMonth():dateObj.getMonth();
	date = dateObj.getDate()<10?"0"+dateObj.getDate():dateObj.getDate();;
	return year+month+date;
};
/*********Return date in the format yyyymmdd - END **********/

/******************* Convert hhmmss to date and time object ***********************/
var parseTime = function(eTime){
	hh = eDate.substring(0,2);
	mm = eDate.substring(2,4);
	ss = eDate.substring(4,6);
	
	year = dateObj.getFullYear();
	month = dateObj.getMonth()
	date = dateObj.getDate()
	
	//return date object
	return new Date(year,month,day,hh,mm,ss);
};
/******************* Convert hhmmss to date and time object - END ***********************/

var getFormattedDate = function (input) {
	var year = input.getFullYear(), month = input.getMonth(), date = input.getDate();
	/*var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];*/
	return months[month] + " " + date + ", " + year;
};

var getFormatedDateDDMMYY = function (input) {
	var year = input.getFullYear(), month = input.getMonth(), date = input.getDate();
	/*var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];*/
	return date + "-" + months[month] + "-" + year;
};

/******************* Convert time in format hh:mm:ss *****************/
var sec2ISO = function(SECONDS){
	var date = new Date(null);
	date.setSeconds(SECONDS); // specify value for SECONDS here
	return date.toISOString().substr(11, 8);
};
/******************* Convert time in format hh:mm:ss - END *****************/

/*************************  For Line Chart ************************/
function plotLineChart(data, svg, div,timestamp=false, ele, valueline, x, y, width, height, xAxis="", yAxis = ""){
	//console.log(typeof xAxis+" :: "+typeof yAxis);
	// Scale the range of the data
	
	var hoursFlag;
	
	x.domain(d3.extent(data, function(d) { 
		if((d.date).length === 8){
			return new Date((d.date).substr(0,4)+"-"+(d.date).substr(4,2)+"-"+(d.date).substr(6,2)); 
		}
		else{
			hoursFlag = true;
			return (d.date).substr(8,2);
		}
		
	}));
	y.domain([0, d3.max(data, function(d) { return parseInt(d[ele]); })]);
	//return new Date((d.date).substr(0,4)+"/"+(d.date).substr(4,2)+"/"+(d.date).substr(6,2));
	

	svg.append("path")		
		.attr("class", "line")
		.attr("d", valueline(data));

	// draw the scatterplot
	svg.selectAll("dot")									
		.data(data)											
		.enter().append("circle")								
		.attr("r", 4)
		.attr("stroke", "#7ABEE7")
		.attr("fill", "white")
		.attr("stroke-width", "2px")
		.attr("cx", function(d) {
			if((d.date).length === 8){
				return x(new Date((d.date).substr(0,4)+"-"+(d.date).substr(4,2)+"-"+(d.date).substr(6,2))); 
			}
			else{
				return x((d.date).substr(8,2));
				
			}
		})		 
		.attr("cy", function(d) { return y(parseInt(d[ele])); })
		// Tooltip stuff after this
		.on("mouseenter", function(d) {
			if(timestamp){
				cnt = sec2ISO(d[ele]);
			} else {
				cnt = d[ele];
			}
			div.transition().duration(200).style("opacity", .9);	
			div.html(cnt).style("left", (d3.event.pageX - 23) + "px").style("top", (d3.event.pageY - 46) + "px");
		})
		.on("mouseleave", function(d){div.transition().duration(200).style("opacity", 0);});
	drawAxes(svg, x, y, width, height, xAxis, yAxis, hoursFlag);
}

function drawAxes(svg, x, y, width, height, xAxis, yAxis, hoursFlag){
	// Define the axes
	//console.log(xAxis+" : "+yAxis);
	if(typeof xAxis === "string"){
		if(hoursFlag === true){
			xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(24).tickFormat(d3.format("d"));
		}
		else{
			xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickFormat(d3.time.format("%b %d"));
		}
	}
	if(typeof yAxis === "string"){
		yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
	}
	// Add the X Axis
	svg.append("g")	
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// Add the Y Axis
	svg.append("g")	
		.attr("class", "y axis")
		.call(yAxis);
}
/*************************  For Line Chart - END ************************/

var sortTable = function(){
	var pagerOptions = {

    // target the pager markup - see the HTML block below
    container: $(".pager"),

    // use this url format "http:/mydatabase.com?page={page}&size={size}&{sortList:col}"
    ajaxUrl: null,

    // modify the url after all processing has been applied
    customAjaxUrl: function(table, url) { return url; },

    // ajax error callback from $.tablesorter.showError function
    // ajaxError: function( config, xhr, settings, exception ){ return exception; };
    // returning false will abort the error message
    ajaxError: null,

    // add more ajax settings here
    // see http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings
    ajaxObject: { dataType: 'json' },

    // process ajax so that the data object is returned along with the total number of rows
    ajaxProcessing: null,

    // Set this option to false if your table data is preloaded into the table, but you are still using ajax
    processAjaxOnInit: true,

    // output string - default is '{page}/{totalPages}'
    // possible variables: {size}, {page}, {totalPages}, {filteredPages}, {startRow}, {endRow}, {filteredRows} and {totalRows}
    // also {page:input} & {startRow:input} will add a modifiable input in place of the value
    output: '{startRow:input} to {endRow} of {totalRows}',

    // apply disabled classname (cssDisabled option) to the pager arrows when the rows
    // are at either extreme is visible; default is true
    updateArrows: true,

    // starting page of the pager (zero based index)
    page: 0,

    // Number of visible rows - default is 10
    size: 10,

    // Save pager page & size if the storage script is loaded (requires $.tablesorter.storage in jquery.tablesorter.widgets.js)
    savePages : true,

    // Saves tablesorter paging to custom key if defined.
    // Key parameter name used by the $.tablesorter.storage function.
    // Useful if you have multiple tables defined
    storageKey:'tablesorter-pager',

    // Reset pager to this page after filtering; set to desired page number (zero-based index),
    // or false to not change page at filter start
    pageReset: 0,

    // if true, the table will remain the same height no matter how many records are displayed. The space is made up by an empty
    // table row set to a height to compensate; default is false
    fixedHeight: true,

    // remove rows from the table to speed up the sort of large tables.
    // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
    removeRows: false,

    // If true, child rows will be counted towards the pager set size
    countChildRows: false,

    // css class names of pager arrows
    cssNext: '.next', // next page arrow
    cssPrev: '.prev', // previous page arrow
    cssFirst: '.first', // go to first page arrow
    cssLast: '.last', // go to last page arrow
    cssGoto: '.gotoPage', // select dropdown to allow choosing a page

    cssPageDisplay: '.pagedisplay', // location of where the "output" is displayed
    cssPageSize: '.pagesize', // page size selector - select dropdown that sets the "size" option

    // class added to arrows when at the extremes (i.e. prev/first arrows are "disabled" when on the first page)
    cssDisabled: 'disabled', // Note there is no period "." in front of this class name
    cssErrorRow: 'tablesorter-errorRow' // ajax error information row

  };

  $("table")

    // Initialize tablesorter
    // ***********************
    .tablesorter({
      theme: 'blue',
      widthFixed: true,
      widgets: ['zebra']
    })

    // bind to pager events
    // *********************
    .bind('pagerChange pagerComplete pagerInitialized pageMoved', function(e, c){
      var msg = '"</span> event triggered, ' + (e.type === 'pagerChange' ? 'going to' : 'now on') +
        ' page <span class="typ">' + (c.page + 1) + '/' + c.totalPages + '</span>';
      $('#display')
        .append('<li><span class="str">"' + e.type + msg + '</li>')
        .find('li:first').remove();
    })

    // initialize the pager plugin
    // ****************************
    .tablesorterPager(pagerOptions);

    // Add two new rows using the "addRows" method
    // the "update" method doesn't work here because not all rows are
    // present in the table when the pager is applied ("removeRows" is false)
    // ***********************************************************************
    var r, $row, num = 50,
      row = '<tr><td>Student{i}</td><td>{m}</td><td>{g}</td><td>{r}</td><td>{r}</td><td>{r}</td><td>{r}</td><td><button type="button" class="remove" title="Remove this row">X</button></td></tr>' +
        '<tr><td>Student{j}</td><td>{m}</td><td>{g}</td><td>{r}</td><td>{r}</td><td>{r}</td><td>{r}</td><td><button type="button" class="remove" title="Remove this row">X</button></td></tr>';
    $('button:contains(Add)').click(function(){
      // add two rows of random data!
      r = row.replace(/\{[gijmr]\}/g, function(m){
        return {
          '{i}' : num + 1,
          '{j}' : num + 2,
          '{r}' : Math.round(Math.random() * 100),
          '{g}' : Math.random() > 0.5 ? 'male' : 'female',
          '{m}' : Math.random() > 0.5 ? 'Mathematics' : 'Languages'
        }[m];
      });
      num = num + 2;
      $row = $(r);
      $('table')
        .find('tbody').append($row)
        .trigger('addRows', [$row]);
      return false;
    });

    // Delete a row
    // *************
    $('table').delegate('button.remove', 'click' ,function(){
      var t = $('table');
      // disabling the pager will restore all table rows
      // t.trigger('disablePager');
      // remove chosen row
      $(this).closest('tr').remove();
      // restore pager
      // t.trigger('enablePager');
      t.trigger('update');
      return false;
    });

    // Destroy pager / Restore pager
    // **************
    $('button:contains(Destroy)').click(function(){
      // Exterminate, annhilate, destroy! http://www.youtube.com/watch?v=LOqn8FxuyFs
      var $t = $(this);
      if (/Destroy/.test( $t.text() )){
        $('table').trigger('destroyPager');
        $t.text('Restore Pager');
      } else {
        $('table').tablesorterPager(pagerOptions);
        $t.text('Destroy Pager');
      }
      return false;
    });

    // Disable / Enable
    // **************
    $('.toggle').click(function(){
      var mode = /Disable/.test( $(this).text() );
      $('table').trigger( (mode ? 'disable' : 'enable') + 'Pager');
      $(this).text( (mode ? 'Enable' : 'Disable') + 'Pager');
      return false;
    });
    $('table').bind('pagerChange', function(){
      // pager automatically enables when table is sorted.
      $('.toggle').text('Disable Pager');
    });

    // clear storage (page & size)
    $('.clear-pager-data').click(function(){
      // clears user set page & size from local storage, so on page
      // reload the page & size resets to the original settings
      $.tablesorter.storage( $('table'), 'tablesorter-pager', '' );
    });

    // go to page 1 showing 10 rows
    $('.goto').click(function(){
      // triggering "pageAndSize" without parameters will reset the
      // pager to page 1 and the original set size (10 by default)
      // $('table').trigger('pageAndSize')
      $('table').trigger('pageAndSize', [1, 10]);
    });
}

//***************************** DEVICE DONUT CHARTS ***********************************
function plotDonutChart(data, ele, arc, arcOver, pie, svg, width, color){
	
	var tooltip = d3.select("body")
		.append("div")  // declare the tooltip div 
		.attr("class", "map-tooltip shadow")              // apply the 'tooltip' class
		.style("opacity", 0);                  // set the opacity to nil
		
	var g = svg.selectAll(".arc")
						.data(pie(data))
						.enter().append("g")
						.attr("class", "arc");

					g.append("path")
						.attr("d", arc)
						.attr("data-legend", function (d) { return d.data[ele]; })
						//.attr("id", function(d) {'tag'+d.data.manufacturer.replace(/\s+/g, '')}) // assign ID
						.on("mouseenter", function (d) {
							d3.select(this)
								.transition()
								.duration(1000)
								.attr("class", "shadow")
								.attr("d", arcOver);
								tooltip.transition().duration(200).style("opacity", 1);	
								tooltip.html(d.data[ele]+" : "+d.data.users).style("left", (d3.event.pageX - 23) + "px").style("top", (d3.event.pageY - 46) + "px");
						})
						.on("mouseleave", function (d) {
							d3.select(this)
								.transition()
								.duration(1000)
								.attr("d", arc);
								tooltip.transition().duration(200).style("opacity", 0);
						})
						.style("fill", function (d) { return color(d.data[ele]); });

					/*g.append("text")
						.attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
						//.attr("dy", ".35em")
						.on("click", function (d) {
							//alert("aaa");
						});*/

					g.append("svg:image")
						.attr("xlink:href", "assets/img/B.png")
						.attr("width", 124)
						.attr("height", 113)
						.attr("text-anchor", "middle")
						.attr("x", -1 * 124 / 2)
						.attr("y", -1 * 113 / 2);


					var g1 = svg1.selectAll(".arc")
						.data(pie1(data))
						.enter().append("g")
						.attr("class", "arc");

					g1.append("path")
						.attr("d", arc)
						.attr("data-legend", function (d) { return d.data[ele]; })
						//.attr("id", function(d) {'tag'+d.data.manufacturer.replace(/\s+/g, '')}) // assign ID
						.on("mouseenter", function (d) {
							d3.select(this)
								.attr("class", "shadow")
								.transition()
								.duration(1000)
								.attr("d", arcOver);
								tooltip.transition().duration(200).style("opacity", 1);	
								tooltip.html(d.data[ele]+" : "+d.data.users).style("left", (d3.event.pageX - 23) + "px").style("top", (d3.event.pageY - 46) + "px");
						})
						.on("mouseleave", function (d) {
							d3.select(this)
								.transition()
								.duration(1000)
								.attr("d", arc);
								tooltip.transition().duration(200).style("opacity", 0);
						})
						.style("fill", function (d) { return color(d.data[ele]); });

					/*g1.append("text")
						.attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
						//.attr("dy", ".35em")
						.on("mouseover", function (d) {
							//alert("bbb");
						});*/
						//.text(function (d) { return d.data.manufacturer; });
					g1.append("svg:image")
						.attr("xlink:href", "assets/img/A.png")
						.attr("width", 124)
						.attr("height", 113)
						.attr("text-anchor", "middle")
						.attr("x", -1 * 124 / 2)
						.attr("y", -1 * 113 / 2);
						

					var legend = svg.append("g")
						.attr("class", "legend")
						.attr("transform", "translate(120,-" + legendPosY + ")")
						.call(d3.legend);

					setTimeout(function () {
						legend
							.attr("data-style-padding", 10)
							.call(d3.legend);
					}, 1000);

					var legend1 = svg1.append("g")
						.attr("class", "legend")
						.attr("transform", "translate(120,-" + legendPosY + ")")
						.call(d3.legend);

					setTimeout(function () {
						legend
							.attr("data-style-padding", 10)
							.call(d3.legend);
					}, 1000);
					
					switch(ele){
						case "manufacturer":
							showDeviceMenufacturerTable(data, 'tbl-device-manufacturers');
							break;
						case "osversion":
							showDeviceOSVersionTable(data, 'tbl-device-os-version');
							break;
						case "type":
							showDeviceTypeTable(data, 'tbl-device-types');
							break;
						case "resolution":
							showDeviceResolutionTable(data, 'tbl-device-resolutions');
							break;
						case "platform":
							showDevicePlatformTable(data, 'tbl-device-platforms');
							break;
						case "model":
							showDeviceModelTable(data, 'tbl-device-models');
							break;
						case "appversion":
							showDeviceAppVersionTable(data, 'tbl-device-app-version');
							break;
					
					}

}