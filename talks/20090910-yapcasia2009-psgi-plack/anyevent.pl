use strict;
use warnings;
use Plack::Loader;
use AnyEvent;
use Data::Dumper;

my $impl = Plack::Loader->load('AnyEvent', port => 8080);
$impl->run(sub {
    my ($env, $start_response) = @_;
    my $writer = $start_response->(200, ['Content-Type' => 'text/plain']);
    my $t; $t = AnyEvent->timer(
        after => 0,
        interval => 1,
        cb => sub {
            $t;
            $writer->write(time . "\n");
        }
    );
    return [];
});
warn Dumper($impl);
$impl->run_loop;

