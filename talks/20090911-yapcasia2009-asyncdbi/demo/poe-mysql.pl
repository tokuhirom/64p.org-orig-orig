use strict;
use warnings;
use POE qw/Component::Drizzle/;

# set up libdrizzle session
POE::Component::Drizzle->spawn(
    alias    => 'drizzle',
    hostname => 'localhost',
    port     => 3306,
    username => 'root',
    password => '',
    database => 'test',
    options  => DRIZZLE_CON_MYSQL,
);

# create our own session to communicate with libdrizzle
POE::Session->create(
    inline_states => {
        _start => sub {
        warn 'start';
            $_[KERNEL]->post(
                'drizzle',
                do => {
                    sql =>
                        'create table if not exists users (id int, username varchar(100))',
                    event => 'table_created',
                },
            );
        },
        table_created => sub {
        warn 'created';
            my @sql = (
                'insert users into (1, "jkondo")',
                'insert users into (2, "reikon")',
                'insert users into (3, "nagayama")',
            );
            for (@sql) {
                $_[KERNEL]->post( 'drizzle', do => { sql => $_ } );
            }

            # This will let the existing queries finish, then shutdown
            $_[KERNEL]->post( 'drizzle', 'shutdown' );
        },
    },
);
POE::Kernel->run;
