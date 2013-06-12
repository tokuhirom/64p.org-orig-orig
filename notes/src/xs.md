XS
==

## How to write?

    perldoc perlxstut
    perldoc perlxs
    perldoc perlguts
    perldoc perlapi

## How can I use Minilla for writing XS?

    minil new -p XS Acme::FooXS

## Define constant variables

    BOOT:
        HV* stash = gv_stashpvn("Net::Drizzle", strlen("Net::Drizzle"), TRUE);
        newCONSTSUB(stash, "DRIZZLE_DEFAULT_TCP_HOST", newSVpv(DRIZZLE_DEFAULT_TCP_HOST, strlen(DRIZZLE_DEFAULT_TCP_HOST)));



