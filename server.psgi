use strict;
use Plack::Builder;
use Plack::App::File;
use Plack::Loader;
use File::Spec::Functions;

my $ROOT = '.';

do 'regen-index.pl' or die $@;
my $file = Plack::App::File->new({ root => '.' });

my $app = sub {
    my $env  = shift;
    my $path = $env->{PATH_INFO};
    TGP->regen();
    if ( -d catdir( $ROOT, $path ) ) {
        if ( $path !~ m{/$} ) {
            return [ 302, [ Location => "$path/" ], [] ];
        }
        else {
            $path .= "/index.html";
        }
    }
    return $file->call( { %$env, PATH_INFO => $path } );
}

