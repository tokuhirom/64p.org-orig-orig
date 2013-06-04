/*
$_.takahashi = function(){
	with(this){
		var page = input.value.split("----");
		if(!page[offset]){
			offset = page.length-1;
		}
		$("#page_navi").innerHTML = (offset+1) + "/" + page.length;
		with(output.style){
			fontSize = "10px";
			display  = "inline";
		}
		output.innerHTML = page[offset].
			replace(/^[\r\n]+/g,"").replace(/[\r\n]+$/g,"").replace(/(\r\n|[\r\n])/g,"<br>");
		var body_w = document.body.offsetWidth;
		var body_h = document.body.offsetHeight;
		var output_w = output.offsetWidth;
		var new_fs = Math.ceil((body_w/output_w) * 9);
		if(new_fs > 10000){return}
		with(output.style){
			fontSize = new_fs + "px";
			display  = "block";
		}
		var output_h = output.offsetHeight;
		if(output_h > body_h){
			var new_fs = Math.ceil((body_h/output_h) * new_fs * 0.85);
			with(output.style){
				fontSize = new_fs + "px";
			}
		}
	}
};
*/
(function () {

var Presen = {
    start_time: new Date()
};

Presen.init = function(data){
    this.data = data;

    this.init_sections();
    this.init_title();
    this.init_page();
    this.format_cache = [];
    this.rewrite();

    $("#total_page").html(Presen.sections.length);

    setInterval(
        Presen.cron, 1
    );
};

Presen.init_page = function () {
    if (location.hash === "") {
        this.page = 0;
    } else {
        this.page = Number(location.hash.substr(1));
    }
};

Presen.init_sections = function () {
    var sections = [[]];
    var topic_reg = /^----/;
    $(this.data).each(function (i, line) {
        if (topic_reg.test(line)){
            sections.push([line]);
        } else {
            sections[sections.length-1].push(line);
        }
    });
    this.sections = sections;
};

Presen.init_title = function () {
    var titles = this.sections[0];
    document.title = titles[0];
    $("#title").html(titles[0]);
};

Presen.has_next = function(){
    return this.page < this.sections.length-1;
};
Presen.next = function(){
    if (!this.has_next()) {
        return;
    }
    this.page++;
    this.rewrite();
};

Presen.has_prev = function(){
    return this.page > 0;
};
Presen.prev = function(){
    if (! this.has_prev()) {
        return; // nop.
    }
    this.page--;
    this.rewrite();
};

Presen.cron = function () {
    var now = new Date();
    $("#time").html(now.hms());

    $("#current_page").html((Presen.page+1));

    var used_time = parseInt( (now - Presen.start_time)/1000, 10 );
    var used_min = parseInt(used_time/60.0, 10);
    var used_sec = parseInt( used_time - (used_min*60.0), 10 );
    $('#used_time').html('' + Presen.two_column(used_min) + ':' + Presen.two_column(used_sec));

    $("#footer").css('top', ($(window).height() - 40) + "px");

    var body = $(window);
    var topic = $('#topics');
    // topic.html('<h1>'+[body.width(), topic.width(), $(document).width()].join(" ")+'</h1>');
    if (topic.width() > body.width()) {
        topic.html(' ' +topic.width() + " " + body.width());
    }

    $("#topics").css("font-size", Presen.pre_font_size);
};

Presen.rewrite = function(){
    var p = this.page;
    if (!this.format_cache[p]) {
        this.format_cache[p] = this.format(this.sections[p]);
    }
    $("#topics").html(this.format_cache[p][0]);
    this.pre_font_size = this.format_cache[p][1];
    location.hash = "#" + p;
};

Presen.format = function(lines){
    var context = [];
    var w = 0;
    var h = lines.length;
    $(lines).each(function(i, v){
        if (/^----$/.test(v)) {
            return; // page separater
        }

        w = Math.max(v.length, w);
        context.push(v.replace(/`(.*?)`/g, '<code>$1</code>').tag("span") + "<br>");
    });
    var pre_font_size = (
        '' + Math.min(
            parseInt($(window).width()/w+10, 10),
            parseInt($(window).height()/h-30, 10)
        ) + "px"
    );
    return [context.join(""), pre_font_size];
};

Presen.two_column = function (i) {
    var m = "" + i;
    if (m.length == 1) { m = "0"+m; }
    return m;
};

Date.prototype.hms = function () {
    return '' + Presen.two_column(this.getHours()) + ":" + Presen.two_column(this.getMinutes()) + ":" + Presen.two_column(this.getSeconds());
};

String.prototype.tag = function(tag, classname){
    return ['<',tag, (classname ? " class='"+classname+"'" : ""), '>',this,'</',tag,'>'].join("");
};

String.prototype.escapeHTML = function () {
    return this.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

Presen.change_font_size = function (selector, factor) {
    var px = $(selector).css('font-size');
        px = parseInt(px.replace('px', ''), 10) + factor;
        px = "" + px + "px";
    $(selector).css('font-size', px);

    Presen.pre_font_size = parseInt(Presen.pre_font_size, 10) + factor + "px";
};

Presen.observe_key_event = function () {
    $(document).keydown(function(e) {
        switch(e.keyCode){
            case 82: // r
                location.reload();
                break;
            
            case 80: // p
            case 75: // k
            case 38: Presen.prev();e.stopPropagation();break;
            
            case 78: // n
            case 74: // j
            case 40: Presen.next();e.stopPropagation();break;

            case 70: // f
                $('#footer').toggle();
                e.stopPropagation();
                break;

            case 190: // > and .
                Presen.change_font_size('#topics', +10);
                break;
            case 188: // < and ,
                Presen.change_font_size('#topics', -10);
                break;
        }
    });
};

// -------------------------------------------------------------------------

$(function (){
    $.get('main.txt', function (text) {
        try {
            Presen.init(text.split("\n"));
        } catch(e) {
            alert(e);
        }
    });
    $('body').addClass('takahashi');

    Presen.observe_key_event();
});

})();

