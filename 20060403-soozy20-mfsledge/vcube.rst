===============
MF最新Sledge事情
===============
2006-04-03(Mon)

Tokuhiro Matsuno

Mobile Factory/Subtech

概要
----

- 最新スナップショット

2006年開発の基本方針
------------------

- DRY

 - 同じことを二度やんなボケ
 - コピペで済ますな!
 - 過度の Plugin 化
 - Mix-in の多用

- 規約をキツめにかける

- 「あの人にしかわからない」こと撲滅運動

 - ハネムーンナンバー

サーバ環境
---------

- svn(cvs から完全移行済)
- mysql
- qmail
- tinydns
- apache(1.3 系)

 - そのうち 2.x 系に移行するかも？

- perlbal/pound

開発環境
-------

- 一個のサーバにみんなで入って開発
- ケータイの実機でのチェックが必要!
- svk でノートで開発もありかも？

 - 屋外ハック？

ディレクトリ構成
--------------

::

  caspeee/conf/
  caspeee/htdocs/
  caspeee/script/
  caspeee/script/cron/
  caspeee/script/tmp/
  caspeee/template/
  site_perl/Caspeee/
  site_perl/Caspeee/Authorizer.pm
  site_perl/Caspeee/Authorizer/
  site_perl/Caspeee/Config.pm
  site_perl/Caspeee/Data.pm
  site_perl/Caspeee/Data/
  site_perl/Caspeee/Dispatcher.pm
  site_perl/Caspeee/Pages.pm
  site_perl/Caspeee/Pages/Mobile/
  site_perl/Caspeee/Pages/PC/

利用モジュール一覧
----------------

使ってる Sledge の Plugin はこんな感じですねー。とにかくプラグイン
にしまくる作戦。

MobileGate
==========
http://cvs.sourceforge.jp/cgi-bin/viewcvs.cgi/sledge/Sledge-MobileGate/

つかってます。全面的に再構成したいかも。(こまかいプラグインにチギ
りたい)

Cache
=====
http://search.cpan.org/~tokuhirom/Sledge-Plugin-Cache-0.01/

Memcached で cache するのに使ってます。Controller レベルでキャッシュ
の術。

AlwaysFillInForm
================
http://search.cpan.org/~tokuhirom/Sledge-Plugin-AlwaysFillInForm-0.02/

FillInForm は get の時でも効くようにしています。
# わざわざプラグインにする必要もないかもですが :-P

Download
========
http://cvs.sourceforge.jp/cgi-bin/viewcvs.cgi/sledge/Sledge-Plugin-Download/

ダウンロードさせるときにつかてる。かも。

Validator
=========
http://cvs.sourceforge.jp/cgi-bin/viewcvs.cgi/sledge/Sledge-Plugin-Validator/

validation はなんだかんだいってもまだこれ使ってる

(S::P::FormValidator::Simple に移行するやも？)

DebugScreen
===========
http://search.cpan.org/~tokuhirom/Sledge-Plugin-DebugScreen-0.07/

debug 時には必須!スタックトレース無しのデバッグは辛すぎっす。

Email::Japanese
===============
http://cvs.sourceforge.jp/cgi-bin/viewcvs.cgi/sledge/Sledge-Plugin-Download/
security 的な観点から S::P::Mailer からのりかえました(Mail header
injection 脆弱性対策)

NoCache
=======
http://cvs.sourceforge.jp/cgi-bin/viewcvs.cgi/sledge/Sledge-Plugin-NoCache/

cache してほしくねーページがあるのでー。

QRCode
======
http://search.cpan.org/~tokuhirom/Sledge-Plugin-QRCode-0.01/

モバイルな関係で QRCode の表示は割と頻繁に必要になるので。

CSRFDefender
============
http://search.cpan.org/~tokuhirom/Sledge-Plugin-CSRFDefender-0.01/

CSRF 対策。

Affiliate
=========
モバイル系のアフィリエイトサイトとの連携をがんばってくれる人。CPAN
にアップ予定。まだやってないけどナ。

AutoEscapeTT
============
Template::Stash::EscapeHTML で全部エスケープしてます。XSS 脆弱性対
策。

ShowImage
=========
画像の表示に。

CDBI のプラグイン
----------------

Class::DBI::Plugin::RetrieveAll
===============================
retrieve_all 時に並び順を指定できるです。ちょうべんりー。

Class::DBI::Pager
=================
みやーんの Pager。CDBI::P::Iterator と組み合わせないと死ねるので注
意がひつよう。

Class::DBI::Plugin::RetrieveFromSQL
===================================
C::P::SQLPlaceHolder。retrieve_from_sql で complex な SQL を書くと
きに綺麗にかける。

Class::DBI::Plugin::RandomStringColumn
======================================
10桁程度のランダムな文字列を行に振りたいときに使う。
(Screen Scraper 対策とか。)

Class::DBI::Plugin::CountSearch
===============================
条件にあてはまる行数を得る。count_search

Class::DBI::Plugin::AsFdat
==========================
FillInForm に渡すための object をつくる。

Class::DBI::FromSledge
======================
S::P::Validator と連携する。create_from_sledge と
update_from_sledge が使えるようになる。

S::P::FormValidator::Simple が導入されると、いらんくなるね。CDBI::FromForm で十分。

Class::DBI::Plugin::Iterator
============================
C::P::Pager と連携させて使うのです。

Class::DBI::Plugin::DigestColumns
=================================
パスワードとかを before_set_pw などのトリガーでハッシュにしてくれ
る。便利かも。

MF::Class::DBI::Plugin::MFDateTime
==================================
社内むけ DateTime wrapper。__PACKAGE__->datetime_column('created_on')
とか。

移行しちゃう？どうしちゃう？
-------------------------

- DBIC
- Catalyst

 - 今あるプラグインとかの移植作業をしないとー

- (いっそ)Rails
- apache2
- S::P::FormValidator::Simple
- S::P::DateTime

以上です
-------

Thank you.
