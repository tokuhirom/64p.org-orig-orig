use DBD::Pg ':async';
use AE;
use Data::Dumper;

my $num = 10;
my @dbhs;
my @sths;
for (0..$num) {
    $dbhs[$_] = DBI−>connect('dbi:Pg:dbname=postgres;host=slave$_', 'postgres', '', {AutoCommit=>0,RaiseError=>1});
}

my $SQL = "SELECT count(*) FROM largetable WHERE flavor='blueberry'";

$sths[$_] = $dbhs[$_]−>prepare($SQL, {pg_async => PG_ASYNC}) for 0..1;
$_−>execute() for @sths;

my @cvs;
for my $i (0..$num) {
    $watcher{$i} = AE::io($dbh[$i]->{pg_socket}, 0,
                          sub {
                              if ($sth[$i]->pg_ready) {
                                  $cv->send($sth[$i]->fetchall_arrayref);
                              }
                          });
}
warn Dumper($_->recv) for @cvs;

# -------------------------------------------------------------------------

use DBD::drizzle;
use AE;

my $num = 10;

my @dbhs;
my @sths;
for (0..$num) {
    $dbhs[$_] = DBI−>connect('dbi:drizzle:dbname=test_drizzle', 'root', '', {AutoCommit=>0,RaiseError=>1, drizzle_async => 1});
}

my $SQL = "SELECT $num";

$sths[$_] = $dbhs[$_]−>prepare($SQL, {pg_async => PG_ASYNC}) for 0..1;
$_−>execute() for @sths;

my @cvs;
for my $_i (0..1) {
    my $i = $_i;
    my $cv = AE::cv();
    $watcher{$i} = AE::io($dbh[$i]->{pg_socket}, 0,
                          sub {
                              if ($sth[$i]->drizzle_ready) {
                                  $cv->send($sth[$_]->fetchall_arrayref());
                              }
                          });
    push @cvs, $cv;
}
warn Dumper($_->recv) for @cvs;

drizzle_con_fd(con);
drizzle_add_options(drizzle, DRIZZLE_NON_BLOCKING)
