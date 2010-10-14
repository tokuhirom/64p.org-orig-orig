use DBI;
use DBD::Pg ':async';
use strict;
use AE;
use Data::Dumper;

my $SQL = 'select 1';
my @cvs;

for my $i (0..10) {
    my $dbh = DBI->connect('dbi:Pg:dbname=foo;host=localhost', 'postgres','postgres',{AutoCommit=>0,RaiseError=>1,}, ) or die;
    my $sth = $dbh->prepare($SQL, {pg_async => PG_ASYNC});
    $sth->execute();

    my $cv = AE::cv();
    my $w; $w = AE::io($dbh->{pg_socket}, 0,
        sub {
            if ($sth->pg_ready) {
                warn Dumper([$i, $sth->pg_result]);
                $cv->send($w);
                $w;
            }
        }
    );
    push @cvs, $cv;
}
$_->recv for @cvs;
