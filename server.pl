use strict;
use warnings;
use Plack::Builder;
use Plack::App::File;
use HTTP::Server::PSGI;
use Path::Class;

my $ROOT = '.';

do 'regen-index.pl';
my $file = Plack::App::File->new({ root => '.' });
my $server = HTTP::Server::PSGI->new();
$server->run(sub {
    my $env = shift;
    my $path = $env->{PATH_INFO};
    TGP->main();
    if (-d dir($ROOT, $path)) {
        if ($path !~ m{/$}) {
            return [302, [Location => "$path/"], []];
        } else {
            $path .= "/index.html";
        }
    }
    return $file->call({%$env, PATH_INFO => $path});
});

