#!/usr/bin/perl
package TGP;
use strict;
use warnings;
use Text::MicroTemplate ':all';
use File::Basename;

$|++;
binmode STDOUT, ':utf8';

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

    for my $file (@files) {
        my $htmlfile = "talks/$file/index.html";
        next unless -f $htmlfile;

        my ($fname) = glob("talks/$file/*.txt");
        $fname or die "Missing txt file in $file";
        open my $fh, '<:utf8', $fname or die "Cannot open file $fname: $!";
        my $title = <$fh>;
        $title =~ s{^TITLE::}{};
        $title =~ s/\n$//;
        $title =~ s/^\x{FEFF}//;
        print "$title talks/$file\n";
        replace_title($htmlfile, $title);
    }

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

sub replace_title {
    my ($filename, $title) = @_;
    open my $ifh, '<:utf8', $filename or die "Cannot open $filename: $!";
    my $src = do { local $/; <$ifh> };
    $src =~ s!<title>.+?</title>!<title>$title</title>!;
    close $ifh;

    open my $ofh, '>:utf8', $filename or die "Cannot open $filename: $!";
    print {$ofh} $src;
    close $ofh;
}

if ($0 eq __FILE__) {
    TGP->main();
}


1;

