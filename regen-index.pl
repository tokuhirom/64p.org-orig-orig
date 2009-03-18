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
    my $cwd = dir('.')->open;
    while (my $f = $cwd->read) {
        next unless -d $f;
        next unless $f =~ /^200/;
        push @f, $f;
    }
    @f;
}

__END__
? my $files = shift;
<html>
<body>
tokuhirom's slide
? for my $file (@$files) {
    <a href="<?= $file ?>"><?= $file ?></a>
? }
</body>
</html>
