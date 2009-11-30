use strict;
use warnings;
use Plack::Server::Standalone;
use Plack::Builder;
use Plack::App::File;
use Path::Class;

my $ROOT = '.';

my $file = Plack::App::File->new({ root => '.' });
my $server = Plack::Server::Standalone->new;
$server->run(sub {
    my $env = shift;
    my $path = $env->{PATH_INFO};
    if (-d dir($ROOT, $path)) {
        if ($path !~ m{/$}) {
            return [302, [Location => "$path/"], []];
        } else {
            $path .= "/index.html";
        }
    }
    return $file->call({%$env, PATH_INFO => $path});
});

