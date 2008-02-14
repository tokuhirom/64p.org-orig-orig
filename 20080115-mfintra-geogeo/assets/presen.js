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

// -------------------------------------------------------------------------

var Presen = {};
Presen.init = function(data){
    this.data = data;
    this.page = 0;

    this.init_sections();
    this.init_title();
    this.rewrite();

    var e = $("#page_info");
    e.css('position', "absolute");
    e.css('left', (window.innerWidth - 150) + "px");

    $("#total_page").html(Presen.sections.length);
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
}
Presen.prev = function(){
    if (! this.has_prev()) {
        return; // nop.
    }
    this.page--;
    this.rewrite();
};

Presen.update_footer = function () {
    var d = new Date();
    $("#time").html(d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());

    $("#current_page").html((Presen.page+1));

    // update footer size
    var footer = $("#footer");
    footer.css('top', (window.innerHeight - 50) + "px");
}

Presen.rewrite = function(){
    var p = this.page;
    $("#topics").html(this.format(this.sections[p]));
    $("#topics").css('display', "block");
};

Presen.format = function(lines){
    var context = [];
    var mode = "p";
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
            context.push(v.replace(/^\-\-/,"  *").tag("span", "list_child") + "<br />");
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
    return ['<',tag, (classname ? " class='"+classname+"'" : ""), '>',this,'</',tag,'>'].join("");
}

String.prototype.escapeHTML = function () {
    return this.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Presen.observe_key_event = function () {
    $(document).keydown(function(e) {
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
};

// -------------------------------------------------------------------------

$(function (){
    $.get('main.txt', function (text) {
        Presen.init(text.split("\n"));
    });

    Presen.observe_key_event();

    setInterval(
        Presen.update_footer, 1
    );
});

