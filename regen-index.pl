#!/usr/bin/perl
package TGP;
use strict;
use warnings;
use Text::MicroTemplate ':all';
use File::Basename;

my $tmpl = <<'...';
<!doctype html>
? my $files = shift;
<html>
<head>
    <title>tokuhirom's slides</title>
</head>
<body>
tokuhirom's slide
<ul>
? for my $file (@$files) {
    <li><a href="/talks/<?= $file ?>"><?= $file ?></a></li>
? }
</ul>
</body>
</html>
...

sub main {
    my @files = files();
    my $result = render_mt($tmpl, \@files)->as_string;
    open my $fh, '>', 'index.html';
    print {$fh} $result;
    close $fh;
}

sub files {
    my @f;
    while (my $f = glob('talks/20*')) {
        push @f, basename($f);
    }
    reverse sort { $a cmp $b } @f;
}

if ($0 eq __FILE__) {
    TGP->main();
}


1;

