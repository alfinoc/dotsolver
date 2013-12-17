jQuery(function($) {
	assignColorTags();
	attachConnectorHandlers();
});

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
	$("circle").mousedown(function() {
		//var line = $(document.createElement("line"));
		var line = document.createElementNS('http://www.w3.org/2000/svg','line');
		var radius = parseFloat($(this).attr("r")) / 100 * svg.width();
		var startX = $(this).position().left - xOffset + radius;
		var startY = $(this).position().top - yOffset + radius;
		line.setAttribute("x1", startX);
		line.setAttribute("y1", startY);
		line.setAttribute("x2", startX);
		line.setAttribute("y2", startY);
		svg.prepend(line);
		$("#boardwrap").mousemove(function(event) {
			line.setAttribute("x2", event.pageX - xOffset);
			line.setAttribute("y2", event.pageY - yOffset);
		});
		$("body").mouseup(function() {
			$("#boardwrap").unbind();
			$("line").remove();
		})
	});
}