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
? my $data = shift;
? my $titles = shift;
<html>
<head>
    <meta charset="utf-8" />
    <title>tokuhirom's slides</title>
    <link rel="stylesheet" href="static/bootstrap.min.css" />
    <style>
        body {
            margin-left: 20px;
            margin-top: 60px;
        }

        .clearfix {zoom:1;}
        .clearfix:after{
            content: "";
                display: block;
                    clear: both;}
        a:hover {
            text-decoration: none;
        }
        li {
            list-style: none;
            width: 200px;
            float: right;
            padding: 8px;
            border: #eeeeee 1px solid;
            margin: 2px;
            border-radius: 8px;
        }
        .title {
            font-size: 20px;
            line-height: 24px;
            word-break: break-all;
            color: black;
            height: 72px;
            overflow: hidden;
        }
    </style>
</head>
<body>
<div class="container">
<h1>tokuhirom's slide</h1>
? for my $year (@$data) {
    <div class="year clearfix">
    <h2><?= $year->{year} ?></h2>
<ul>
?   for my $file (@{$year->{files}}) {
    <li>
        <a href="/talks/<?= $file ?>">
            <div class="title"><?= $titles->{$file} || $file ?></div>
            <div class="date"><?= substr($file, 0, 8) ?></div>
        </a>
    </li>
?   }
</ul>
    </div>
? }
</div>
</body>
</html>
...

sub main {
    my @files = files();

    my %titles;
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
        $titles{$file} = $title;
    }

    my %data;
    for my $file (@files) {
        my $year = substr($file, 0, 4);
        push @{$data{$year}}, $file;
    }

    my $dat = [ map { +{ year => $_, files => $data{$_} } } reverse sort keys %data ];
    my $result = render_mt( $tmpl, $dat, \%titles )->as_string;
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

