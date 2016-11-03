$(document).ready(function(){ 

//console.log("call ready");
	
	$("#mobileAppScreens").on("click", function(){ 
		$(this).parent().addClass("selected");
		$("#tabletAppScreens").children().removeClass("checked");
		$("#mobileAppScreens").next().removeClass("hide");
		$("#tabletAppScreens").next().addClass("hide");
		$("#tabletAppScreens").parent().removeClass("selected");
		
	});
	
	$("#tabletAppScreens").on("click", function(){
		$(this).parent().addClass("selected");
		$("#mobileAppScreens").children().removeClass("checked");
		$("#mobileAppScreens").next().addClass("hide");
		$("#tabletAppScreens").next().removeClass("hide");
		$("#mobileAppScreens").parent().removeClass("selected");
		$("#mobileAppScreens").parent().removeClass("selected");
		
		
	});
	
	$(".sub-menu-menu").on('click','a', function(){
    	$(this).addClass('checked').siblings().removeClass('checked');
 	});
	
	$(".ranges").on('click','li', function(){ 
		console.log("click");
		
		var selectId= $("#selMenu").val();
    	$("#"+selectId).click();
		
 	});
	
	
});

$(window).load(function() {
			//console.log("window load");
	
			

			$('.photos').coverflow({
					easing:			'',
					duration:		'slow',
					index:			3,
					width:			170,
					height:			302,
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
				
				$("#selMenu").val(this.id);

				$('.photos').on('click', function(){
					$('.photos img').mousedown();
				});
				
				setTimeout(function(){
					$('.photos').trigger('click')
				}, 500);	
			});
			
			$("#androidMobileAppScreens").on('click', function(){ 
				
				$("#selMenu").val(this.id);

				console.log($("#selMenu").val())
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
				
				$("#selMenu").val(this.id);
				
				$('.photos').on('click', function(){
					$('.photos img').mousedown();
				});
				
				setTimeout(function(){
					$('.photos').trigger('click')
				}, 500);	
			});
			
			$("#androidtabletAppScreens").on('click', function(){ 
				
				$("#selMenu").val(this.id);
				
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


