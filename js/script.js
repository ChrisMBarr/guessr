var $Game = function($){
	//Vars
	var currentTag;
	var guessedTag;
	var numGuesses=0;

	var settings={
		imagesToDisplay: 20,
		gameDuration: 30,
		animationSpeed: 200,
		easing: 'easeOutExpo'
	};
	settings.dropAnimationOpts = {
		duration:600,
		easing:settings.easing,
		direction:"up"
	};
	

	//Init
	$(function(){
		setup.buttons();
		setup.dialogs();

		//initial page load animation
		$("#intro").show("drop",settings.dropAnimationOpts);
	});

	var setup={
		buttons:function(){
			//Start the first game & hide instructions
			$("#startFirstGame").click(actions.startFirstGame);

			//Take a guess
			$("#guess").submit(function(){
				actions.guess();
				return false;
			});
			//manually start a new game
			$("#newTag").click(function(){
				actions.startGame();
				return false;
			});
			//Give up a game (lose)
			$("#giveUp").click(actions.loseGame);

			//button hover effects
			$(".button").hover(function(){ 
				$(this).addClass("ui-state-hover"); 
			},function(){ 
				$(this).removeClass("ui-state-hover"); 
			});
		},
		dialogs:function(){
			//Winning Dialog Box
			$("#winDialog").dialog({
				bgiframe: true,
				modal: true,
				autoOpen: false,
				width:400,
				buttons: {
					"Cool": function() {
						$(this).dialog('close');
						actions.startGame();
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
						actions.startGame();
					}
				}
			});
		}
	}

	var actions = {
		startFirstGame:function(){
			$("#intro").hide("drop",settings.dropAnimationOpts,function(){
				$("#gameOptions").show("drop",settings.dropAnimationOpts,function(){
					$("#guess").show("drop",settings.dropAnimationOpts, actions.startGame);
				});
			});
			return false;
		},
		startGame:function(){
			timer.stop();

			$("#hint").hide();
			$("#guesses, #photos,#preloadPhotos").empty();
			$("<li class='clear'></li>").appendTo("#guesses");
			$("#gameStuff").slideUp(settings.animationSpeed,settings.easing);
			numGuesses=0;
			$(".numOfGuesses").text(numGuesses);
			$("#guess #tag").val("").focus();

			currentTag = utilities.getTag();
			//get JSON data from Flickr
			utilities.getImages(currentTag.word);
		},
		guess:function(){
			guessedTag = $.trim($("#guess #tag").val().toLowerCase());
			if(guessedTag != ""){
				numGuesses++;
				$(".numOfGuesses").text(numGuesses);
				if(guessedTag==currentTag.word){
					//Correct!
					actions.winGame();
				}else{
					//Wrong!
					if(numGuesses==1) $("#gameStuff").slideDown(settings.animationSpeed,settings.easing);
					$("#guess #tag").effect("highlight",{"color":"#F00F00"},settings.animationSpeed).val("").focus();
					$("#guesses .clear").before("<li>"+guessedTag+"</li>")
					$("#guesses :nth-child("+numGuesses+")").hide().show(settings.animationSpeed,settings.easing);
				}
			}
		},
		winGame:function(){
			timer.stop();
			$('#winDialog').dialog('open');
		},
		loseGame:function(){
			timer.stop();
			$("#giveUpTag").text(currentTag.word);
			$('#loseDialog').dialog('open');

			return false;
		},
		displayHint:function(){
			var hintText = "The word is <strong>" + currentTag.categoryName + "</strong> and it has <strong>"+ currentTag.word.length + "</strong> letters."
			$("#hintText").html(hintText);
			$("#hint").show();
		}
	};

	var utilities = {
		getRandomFromArray:function(arr){
			return arr[Math.floor(Math.random() * arr.length)];
		},
		getTag:function(){
			var category = utilities.getRandomFromArray($Game.Words);

			return{
				categoryName: category.categoryName,
				word: utilities.getRandomFromArray(category.wordList).toLowerCase()
			}
		},
		getImages:function(tag){
			var loadedImgs=0;

			var getImagesUrl = "http://api.flickr.com/services/feeds/photos_public.gne?tags="+tag+"&tagmode=any&format=json&jsoncallback=?";
			$.getJSON(getImagesUrl,function(data){
				$.each(data.items, function(i,item){
					var image_medium = item.media.m;
					var image_large = image_medium.replace(/_m\.jpg/g,'.jpg');
					var image_small = image_medium.replace(/_m\.jpg/g,'_s.jpg');

					//Pre-load all the large images
					$("<img src='"+image_large+"' />").appendTo("#preloadPhotos");

					//Add the small images to the grid
					$("<img alt='' src='"+image_small+"'/>")
						.appendTo("#photos")
						.load(function(){
							$(this).wrap("<a href='"+image_large+"'></a>");
							$("#photos a").fancybox({
								'zoomSpeedIn':settings.animationSpeed,
								'zoomSpeedOut':settings.animationSpeed,
								'overlayShow': false,
								'hideOnContentClick':true
							});
							loadedImgs++;
							if(loadedImgs == settings.imagesToDisplay){
								//start timer once all images are loaded
								timer.start();
								loadedImgs=0;
							}
						});

					//Stop when we get enough images
					if (i == settings.imagesToDisplay-1) return false;
				});
			});
		}
	}

	var timer={
		interval: null,
		currentTime:0,
		start:function(){
			timer.currentTime = settings.gameDuration + 1;
			timer.tick();
		},
		tick:function(){
			timer.currentTime--;
			timer.update(timer.currentTime);
			if(timer.currentTime<=0){
				return actions.loseGame();
			}else{

				if(timer.currentTime === Math.round(settings.gameDuration/2)){
					actions.displayHint();
				}

				if(timer.currentTime === 10){
					$("#timer").animate({color:"#FF0000"},settings.animationSpeed);
				}
				timer.timeout = setTimeout(timer.tick,1000);
			}
		},
		stop:function(){
			clearTimeout(timer.timeout);
			timer.update(0);
			$("#timer").removeAttr("style");
		},
		update:function(time){
			var displayTime=time;
			if(time<10) displayTime="0"+time;
			$("#timer").text(":"+displayTime);
		}
	};

	//Need a return so we can extend this with the word list in another file
	return{};

}(jQuery);