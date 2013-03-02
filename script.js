//Vars
var currentTag,guessedTag,time,displayTime,counter,numGuesses=0,loadedImgs=0;
var imgNum=20,seconds=31,speed=200,longspeed=600,transition="easeOutExpo";
/**************************
Game loop
**************************/
$(function(){
	//Theme switcher
	$('#switcher').themeswitcher({loadTheme:"Dot Luv"});
	//Start the first game & hide instructions
	$("#startFirstGame").click(function(){
		firstGame();
		return false;
	});
	//Take a guess
	$("#guess").submit(function(){
		takeAGuess();
		return false;
	});
	//manually start a new game
	$("#newTag").click(function(){
		startGame();
		return false;
	});
	//Give up a game (lose)
	$("#giveUp").click(function(){
		lose();
		return false;
	});
	//button hover effects
	$(".button").hover(function(){ 
		$(this).addClass("ui-state-hover"); 
	},function(){ 
		$(this).removeClass("ui-state-hover"); 
	})
	//Winning Dialog Box
	$("#winDialog").dialog({
		bgiframe: true,
		modal: true,
		autoOpen: false,
		width:400,
		buttons: {
			"Cool": function() {
				$(this).dialog('close');
				startGame();
			}
		}
	});
	//Losing Dialog Box
	$("#loseDialog").dialog({
		bgiframe: true,
		modal: true,
		autoOpen: false,
		width:400,
		buttons: {
			"I am bad at this game": function() {
				$(this).dialog('close');
				startGame();
			}
		}
	});
});
$(window).load(function(){
	//initial page load animation
	pageLoaded();
});
/**************************
Take a guess
**************************/
function takeAGuess(){
	guessedTag=$("#guess #tag").val();
	if(guessedTag != "" && guessedTag != " "){
		numGuesses++;
		$(".numOfGuesses").text(numGuesses);
		if(guessedTag==currentTag){
			//Correct!
			win();
		}else{
			//Wrong!
			if(numGuesses==1) $("#gameStuff").slideDown(speed,transition);
			$("#guess #tag").effect("highlight",{"color":"#F00F00"},speed).val("").focus();
			$("#guesses .clear").before("<li>"+guessedTag+"</li>")
			$("#guesses :nth-child("+numGuesses+")").hide().show(speed,transition);
		}
	}
}
/**************************
Start a new game
**************************/
function startGame(){
	time=seconds;
	clearTimeout(counter);
	$("#timer").removeAttr("style");
	$("#guesses, #photos,#preloadPhotos").empty();
	$("<li class='clear'></li>").appendTo("#guesses");
	$("#gameStuff").slideUp(speed,transition);
	numGuesses=0;
	$(".numOfGuesses").text(numGuesses);
	$("#guess #tag").val("").focus();
	//Get a random word
	$.get("words.php", function(data){
		currentTag=data;
		//get JSON data from Flickr
		$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?tags="+currentTag+"&tagmode=any&format=json&jsoncallback=?",function(data){
			$.each(data.items, function(i,item){
				$("<img src='"+item.media.m.replace(/_m\.jpg/g,'.jpg')+"' alt='' />").appendTo("#preloadPhotos");
				$("<img alt='' src='"+item.media.m.replace(/_m\.jpg/g,'_s.jpg')+"'/>").appendTo("#photos").load(function(){
					$(this).wrap("<a href='"+item.media.m.replace(/_m\.jpg/g,'.jpg')+"'></a>");
					$("#photos a").fancybox({
						'zoomSpeedIn':speed,
						'zoomSpeedOut':speed,
						'overlayShow': false,
						'hideOnContentClick':true
					});
					loadedImgs++;
					if(loadedImgs == imgNum){
						//start timer once all images are loaded
						tick();
						loadedImgs=0;
					}
				});
				if (i == imgNum-1) return false;
			});
		});
	});
	
}
/**************************
Start First Game
**************************/
function firstGame(){
	$("#intro").hide("drop",{duration:longspeed,easing:transition,direction:"up"},function(){
		$("#gameOptions").show("drop",{duration:longspeed,easing:transition,direction:"up",},function(){
			$("#guess").show("drop",{duration:longspeed,easing:transition,direction:"up",},function(){
				startGame();
			});
		});
	})
}
/**************************
Animate the page once loaded
**************************/
function pageLoaded(){
	$("#intro").show("drop",{duration:longspeed,easing:transition,direction:"up"});
}
/**************************
Timer
**************************/
function tick(){
	time--;
	displayTime=time;
	if(time<10) displayTime="0"+time;
	$("#timer").text(":"+displayTime);
	if(time<=0){
		lose();
		return false;
	}else{
		if(time==10){
			$("#timer").animate({color:"#FF0000"},speed);
		}
		counter=setTimeout("tick()",1000);
	}
}
/**************************
LOSE!
**************************/
function lose(){
	clearTimeout(counter);
	$("#giveUpTag").text(currentTag);
	$('#loseDialog').dialog('open');
}
/**************************
WIN!
**************************/
function win(){
	clearTimeout(counter);
	$('#winDialog').dialog('open');
}