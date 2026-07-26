#!/usr/bin/perl
# Rewrites a screen's signature so global game state comes from useGame()
# instead of props. Callbacks and per-call-site data stay props.
# Refactor tooling -- not shipped with the game.
#
# Usage: perl .claude/tocontext.pl <file.js> <relative-prefix-to-src>

use strict;
use warnings;

my ($file, $prefix) = @ARGV;
die "usage: tocontext.pl <file> <prefix>\n" unless $file && $prefix;

# Props that must stay props: callbacks and values that differ per call site.
my %KEEP = map { $_ => 1 } qw(
  onBack onEvolve onBananaUsed onViewCreature onClear onHatch onPlant
  onDeepLinkConsumed onGoToStore onFought onFight onClose onNavigate onPipClick
  ownedData def displayEmoji ascPopup flairTab msg n stat value bonus highlight
  filled total isMax selectedPip deepLinkId setRewardPopup
);

open my $fh, '<', $file or die "cannot read $file: $!";
my $src = do { local $/; <$fh> };
close $fh;

# Find the component signature: function Name({ ... }){
unless ($src =~ /^function\s+(\w+)\(\{([^}]*)\}\)\{/m) {
  print "SKIP $file (no destructured signature)\n";
  exit 0;
}
my ($name, $proplist) = ($1, $2);

my (@keep, @ctx);
for my $raw (split /\s*,\s*/, $proplist) {
  next unless length $raw;
  (my $base = $raw) =~ s/\s*=.*$//;   # strip default values
  if ($KEEP{$base}) { push @keep, $raw } else { push @ctx, $base }
}

if (!@ctx) {
  print "SKIP $name (nothing to move)\n";
  exit 0;
}

my $keepStr = join(',', @keep);
my $ctxStr  = join(', ', @ctx);
my $newSig  = "function $name({$keepStr}){\n"
            . "  const { $ctxStr } = useGame();";

$src =~ s/^function\s+\Q$name\E\(\{[^}]*\}\)\{/$newSig/m;

# Add the useGame import right after the react.js import.
unless ($src =~ /useGame/ && $src =~ /^import \{ useGame \}/m) {
  $src =~ s{(^import React[^\n]*from "\Q$prefix\E/react\.js";\n)}
           {$1import { useGame } from "$prefix/state/GameContext.js";\n}m;
}

open my $out, '>', $file or die "cannot write $file: $!";
print $out $src;
close $out;

printf "%-46s keep:%-2d  ctx:%d\n", $name, scalar(@keep), scalar(@ctx);
