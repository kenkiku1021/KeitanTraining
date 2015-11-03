$(function() {
    var QCOUNT = 10;
    
    var playSound = function(isCorrect, handler) {
	var sound;
	if(isCorrect) {
	    sound = $("#correct-sound");
	}
	else {
	    sound = $("#wrong-sound");
	}
	if(handler) {
	    sound.one("ended", handler);
	}
	sound[0].play();
    };

    var startStopBGM = function(flag) {
	var bgm = $("#bgm1")[0];
	if(flag) {
	    bgm.volume = 0.5;
	    bgm.play();
	}
	else {
	    bgm.pause();
	}
    };
    
    var showMenu = function() {
	var menuTemplate = _.template($("#menu-template").html());
	$("#main-container").html(menuTemplate());
	$("#is-addition-check").bootstrapSwitch({
	    offText: "ひきざん",
	    onText: "たしざん",
	    onColor: "warning",
	    offColor: "success",
	    size: "large",
	});
	$(".menu-btn").click(function(e) {
	    var qtype = $(this).data("qtype");
	    var qlevel = Number($(this).data("level"));
	    $("#menu").addClass("animated fadeOut");
	    $("#menu").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		startProbrem(qtype, qlevel);
	    });
	    startStopBGM(true);
	});
    };

    var startProbrem = function(qtype, qlevel) {
	var showProbrem = function(probrems) {
	    var probrem = probrems.pop();
	    if(probrem) {
		var probremTemplate = _.template($("#probrem-template").html());
		var question;
		var answer;
		question = probrem.formula;
		answer = probrem.answer;
		var cards = makeCards(answer);
		$("#main-container").html(probremTemplate({
		    question: question
		}));
		$("#cards-row").html(cards);
		$("#probrem").addClass("animated bounceInDown");
		$(".card-btn").click(function(e) {
		    var selectedAnswer = $(this).data("card");
		    if(answer == selectedAnswer) {
			// 正解
			var template = _.template($("#correct-answer-template").html());
			$("#main-container").html(template({
			    formula: probrem.formula,
			    answer: probrem.answer
			}));
			$("#next-probrem-btn").hide();
			$("#next-probrem-btn").click(function(e) {
			    showProbrem(probrems);
			});
			playSound(true, function() {
			    $("#next-probrem-btn").show();
			});
		    }
		    else {
			// 不正解
			disableCards();
			playSound(false, function() {
			    enableCards();
			});
		    }
		});
	    }
	    else {
		// 終了
		startStopBGM(false);
		showFinish();
	    }
	};

	var disableCards = function() {
	    $(".card-btn").attr("disabled","disabled");
	};

	var enableCards = function() {
	    $(".card-btn").removeAttr("disabled");
	};

    	var probrems = makeProbrems(qtype, qlevel);

	showProbrem(probrems);
    };

    var makeCards = function(answer) {
	var cardTemplate = _.template($("#card-template").html());
	var cards = [];
	var min, max;
	if(answer > 0 && answer <= 9) {
	    min = 1;
	    max = 9;
	}
	else if(answer >= 10 && answer <= 19) {
	    min = 10;
	    max = 19;
	}
	for(var i = min; i <= max; ++i) {
	    cards.push(cardTemplate({card: i}));
	}
	return cards;
    };

    var makeProbrems = function(qtype, qlevel) {
	var probrems = [];
	for(var i=0; i<=QCOUNT; ++i) {
	    if(qtype == "add") {
		probrems.push(makeAdditionalProbrem(qlevel));
	    }
	    else {
		probrems.push(makeSubtractProbrem(qlevel));
	    }
	}
	return probrems;
    };

    var makeAdditionalProbrem = function(qlevel) {
	var maxAnswer, minAnswer;
	var a, b, answer;
	switch(qlevel) {
	case 1:
	    minAnswer = 1;
	    maxAnswer = 9;
	    break;
	case 2:
	    minAnswer = 10;
	    maxAnswer = 19;
	    break;
	}
	while(!answer || answer < minAnswer || answer > maxAnswer) {
	    a = make_random(1, 9);
	    b = make_random(1, 9);
	    answer = a + b;
	}
	var probrem = {
	    formula: String(a) + "+" + String(b),
	    answer: answer
	};
	return probrem;
    };

    var makeSubtractProbrem = function(qlevel) {
	var a, b, answer;
	while(!answer || answer <= 0) {
	    switch(qlevel) {
	    case 1:
		a = make_random(1, 9);
		b = make_random(1, 9);
		break;
	    case 2:
		a = make_random(11, 19);
		b = make_random(1, 9);
		break;
	    }
	    answer = a - b;
	}
	var probrem = {
	    formula: String(a) + "-" + String(b),
	    answer: answer
	};
	return probrem;
    };

    var make_random = function(min, max) {
	var r = Math.floor(Math.random() * (max - min + 1) + min);
	return r;
    };
    
    var showFinish = function() {
	var sound = $("#finish-sound")[0];
	sound.play();
	var template = _.template($("#finish-template").html());
	$("#main-container").html(template());
	$("#retry-btn").click(function(e) {
	    showMenu();
	});
    };
    
    showMenu();
});
