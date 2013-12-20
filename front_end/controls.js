jQuery(function($) {
   RAD = $("#0").attr("r");
   RAD_PIXEL = parseFloat(RAD) / 100 * $("svg").width();
   SEP = parseFloat($("#0").attr("cx")) / 100 * $("svg").width()
   assignColorTags();
   attachConnectorHandlers();
});

var DIM = 6; // board side dimension
var RAD;  // circle radius (in percent of parent)
var RAD_PIXEL; // circle radius (in pixels)
var SEP;  // distance between circles

var DECAY = 0.8;

var score = 0;
function makeMove(ids) {
   score += ids.length;
   ids.sort();
   removeDuplicates(ids);
   $("#scoreboard div").html(score);

   shrinkDots(ids);
   animateFalls(computeFalls(ids), ids);
}

function shrinkDots(ids) {
   for (var i = 0; i < ids.length; i++) {
      $("#" + ids[i]).animate({tabIndex: 0}, {
         duration: 200,
         step: function(now, fx) {
            $(this).attr("r", (parseFloat($(fx.elem).attr("r")) * DECAY) + "%");
         },
         complete: function() {
            $(this).attr("r", "0%");
         }
      });
   }
}

function computeFalls(ids) {
   var fallDist = [];
   var emptyBelow = 0;
   for (var i = DIM * DIM - 1; i >= 0; i--) {
      if (i % DIM == DIM - 1)
         emptyBelow = 0;
      if (ids.indexOf(i) != -1)
         emptyBelow++;
      else
         fallDist[i] = emptyBelow;
   }
   return fallDist;
}

function animateFalls(fallDist, ids) {
   var svg = $("svg");
   for (var i = 0; i < fallDist.length; i++) {
      var dist = fallDist[i];
      if (dist != undefined && dist != 0) {
         var ghost = makeGhost($("#" + i), i + dist);
         ghostAnimate(ghost, svg);
      }
   }
   var newCounts = [0, 0, 0, 0, 0, 0];
   for (var i = 0; i < ids.length; i++) {
      newCounts[Math.floor(ids[i] / DIM)]++;
   }
   // load up fallDist[i] new dots to fall into empty spots
   for (var i = 0; i < newCounts.length; i++) {
      var top = $("#5");
      var x = (i + 1) * SEP;
      
      var r = RAD;
      for (var j = 0; j < newCounts[i]; j++) {
         var y = (j - newCounts[i]) * SEP + "%";
         var newDot = lineManager.makeCircle(x, y, r);
         $(newDot).attr("code", randInt(1, 7));
         var newDotGhost = makeGhost($(newDot), i * DIM + j);
         ghostAnimate(newDotGhost, svg);
      }
   }
}

function makeGhost(source, destId) {
   var ghost = $(lineManager.copyCircle(source));
   ghost.addClass("ghost");
   ghost.attr("dest", destId);
   source.attr("r", "0%");
   return ghost;
}

function ghostAnimate(ghost, svg) {
   var startY = parseFloat(ghost.attr("cy"));
   var endY = parseFloat($("#" + ghost.attr("dest")).attr("cy"))
   svg.prepend(ghost);
   ghost.animate({tabIndex: 0}, {
      duration: 200,
      easing: "linear",
      progress: ghostFallCallback(ghost, startY, endY),
      complete: ghostCompleteCallback(ghost)
   });
}

function ghostFallCallback(ghost, startY, endY) {
   return function(anim, prog, remaining) {
      ghost.attr("cy", (startY + (endY - startY) * prog) + "%");
   }
}

function ghostCompleteCallback(ghost) {
   return function() {
      var dest = $("#" + ghost.attr("dest"))
      dest.attr("code", ghost.attr("code"));
      dest.attr("r", ghost.attr("r"));
      ghost.remove();
   }
}

function assignColorTags() {
   var circles = $("circle");
   for (var i = 0; i < circles.length; i++) {
      var colorCode = randInt(1, 7);
      $(circles[i]).attr("code", colorCode);
   }
}

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
      if (lineManager.idChain.length > 1)
         makeMove(lineManager.idChain);
      lineManager.clearLines();
   });
}

function bindAdjacentDotListeners(id, first) {
   var svg = $("svg");
   svg.unbind("mousemove");
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
   
   if (lineManager.idChain.length > 1)
      svg.mousemove(retractChainCallback(target, svg));
}

function progressChainCallback(adj, adjId) {
   return function() {
      lineManager.pushLine(adjId);
      bindAdjacentDotListeners(adjId, false);
   }
}

function retractChainCallback(target, svg) {
   var xOffset = svg.position().left;
   var yOffset = svg.position().top;
   var prev = lineManager.idChain[lineManager.idChain.length - 2];
   var center = lineManager.getCenter($("#" + prev));

   return function(event) {
      var x = event.pageX - xOffset;
      var y = event.pageY - yOffset;
      var dist = Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2));
      if (dist < 3 * RAD_PIXEL) {
         lineManager.popLine();
         svg.unbind(event);
      }
   }
}

function unbindMouseoverListeners() {
   $("circle").unbind("mouseenter");
   $("circle").unbind("mouseleave");
}

function removeDuplicates(a) {
   for (var i = 0; i < a.length - 1;)
      if (a[i] == a[i + 1])
         a.splice(i, 1);
      else
         i++;
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

   copyCircle: function(elem) {
      return this.makeCircle(elem.attr("cx"), elem.attr("cy"),
                             elem.attr("r"), elem.attr("code"));
   },

   makeCircle: function(cx, cy, radius, code) {
      var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", radius);
      circle.setAttribute("code", code);
      return circle;
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