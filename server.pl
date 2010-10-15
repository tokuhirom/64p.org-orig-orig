use strict;
use warnings;
use Plack::Builder;
use Plack::App::File;
use Path::Class;
use Plack::Loader;

my $ROOT = '.';

do 'regen-index.pl';
my $file = Plack::App::File->new({ root => '.' });
Plack::Loader->auto(@ARGV)->run(
    sub {
        my $env  = shift;
        my $path = $env->{PATH_INFO};
        TGP->main();
        if ( -d dir( $ROOT, $path ) ) {
            if ( $path !~ m{/$} ) {
                return [ 302, [ Location => "$path/" ], [] ];
            }
            else {
                $path .= "/index.html";
            }
        }
        return $file->call( { %$env, PATH_INFO => $path } );
    }
);

