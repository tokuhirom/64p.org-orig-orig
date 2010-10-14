#include "EXTERN.h"
#include "perl.h"
#include "XSUB.h"
#include "xs_hints.h"
#include "ppport.h"

#define sv_is_glob(sv) (SvTYPE(sv) == SVt_PVGV)
#define sv_is_regexp(sv) (SvTYPE(sv) == SVt_REGEXP)
#define sv_is_string(sv) \
	(!sv_is_glob(sv) && !sv_is_regexp(sv) && \
	 (SvFLAGS(sv) & (SVf_IOK|SVf_NOK|SVf_POK|SVp_IOK|SVp_NOK|SVp_POK)))

// -----------------------------------------------------
// allocate global vars.
static SV *hintkey_sv;                                              // key for hinthash
static int (*next_keyword_plugin)(pTHX_ char *, STRLEN, OP **);     // next plugin code for next chain

// -----------------------------------------------------
// the parser
static OP *THX_do_parse_sql(pTHX_ const char *prefix, STRLEN len) {
    // PerlIO_printf(PerlIO_stderr(), "K: %s\n", prefix);
	OP *op;
    SV *buf = newSVpv(prefix, len);
	while(1) {
        I32 c;
		c = lex_peek_unichar(0);
        switch (c) {
        case -1: // reached the end of the input text
            croak("reached to unexpected EOF in parsing embedded SQL");
        case ';': // finished.
            lex_read_unichar(0);
            goto FINISHED;
        default: /* push to buffer */
            // PerlIO_printf(PerlIO_stderr(), "%c\n", c);
            sv_catpvn(buf, (char*)&c, 1);
            lex_read_unichar(0);
        }
    }
FINISHED:
    // PerlIO_printf(PerlIO_stderr(), "%s\n", SvPV_nolen(buf));
    op = newUNOP(
            OP_ENTERSUB,
            OPf_STACKED,
            Perl_append_elem(OP_LIST,
                Perl_prepend_elem(OP_LIST,
                    newSVOP(OP_CONST, 0, newSVpvn("SQL::Keyword", sizeof("SQL::Keyword")-1)),
                    newSVOP(OP_CONST, 0, buf)),
                newUNOP(OP_METHOD, 0,
                    newSVOP(OP_CONST, 0, newSVpvn("SQL::Keyword::_run", sizeof("SQL::Keyword::_run")-1)))));
    return op;
}
#define do_parse_sql(x) THX_do_parse_sql(aTHX_ x, sizeof(x)-1)

// -----------------------------------------------------
// hook code
#define MY_CHECK(x) \
    if (keyword_len == sizeof(x)-1 && strnEQ(keyword_ptr, x, sizeof(x)-1) && hint_active(hintkey_sv)) { \
		*op_ptr = do_parse_sql(x " "); \
		return KEYWORD_PLUGIN_EXPR; \
    }
static int my_keyword_plugin(pTHX_
	char *keyword_ptr, STRLEN keyword_len, OP **op_ptr)
{
    MY_CHECK("SELECT");
    MY_CHECK("EXEC");
    MY_CHECK("INSERT");
    MY_CHECK("UPDATE");
    MY_CHECK("DELETE");
    MY_CHECK("REPLACE");

    return next_keyword_plugin(aTHX_ keyword_ptr, keyword_len, op_ptr);
}

MODULE = SQL::Keyword PACKAGE = SQL::Keyword

BOOT:
    // initialize key for hinthash
	hintkey_sv = newSVpvs_share("SQL::Keyword");

    // inject my code to hook point.
	next_keyword_plugin = PL_keyword_plugin;
	PL_keyword_plugin = my_keyword_plugin;

void
import(SV *classname, ...)
PPCODE:
    hint_enable(hintkey_sv);

void
unimport(SV *classname, ...)
PPCODE:
    hint_disable(hintkey_sv);

