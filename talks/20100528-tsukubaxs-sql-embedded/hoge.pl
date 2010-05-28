use common::sense;
use Coro::Channel;
use Coro;

{
    package Ch;
use overload
    '-' => sub { $_[0]
    },
    '<' => sub {
        $_[2] ? $_[1] = - $_[0]->[0]->get() : $_[0]->[0]->put($_[1])
    },
;
    sub new { bless [Coro::Channel->new], $_[0] }
}

my $ch = Ch->new;
my $coro = async {
    my $x <- $ch;
    print "$x\n";
};
$ch <- 3;
$coro->join;
