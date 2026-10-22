#!/bin/zsh
# 桌面组件一键安装：curl -fsSL https://raw.githubusercontent.com/Yaks-cyber/desktop-widgets/main/install.sh | zsh
set -e

if [ ! -d /Applications/Übersicht.app ]; then
  if command -v brew >/dev/null; then
    echo "正在安装 Übersicht…"; brew install --cask ubersicht
  else
    echo "没有 Homebrew：请先去官网下载 Übersicht 拖进「应用程序」，再重新粘贴这行命令"
    open "https://tracesof.net/uebersicht/"; exit 1
  fi
fi

T=$(mktemp -d)
echo "正在下载组件…"
curl -fsSL https://github.com/Yaks-cyber/desktop-widgets/archive/refs/heads/main.tar.gz | tar xz -C "$T"
S="$T/desktop-widgets-main"

W="$HOME/Library/Application Support/Übersicht/widgets"
mkdir -p "$W/lib"
cp "$S"/widgets/*.jsx "$W/"; cp "$S"/widgets/lib/*.js "$W/lib/"
mkdir -p "$HOME/.local/bin"; cp "$S/ubersicht-toggle" "$HOME/.local/bin/"; chmod +x "$HOME/.local/bin/ubersicht-toggle"
rm -rf "$T"

open -a Übersicht
# 开机自动启动，重启后组件还在
osascript -e 'tell application "System Events" to if not (exists login item "Übersicht") then make login item at end with properties {path:"/Applications/Übersicht.app", hidden:true}' >/dev/null 2>&1 || true
echo "装好了！组件已经出现在桌面上，按住可以拖动换位置。"
