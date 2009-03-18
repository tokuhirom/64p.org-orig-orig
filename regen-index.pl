#!/usr/bin/perl
use strict;
use warnings;
use Path::Class;
use Text::MicroTemplate ':all';

&main;exit;

sub main {
    my @files = files();
    my $tmpl = join '', <DATA>;
    print render_mt($tmpl, \@files)->as_string;
}

sub files {
    my @f;
    my $cwd = dir('talks')->open or die $!;
    while (my $f = $cwd->read) {
        next unless -d "talks/$f";
        next unless $f =~ /^200/;
        push @f, $f;
    }
    reverse sort { $a cmp $b } @f;
}

__END__
? my $files = shift;
<html>
<body>
tokuhirom's slide
<ul>
? for my $file (@$files) {
    <li><a href="/talks/<?= $file ?>"><?= $file ?></a></li>
? }
</ul>
</body>
</html>
