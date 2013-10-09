(function () {
"use strict";
/*global $: false, document, setInterval, clearInterval, location, window, alert, _ */

var Presen = {
    start_time: new Date(),
    init: function (formatter, data) {
        this.formatter = formatter;
        this.data = data;

        this.init_sections();
        this.init_title();
        this.init_page();
        this.format_cache = [];
        this.rewrite();

        $("#total_page").html(Presen.sections.length);

        var self = this;

        setInterval(
            function () { self.cron(); }, 500
        );
    },
    init_page: function () {
        if (location.hash === "") {
            this.page = 0;
        } else {
            this.page = Number(location.hash.substr(1));
        }
    },
    init_sections: function() {
        this.sections = this.data.split('\n----\n');
    },
    init_title: function() {
        var title = this.sections[0].split(/\n/)[0];
        document.title = title;
        $("#title").html(title);
    },
    has_next: function () {
        return this.page < this.sections.length-1;
    },
    next: function () {
        if (!this.has_next()) {
            return;
        }
        this.page++;
        this.rewrite();
    },
    has_prev: function () {
        return this.page > 0;
    },
    prev: function(){
        if (! this.has_prev()) {
            return; // nop.
        }
        this.page--;
        this.rewrite();
    },
    cron: function () {
        var now = new Date();
        $("#time").html(now.hms());

        $("#current_page").html((Presen.page+1));

        var used_time = parseInt( (now - Presen.start_time)/1000, 10 );
        var used_min = parseInt(used_time/60.0, 10);
        var used_sec = parseInt( used_time - (used_min*60.0), 10 );
        $('#used_time').html('' + Presen.two_column(used_min) + ':' + Presen.two_column(used_sec));

        var body = $(window);
        var topic = $('#topics');
        if (topic.width() > body.width()) {
            topic.html(' ' +topic.width() + " " + body.width());
        }

        Presen.formatter.render(Presen.page_info);
    },
    rewrite: function() {
        var p = this.page;
        if (!this.format_cache[p]) {
            this.format_cache[p] = this.formatter.format(this.sections[p]);
        }
        $("#topics").html(this.format_cache[p][0]);
        this.page_info = this.format_cache[p];
        location.hash = "#" + p;
    },
    two_column: function (i) {
        var m = "" + i;
        if (m.length == 1) { m = "0"+m; }
        return m;
    },
    change_font_size: function (selector, factor) {
        var px = $(selector).css('font-size');
            px = parseInt(px.replace('px', ''), 10) + factor;
            px = "" + px + "px";
        $(selector).css('font-size', px);

        Presen.pre_font_size = parseInt(Presen.pre_font_size, 10) + factor + "px";
    }
};

Presen.Formatter = {
    'Takahashi': {
        format: function (src) {
            var lines = src.split(/\n/);

            var context = _.map(lines, function (v) {
                return '<span>' + v.replace(/`(.*?)`/g, '<code>$1</code>') + "</span><br>";
            });

            var w = _.chain(lines).map(function (v) {
                return v.length;
            }).max().value();
            var h = lines.length;

            var font_size = (
                '' + Math.min(
                    parseInt($(window).width()/w+10, 10),
                    parseInt($(window).height()/h-30, 10)
                ) + "px"
            );
            return [context.join("\n"), font_size];
        },
        render: function (page_info) {
            $("#topics").css("font-size", page_info[1]);
        }
    },
    'Hatena': {
        format_text: function (text) {
            return text.replace(/\\p\{WHITE FROWNING FACE\}/, '&#x2639;').replace(/\\p\{WHITE SMILING FACE\}/g, '&#x263a;').replace(/\\p\{BLACK SMILING FACE\}/g, '&#x263b;').replace(/`(.*?)`/g, '<code>$1</code>');
        },
        format: function (text) {
            var lines = text.split(/\n/);
            var context = [];
            var mode = "p";
            var pre_max = 0;
            $(lines).each(function(i, v){
                if(/^(\*\s)/.test(v)){
                    context.push(v.replace(/^\*+/, "").tag("h2"));
                    return;
                }
                if(/^(\*+)/.test(v)){
                    context.push(v.replace(/^\*+/, "").tag("h3"));
                    return;
                }
                if(/^\-\-/.test(v)){
                    context.push(Presen.Formatter.Hatena.format_text(v.replace(/^--/, '')).tag("div","list_child"));
                    return;
                }
                if(/^\-/.test(v)){
                    context.push(Presen.Formatter.Hatena.format_text(v.replace(/^-/, '')).tag("div","list"));
                    return;
                }
                
                if (/^\>\|\|/.test(v)) { // >||
                    mode = "pre";
                    context.push("<pre>");
                    return;
                }
                if (/^\|\|</.test(v)) { // ||<
                    mode = "p";
                    context.push("</pre>");
                    return;
                }
                
                if (mode=="pre") {
                    pre_max = Math.max(v.length, pre_max);
                    context.push(_.escape(v).replace("&lt;B&gt;", "<B>").replace("&lt;/B&gt;", "</B>").tag("span") + "\n");
                } else {
                    context.push(Presen.Formatter.Hatena.format_text(v).tag("span") + "<br>");
                }
            });
            var pre_font_size = '' + parseInt($(window).width()/pre_max+10, 10) + "px";
            return [context.join(""), pre_font_size];
        },
        render: function (page_info) {
            $("#topics pre").css("font-size", page_info[1]);
        }
    }
};

Date.prototype.hms = function () {
    return '' + Presen.two_column(this.getHours()) + ":" + Presen.two_column(this.getMinutes()) + ":" + Presen.two_column(this.getSeconds());
};

String.prototype.tag = function(tag, classname){
    return ['<',tag, (classname ? " class='"+classname+"'" : ""), '>',this,'</',tag,'>'].join("");
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
            var formatter = Presen.Formatter.Hatena;
            var matched = text.match(/^Format: \s*(.*)\n/);
            if (matched) {
                var format = matched[1];
                formatter = Presen.Formatter[format];
                if (!formatter) {
                    alert("Unknown format: " + format);
                }
                text = text.substr(matched[0].length);
            }
            Presen.init(formatter, text);
        } catch(e) {
            alert(e);
        }
    });
    $('body').addClass('takahashi');

    Presen.observe_key_event();
});

})();

