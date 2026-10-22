# desktop-widgets

macOS 桌面组件（基于 [Übersicht](https://tracesof.net/uebersicht/)）：机械表盘时钟（含日期窗、月相）、7 日天气（Open-Meteo，大连沙河口）、Mac + 蓝牙设备电量。可拖动，点击打开对应 app。

## 安装

打开「终端」，粘贴这一行，回车：

```
curl -fsSL https://raw.githubusercontent.com/Yaks-cyber/desktop-widgets/main/install.sh | zsh
```

## 其他

- 改天气城市：改 `widgets/sky-weather.jsx` 顶部的 `LAT` / `LON` / `PLACE`
- 一键显示/隐藏全部组件：运行 `~/.local/bin/ubersicht-toggle`（可在「快捷指令」里绑快捷键）
