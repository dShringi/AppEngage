var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var todayObj = new Date();
//var appKey = '4170b44d6459bba992acaa857ac5b25d7fac6cc1';
var appKey = localStorage.getItem("appKey")

$(document).ready(function () {
	
    "use strict";   
	
	$('body').on('load', function() {
  // Handler for .load() called.
	alert('loaded');
	$( ".device-menu li.selected a" ).trigger( "click" );
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
    }, oneMonthAgoDateObj = displayDate(todayObj);
    
    var startDateCal = new Date(), endDateCal = displayDate(new Date()), type;
	function cb(start, end) {
        $('#dateRange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
		//alert(start+"--"+end);
		startDateCal = start;
		endDateCal = end;
        //console.log(startDateCal + endDateCal);
        if($('#sel_deviceType').length){
            type = $('#sel_deviceType').val();
        } else {
            type = "A";
        }
		//loadChart(parseInt(start/1000),parseInt(end/1000), appKey, type);
		$('#sDate').val(parseInt(start/1000));
		$('#eDate').val(parseInt(end/1000));
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
	
	$("#mobileAppScreens").on("click", function(){
		$(this).parent().addClass("selected");
		$("#mobileAppScreens").next().removeClass("hide");
		$("#tabletAppScreens").next().addClass("hide");
		$("#tabletAppScreens").parent().removeClass("selected");
		
	});
	
	$("#tabletAppScreens").on("click", function(){
		$(this).parent().addClass("selected");
		$("#mobileAppScreens").next().addClass("hide");
		$("#tabletAppScreens").next().removeClass("hide");
		$("#mobileAppScreens").parent().removeClass("selected");
		
		
	});
	
	
	
});


$(window).load(function() {
			console.log("window load");

			$('.photos').coverflow({
					easing:			'',
					duration:		'slow',
					index:			3,
					width:			320,
					height:			240,
					visible:		'density',
					selectedCss:	{	opacity: 1	},
					outerCss:		{	opacity: .1	},
					
					confirm:		function() {
						//console.log('Confirm');
					},
					
					refresh: function(){
						console.log('refresh');
					},

					change:	function(event, cover) {
						var img = $(cover).children().andSelf().filter('img').last();
						
						$('#photos-name').text(img.data('name') || 'unknown');
						//console.log(imgIndex);
						//var imgIndex = img.index();
						
						//$(".info-container").not(':eq(imgIndex)').hide();
						//$(".info-container").eq(imgIndex).show();
						
						var imgIndex = img.index();
						var infoIndex = $(".info-container").index();
						//console.log(imgIndex);
						
						
						$('.info-container').each(function (index, value){
						  
						 var listItem = $(this).index();
							
						  if (imgIndex === listItem)
							  {
								 $(".info-container").eq(listItem).show();
							  }
							else{
								
								$(".info-container").eq(listItem).hide();
							}
						});						
					}
			});	
		
		
			
			
			$('.photos').on('click', function(){
				$('.photos img').first().mousedown();
			});
			
			setTimeout(function(){
				$('.photos').trigger('click')
			}, 500);
			
			
			$("#iosMobileAppScreens").on('click', function(){  
				$('.photos').on('click', function(){
					$('.photos img').mousedown();
				});
				
				setTimeout(function(){
					$('.photos').trigger('click')
				}, 500);	
			});
			
			$("#androidMobileAppScreens").on('click', function(){  
				$('.photos').on('click', function(){
					$('.photos img').mousedown();
				});
				
				setTimeout(function(){
					$('.photos').trigger('click')
					//console.log("hi click called")
				}, 500);
			});
			
			//$('#androidMobileAppScreens').click();
			
			
			
			$("#iostabletAppScreens").on('click', function(){  
				$('.photos').on('click', function(){
					$('.photos img').mousedown();
				});
				
				setTimeout(function(){
					$('.photos').trigger('click')
				}, 500);	
			});
			
			$("#androidtabletAppScreens").on('click', function(){  
				$('.photos').on('click', function(){
					$('.photos img').mousedown();
				});
				
				setTimeout(function(){
					$('.photos').trigger('click')
					//console.log("hi click called")
				}, 500);
			});
			
			//$('#androidtabletAppScreens').click();
			//$('#iostabletAppScreens').click();
			
			$('#iosMobileAppScreens').click();
			
});


