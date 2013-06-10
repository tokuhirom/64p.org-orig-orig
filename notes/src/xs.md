XS
==

## Define constant variables

    BOOT:
        HV* stash = gv_stashpvn("Net::Drizzle", strlen("Net::Drizzle"), TRUE);
        newCONSTSUB(stash, "DRIZZLE_DEFAULT_TCP_HOST", newSVpv(DRIZZLE_DEFAULT_TCP_HOST, strlen(DRIZZLE_DEFAULT_TCP_HOST)));



