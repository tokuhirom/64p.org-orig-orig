package Pyuuta;
use strict;
use warnings;
use Module::Compile -base;

our %MAP = (
    'もし'           => 'if',
    'もしくは'       => 'elsif',
    'ではない場合'   => 'else',
    '抜ける'         => 'last',
    'やり直し'       => 'redo',
    '送る'           => 'next',
    '続ける'         => 'while',
    '戻る'           => 'return',
    '出口'           => 'exit',
    '書く'           => 'print',
    'ここだけの話'   => 'my',
    '置いといて'     => 'local',
    'ぶっちゃけた話' => 'our',
    '開く'           => 'open',
    '閉じる'         => 'close',
    '結ぶ'           => 'tie',
    '解く'           => 'untie',
    '並べる'         => 'sort',
    '選び取る'       => 'grep',
    '変換する'       => 'map',
    '切り分ける'     => 'split',
    '繋げる'         => 'join',
    '新しい'         => 'new',
    'これだけする'   => 'foreach',
    'する'           => 'do',
    'さぶ'           => 'sub',
    '死ね'           => 'die',
);

sub pmc_compile {
    my ($class, $source) = @_;
    my $regex = join '|', map quotemeta, sort { length $b <=> length $a } keys %MAP;
    $source =~ s/($regex)/$MAP{$1}/og;
    return $source;
}

1;
