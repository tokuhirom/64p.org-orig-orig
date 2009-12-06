(function () {

var Presen = {
    start_time: new Date()
};

Presen.init = function(data){
    this.data = data;

    this.init_sections();
    this.init_title();
    this.init_page();
    this.format_cache = new Array();
    this.rewrite();

    $("#total_page").html(Presen.sections.length);

    setInterval(
        Presen.cron, 1
    );
};

Presen.init_page = function () {
    if (location.hash == "") {
        this.page = 0;
    } else {
        this.page = Number(location.hash.substr(1));
    }
}

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
}
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

    $("#footer").css('top', ($(document).height() - 50) + "px");

    var body = $(window);
    var topic = $('#topics');
    // topic.html('<h1>'+[body.width(), topic.width(), $(document).width()].join(" ")+'</h1>');
    if (topic.width() > body.width()) {
        topic.html(' ' +topic.width() + " " + body.width());
    }

    $("#page_info").css('left', ($('body').width() - $('#page_info').width()) + "px");

    $("#topics pre").css("font-size", Presen.pre_font_size);
}

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
    var mode = "p";
    var pre_max = 0;
    $(lines).each(function(i, v){
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
            context.push(v.replace(/^\-\-/,"&nbsp;&nbsp;*").tag("span", "list_child") + "<br />");
            return;
        }
        if(/^\-/.test(v)){
            context.push(v.replace(/^\-+/,"●").tag("span","list") + '<br/>');
            return;
        }
        
        if (/^\>\|\|/.test(v)) { // >||
            mode = "pre";
            context.push("<pre>");
            return;
        }
        if (/^\|\|\</.test(v)) { // ||<
            mode = "p";
            context.push("</pre>");
            return;
        }
        
        if (mode=="pre") {
            pre_max = Math.max(v.length, pre_max);
            context.push(v.escapeHTML().replace("&lt;B&gt;", "<B>").replace("&lt;/B&gt;", "</B>").tag("span") + "\n");
        } else {
            context.push(v.tag("span") + "<br>");
        }
    });
    var pre_font_size = '' + parseInt($(window).width()/pre_max+10, 10) + "px";
    return [context.join(""), pre_font_size];
};

Presen.two_column = function (i) {
    var m = "" + i;
    if (m.length == 1) { m = "0"+m; }
    return m;
};

Date.prototype.hms = function () {
    return '' + this.getHours() + ":" + Presen.two_column(this.getMinutes()) + ":" + Presen.two_column(this.getSeconds());
}

String.prototype.tag = function(tag, classname){
    return ['<',tag, (classname ? " class='"+classname+"'" : ""), '>',this,'</',tag,'>'].join("");
}

String.prototype.escapeHTML = function () {
    return this.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
            alert(e) 
        }
    });

    Presen.observe_key_event();
});

})();

