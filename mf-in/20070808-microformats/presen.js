window.onload = init;
var Event = {};
Event.stop = function(e){
	Event.stopAction(e);
	Event.stopEvent(e);
};
Event.stopAction = function(e){
	e.preventDefault ? e.preventDefault() : (e.returnValue = false)
};
Event.stopEvent = function(e){
	e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true)
};

function $(id){ return document.getElementById(id) }
function addEvent(obj, evType, fn, useCapture){
	if(obj.addEventListener){
		obj.addEventListener(evType, fn, useCapture);
	}else if (obj.attachEvent){
		obj.attachEvent("on"+evType, fn);
	}
}

function update_footer() {
	var d = new Date();
	$("time").innerHTML = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	$("current_page").innerHTML = (Presen.page+1);
}

function init(){
	var req = new _XMLHttpRequest();
	req.open("GET", "seminar.txt", true);
	req.onload = function(){
		var text = req.responseText;
		if (navigator.userAgent.indexOf("KHTML") != -1) {
			var esc = escape(text);
			text = (esc.indexOf("%u") < 0 && esc.indexOf("%") > -1) ? decodeURIComponent(esc) : text;
		}
		var lines = text.split("\n");
		Presen.init(lines);
	}
	req.send(null);
	addEvent(document, "keydown", function(e){
		var s = Event.stop;
		switch(e.keyCode){
			case 13: e.shiftKey?Presen.prev():Presen.next();s(e);break;
			
			case 80: // p
			case 75: // k
			case 38: Presen.prev();s(e);break;
			
			case 78: // n
			case 74: // j
			case 40: Presen.next();s(e);break;
		}
	});
	// opera
	addEvent(document, "keypress", function(e){
		var s = Event.stop;
		switch(e.keyCode){
			case 13: s(e);break;
			case 38: s(e);break;
			case 40: s(e);break;
		}
	});
	setInterval(
		update_footer, 1
	);
}

var Presen = {};
Presen.init = function(data){
	this.data = data;
	var sections = [[]];
	var topic_reg = /^----/;
	// var topic_reg = /^\*/;
	this.data.forEach(function(v,i){
		if (topic_reg.test(v)){
			sections.push([v]);
		} else {
			sections[sections.length-1].push(v);
		}
	});
	this.sections = sections;
	var count = 0;
	$("topics").innerHTML = "<ol>" + this.sections.map(function(body, i){
		return "<li id='li_"+ i +"'><div class='page' id='div_" + i + "'></div></li>"
	}).join("") + "</ol>";
	this.page = 0;
	
	// init title
	var titles = this.sections[0];
	document.title = titles[0];
	$("title").innerHTML = titles[0];
	
	// show title
	this.rewrite();
	
	// init footer
	$("footer").style.top  = (window.innerHeight - 40) + "px";
	$("footer").style.height = "40px";

	var e = $("page_info");
	e.style.position  = "absolute";
	e.style.left = (window.innerWidth - 150) + "px";
	$("total_page").innerHTML = Presen.sections.length;
};

Presen.has_next = function(){
	return this.page < this.sections.length-1;
};
Presen.next = function(){
	if (!this.has_next()) {
		return;
	}
	this.hide();
	this.page++;
	this.rewrite();
};

Presen.has_prev = function(){
	return this.page > 0;
}
Presen.prev = function(){
	if (! this.has_prev()) {
		return; // nop.
	}
	this.hide();
	this.page--;
	this.rewrite();
};

Presen.hide = function() {
	$("div_" + this.page).style.display = "none";
	$("li_" + this.page).className = "";
};
Presen.rewrite = function(){
	var p = this.page;
	this.focus($("li_" + p));
	$("div_" + p).innerHTML = this.formatter(this.sections[p]);
	$("div_" + p).style.display = "block";
};

Presen.focus = function(el){
	el.className = "focus";
	setTimeout(function(){
		document.body.scrollTop = el.offsetTop;
	}, 100);
};

Presen.formatter = function(lines){
	var context = [];
	var mode = "p";
	lines.forEach(function(v, i){
        if (/^----$/.test(v)) {
            return; // page separater
        }

		if(/^(\*\s)/.test(v)){
			context.push(v.replace(/^\*+/, "").tag("h2"));
			return;
		}
		if(/^(\*+)/.test(v)){
			context.push(v.replace(/^\*+/, "").tag("h3"));
			return;
		}
		if(/^\-\-/.test(v)){
			context.push(v.replace(/^\-\-/,"  ¡¦").tag("span", "list_child"));
			return;
		}
		if(/^\-/.test(v)){
			context.push(v.replace(/^\-+/,"").tag("span","list"));
			return;
		}
		
		if (/^\>\|\|/.test(v)) {
			mode = "pre";
			context.push("<pre>");
			return;
		}
		if (/^\|\|\</.test(v)) {
			mode = "p";
			context.push("</pre>");
			return;
		}
		
		if (mode=="pre") {
			context.push(v.escapeHTML().tag("span") + "\n");
		} else {
			context.push(v.tag("span") + "<br>");
		}
	});
	return context.join("");
};

String.prototype.tag = function(tag, classname){
	return ['<',tag, (classname?" class='"+classname+"'":""), '>',this,'</',tag,'>'].join("");
}

String.prototype.escapeHTML = function () {
    return this.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
