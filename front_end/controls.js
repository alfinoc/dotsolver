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
		$(circles[i]).attr("code", colorCode);
	}
}

// returns a random integer between min and max exclusive
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function attachConnectorHandlers() {
	$("circle").mousedown(function(event) {
		makeFollowerLine(event.target);
		pushLine(parseInt($(this).attr("id")));
		bindAdjacentDotListeners(parseInt($(this).attr("id")), true)
	});
	$("body").mouseup(function() {
		$("#boardwrap").unbind();
		unbindMouseoverListeners();
		clearLines();
	});
}

function bindAdjacentDotListeners(id, first) {
	unbindMouseoverListeners();
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
		pushLine(adjId);
		bindAdjacentDotListeners(adjId, false);
	}
}

function makeFollowerLine(fromElem) {
	var svg = $("svg");
	var xOffset = svg.position().left;
	var yOffset = svg.position().top;
	var coord = getCenter($(fromElem));
	var line = makeLine(coord[0], coord[1], coord[0], coord[1]);

	svg.prepend(line);
	$("#boardwrap").mousemove(function(event) {
		line.setAttribute("x2", event.pageX - xOffset);
		line.setAttribute("y2", event.pageY - yOffset);
	});
}

function makeLine(x1, y1, x2, y2) {
	var line = document.createElementNS('http://www.w3.org/2000/svg','line');
	line.setAttribute("x1", x1);
	line.setAttribute("y1", y1);
	line.setAttribute("x2", x2);
	line.setAttribute("y2", y2);
	return line;
}

var idChain = [];
var lineChain = [];
function pushLine(id) {
	var prev = idChain[idChain.length - 1];
	if (!containsPair(id, prev)) {
		idChain.push(id);
		lineChain.push(connect(id, prev));
		console.log("pushed! idChain: " + idChain);
	}
}

function popLine(id) {
	if (idChain.length > 1) {
		idChain.pop(id);
		bindAdjacentDotListeners(idChain[idChain.length - 1]);
		console.log("popped! idChain: " + idChain);
	}
}

function clearLines(id) {
	idChain = [];
	$("line").remove();
}

function containsPair(first, second) {
	for (var i = 1; i < idChain.length; i++)
		if ((idChain[i] == second && idChain[i - 1] == first) ||
			(idChain[i] == first && idChain[i - 1] == second))
			return true;
	return false;
}

function connect(idStart, idEnd) {
	if (idStart == undefined || idEnd == undefined) return;
	var start = getCenter($("#" + idStart));
	var end = getCenter($("#" + idEnd));
	var line = makeLine(start[0], start[1], end[0], end[1])
	$("svg").prepend(line);
	return $(line);
}

function getCenter(elem) {
	var svg = $("svg");
	var xOffset = svg.position().left;
	var yOffset = svg.position().top;
	var radius = parseFloat(elem.attr("r")) / 100 * svg.width();
	var cx = elem.position().left - xOffset + radius;
	var cy = elem.position().top - yOffset + radius;
	return [cx, cy];
}

function unbindMouseoverListeners() {
	$("circle").unbind("mouseenter");
	$("circle").unbind("mouseleave");
}