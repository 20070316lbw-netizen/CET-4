#!/bin/sh
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if command -v xelatex >/dev/null 2>&1; then
  tex_engine=$(command -v xelatex)
elif [ -x /Library/TeX/texbin/xelatex ]; then
  tex_engine=/Library/TeX/texbin/xelatex
else
  echo '需要安装 XeLaTeX 后再编译。' >&2
  exit 1
fi
cd "$repo_dir/2025-12-1/notes"
mkdir -p .build
"$tex_engine" -interaction=nonstopmode -halt-on-error -output-directory=.build main.tex
"$tex_engine" -interaction=nonstopmode -halt-on-error -output-directory=.build main.tex
cp .build/main.pdf notes.pdf
