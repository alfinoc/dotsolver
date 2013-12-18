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
		lineManager.setFollowerLine(event.target);
		lineManager.pushLine(parseInt($(this).attr("id")));
		bindAdjacentDotListeners(parseInt($(this).attr("id")), true)
	});
	$("body").mouseup(function() {
		$("#boardwrap").unbind();
		unbindMouseoverListeners();
		lineManager.clearLines();
	});
}

function bindAdjacentDotListeners(id, first) {
	unbindMouseoverListeners();
	var target = $("#" + id);
	lineManager.setFollowerLine(target);
	var code = target.attr("code");
	for (var i = 1; i < 9; i += 2) {
		var adjId = id - 1 - DIM + DIM * Math.floor(i / 3) + i % 3;
		var adj = $("#" + adjId);
		if (adj.attr("code") == code && !lineManager.containsPair(id, adjId))
			adj.mouseenter(progressChainCallback(adj, adjId));
	}
	// change this to: if mouseout in the direction of the connected piece, popLine

	target.mouseenter(function() {
		target.mouseleave(function() {
			lineManager.popLine();
		});
	});

	//target.mouseleave(retractChainCallback(target));
}

function progressChainCallback(adj, adjId) {
	return function() {
		lineManager.pushLine(adjId);
		bindAdjacentDotListeners(adjId, false);
	}
}

// to do: this is hard...
function retractChainCallback(target) {
	var svg = $("svg");
	var xOffset = svg.position().left;
	var yOffset = svg.position().top;
	var center = lineManager.getCenter(target);
	var prev = lineManager.idChain[lineManager.idChain - 2];


	return function(event) {
		var x = event.pageX - xOffset;
		var y = event.pageY - yOffset;
		// approximates a region of the dot that is closest to the previous
		// dot in the chain
		console.log(x < center[0]);
		console.log(Math.abs(y - center[1]) < 50);
		if (x < center[0] && Math.abs(y - center[1]) < 50)
			lineManager.popLine();
	}
}


function unbindMouseoverListeners() {
	$("circle").unbind("mouseenter");
	$("circle").unbind("mouseleave");
}

var lineManager = {
	idChain: [],
	lineChain: [],
	follower: null,
	pushLine: function(id) {
		var prev = this.idChain[this.idChain.length - 1];
		if (!this.containsPair(id, prev)) {
			this.idChain.push(id);
			this.lineChain.push(this.connect(id, prev));
		}
	},

	popLine: function() {
		if (this.idChain.length > 1) {
			this.idChain.pop();
			$(this.lineChain.pop()).remove();
			bindAdjacentDotListeners(this.idChain[this.idChain.length - 1]);
		}
	},

	setFollowerLine: function(fromElem) {
		if (this.follower != null)
			$(this.follower).remove();
		var svg = $("svg");
		var xOffset = svg.position().left;
		var yOffset = svg.position().top;
		var coord = this.getCenter($(fromElem));
		var line = this.buildLine(coord[0], coord[1], coord[0], coord[1]);

		svg.prepend(line);
		$("#boardwrap").mousemove(function(event) {
			line.setAttribute("x2", event.pageX - xOffset);
			line.setAttribute("y2", event.pageY - yOffset);
		});
		this.follower = line;
	},

	connect: function(idStart, idEnd) {
		if (idStart == undefined || idEnd == undefined) return;
		var start = this.getCenter($("#" + idStart));
		var end = this.getCenter($("#" + idEnd));
		var line = this.buildLine(start[0], start[1], end[0], end[1])
		$("svg").prepend(line);
		return $(line);
	},

	buildLine: function(x1, y1, x2, y2) {
		var line = document.createElementNS('http://www.w3.org/2000/svg','line');
		line.setAttribute("x1", x1);
		line.setAttribute("y1", y1);
		line.setAttribute("x2", x2);
		line.setAttribute("y2", y2);
		return line;
	},

	clearLines: function(id) {
		this.idChain = [];
		$("line").remove();
	},

	containsPair: function(first, second) {
		for (var i = 1; i < this.idChain.length; i++)
			if ((this.idChain[i] == second && this.idChain[i - 1] == first) ||
				(this.idChain[i] == first && this.idChain[i - 1] == second))
				return true;
		return false;
	},

	getCenter: function(elem) {
		var svg = $("svg");
		var xOffset = svg.position().left;
		var yOffset = svg.position().top;
		var radius = parseFloat(elem.attr("r")) / 100 * svg.width();
		var cx = elem.position().left - xOffset + radius;
		var cy = elem.position().top - yOffset + radius;
		return [cx, cy];
	}
}