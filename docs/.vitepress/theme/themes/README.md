# 主题系统

本文档说明站点中更新的主题架构、显示模式及集成组件。

## 架构

- 显示模式：`light` 和 `dark`。
- AMOLED：`dark` 模式的增强版（纯黑背景），在深色模式基础上切换，并非独立模式。
- 主题：跨模式应用的配色方案和可选设计标记。
- 模式与主题相互独立；主题为浅色/深色定义颜色和标记。

## 文件结构

```
docs/.vitepress/theme/themes/
├── types.ts             // Type definitions
├── themeHandler.ts      // Theme handler logic & DOM/CSS application
├── index.ts             // Exports
└── configs/
    ├── index.ts         // Theme registry (default + named themes)
    └── catppuccin.ts    // Example theme (default)
```

## 核心类型

- `DisplayMode`: `'light' | 'dark'`.
- `Theme`: `{ name, displayName, preview?, logo?, modes: { light, dark }, ... }`.
- `ModeColors`:
  - `brand?`：可选品牌色（`1`、`2`、`3`、`soft`）。若省略，则由 ColorPicker 控制品牌色。
  - `bg`, `bgAlt`, `bgElv`, `bgMark?`.
  - `text?`：可选（`1`、`2`、`3`）。若省略，则使用 VitePress 默认值。
  - `button`：`brand` 和 `alt` 子对象，包含 `bg`、`border`、`text`、`hover*`、`active*`。
  - `customBlock`：`info`、`tip`、`warning`、`danger`，包含 `bg`、`border`、`text`、`textDeep`。
  - `selection`: `{ bg }`.
  - `home?`：可选首页样式。

## 处理器行为（`themeHandler.ts`）

- 持久化 `theme`（`vitepress-theme-name`）和 `mode`（`vitepress-display-mode`）。
- 应用 HTML 类：始终为当前模式；添加 `dark` 以兼容；当深色模式且 AMOLED 启用时添加 `amoled`。
- AMOLED 处理：将深色背景覆盖为纯黑色，同时保留其他深色标记。
- 品牌色：
  - 如果主题提供品牌色，则设置内联 CSS 变量。
  - 如果主题省略品牌色，则移除内联品牌变量，以便 ColorPicker 样式表生效。
- 文本色：
  - 仅在主题中定义时生效；否则使用默认值。
- 自定义标志：
  - 如果主题提供了 `logo`，则为下游使用设置 `--vp-theme-logo: url(...)`。

## UI 组件

- `ThemeDropdown.vue`：替换外观切换按钮。
  - 选项：浅色、深色、AMOLED（作为深色变体）。
  - 存储/读取模式和 AMOLED 启用状态。
  - 通过 `docs/.vitepress/config.mts` 别名化以覆盖 `VPSwitchAppearance.vue`。
- `ColorPicker.vue`:
  - 通过样式表标签（`#brand-color`）控制品牌颜色 CSS 变量。
  - 在切换到无品牌主题时，通过自定义事件 `theme-changed-apply-colors` 重新应用颜色。
- `ThemeSelector.vue`:
  - 每个主题显示圆形预览（通过 `preview` 图片或渐变回退）。
  - 调用 `setTheme(name)`；独立于 ColorPicker。

## 主题注册表（`configs/index.ts`）

- 示例：
```ts
import { catppuccinTheme } from './catppuccin'

export const themeRegistry = {
  default: catppuccinTheme,
  catppuccin: catppuccinTheme
}
```

## 创建主题（`configs/<name>.ts`）

- 导出一个包含以下内容的 `Theme` 对象：
  - `name`、`displayName`、可选的 `preview`（图片 URL/数据）和 `logo`。
  - `modes.light` 和 `modes.dark` 对象。
  - 可选的 `fonts`、`spacing`、`borderRadius`、`customProperties`。
- 在 `configs/index.ts` 中注册。
- 如果在某个模式中省略了 `brand`，将使用 ColorPicker 选择的品牌颜色。
- 如果在某个模式中省略了 `text`，将使用 VitePress 默认文本颜色。

## CSS 变量

- 品牌：`--vp-c-brand-1`、`--vp-c-brand-2`、`--vp-c-brand-3`、`--vp-c-brand-soft`。
- 背景：`--vp-c-bg`、`--vp-c-bg-alt`、`--vp-c-bg-elv`、`--vp-c-bg-mark`。
- 文字：`--vp-c-text-1`、`--vp-c-text-2`、`--vp-c-text-3`。
- 按钮：`--vp-button-brand-*`、`--vp-button-alt-*`。
- 自定义块：`--vp-custom-block-{type}-*`。
- 选中状态：`--vp-c-selection-bg`。
- 首页英雄区：`--vp-home-hero-*`。
- 自定义属性：`customProperties` 中的所有键。
- 可选：`--vp-theme-logo`（当主题定义了 `logo` 时）。

## 迁移说明

- AMOLED 不再是一个独立模式；它是在下拉菜单中切换的深色增强（纯黑背景）。
- 默认的 `VPSwitchAppearance` 切换按钮被替换为 `ThemeDropdown.vue`（通过 `config.mts` 中的别名）。下拉菜单通过 `themes/themeTransition.ts` 驱动径向亮/暗切换。
- 主题可以省略 `brand`，从而依赖 ColorPicker 来设置品牌色。

## 故障排除

- 主题未生效：请确保已添加到 `themeRegistry` 且名称正确。
- 品牌色未更改：如果主题设置了内联品牌色变量，ColorPicker 将无法覆盖；请从主题中移除 `brand`，以将控制权交给 ColorPicker。
- 切换主题后颜色未更新：ColorPicker 监听 `theme-changed-apply-colors` 事件；请确保该事件在 `setTheme()` 中仍然被触发。
- AMOLED 不是纯黑色：请确认深色模式已启用且 AMOLED 切换开关已打开；启用后，处理程序会覆盖背景色。

