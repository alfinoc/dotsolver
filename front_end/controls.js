jQuery(function($) {
	assignColorTags();
	attachConnectorHandlers();
});

DIM = 6
var colors = ["transparent", "blue", "orange", "red",
						"purple", "green", "yellow"];


function assignColorTags() {
	var circles = $("circle");
	for (var i = 0; i < circles.length; i++) {
		var colorCode = randInt(1, 7);
		//$(circles[i]).attr("fill", colors[colorCode]);
		$(circles[i]).attr("code", colorCode);
		$(circles[i]).addClass("1");
	}
}

// returns a random integer between min and max exclusive
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function attachConnectorHandlers() {
	var svg = $("svg");
	var xOffset = svg.position().left;
	var yOffset = svg.position().top;
	$("circle").mousedown(function(event) {
		var radius = parseFloat($(event.target).attr("r")) / 100 * svg.width();
		var startX = $(event.target).position().left - xOffset + radius;
		var startY = $(event.target).position().top - yOffset + radius;
		var line = makeLine(startX, startY, startX, startY);

		svg.prepend(line);
		bindAdjacentDotListeners(parseInt($(this).attr("id")), true)
		$("#boardwrap").mousemove(function(event) {
			line.setAttribute("x2", event.pageX - xOffset);
			line.setAttribute("y2", event.pageY - yOffset);
		});
		$("body").mouseup(function() {
			$("#boardwrap").unbind();
			$("line").remove();
		})
	});
	$("circle").mouseup(function() {
		unbindMouseoverListeners();
		clearLines();
	});
}

function bindAdjacentDotListeners(id, first) {
	unbindMouseoverListeners();
	pushLine(id);
	var target = $("#" + id);
	var code = target.attr("code");
	for (var i = 1; i < 9; i += 2) {
		var adjId = id - 1 - DIM + DIM * Math.floor(i / 3) + i % 3;
		var adj = $("#" + adjId);
		if (adj.attr("code") == code && !containsPair(id, adjId)) {
			adj.mouseenter(mouseoverCallback(adj, adjId));
			adj.attr("stroke", "black");
		}
	}
	target.mouseenter(function() {
		target.mouseleave(function() {
			popLine(adjId);
		});
	});
}

function mouseoverCallback(adj, adjId) {
	return function() {
		bindAdjacentDotListeners(adjId, false);
	}
}

function makeLine(x1, y1, x2, y2) {
	var line = document.createElementNS('http://www.w3.org/2000/svg','line');
	line.setAttribute("x1", x1);
	line.setAttribute("y1", y1);
	line.setAttribute("x2", x2);
	line.setAttribute("y2", y2);
	return line;
}

var linestack = [];
function pushLine(id) {
	if (!containsPair(id, linestack[linestack.length - 1])) {
		linestack.push(id);
		console.log("pushed! linestack: " + linestack);
	}
}
function popLine(id) {
	linestack.pop(id);
	bindAdjacentDotListeners(linestack[linestack.length - 1]);
	console.log("popped! linestack: " + linestack);
}
function clearLines(id) {
	linestack = []
}
function containsPair(first, second) {
	for (var i = 1; i < linestack.length; i++)
		if ((linestack[i] == second && linestack[i - 1] == first) ||
			(linestack[i] == first && linestack[i - 1] == second))
			return true;
	return false;
}

function unbindMouseoverListeners() {
	$("circle").unbind("mouseenter");
	$("circle").unbind("mouseleave");
}







