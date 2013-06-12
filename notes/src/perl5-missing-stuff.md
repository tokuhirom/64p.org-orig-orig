Perl5 missing stuff
===================

## boolean value

I suggest to add boolean value.

Add two new built-in functions.

    true()
    false()

## `->` style lambda

`->` style lambda is one of the great feature in Perl6.

    -> $x { ... }

is same as

    sub { my $x = shift; ... }

