import { Container, Graphics, Text } from 'pixi.js'
import type { TextStyleOptions } from 'pixi.js'
import { Button, CheckBox, CircularProgressBar, ProgressBar, RadioGroup, Slider, Switcher } from '@pixi/ui'
import { THEME } from './theme'

const { colors, radius, font, fontSize } = THEME

export interface LabelOptions {
  size?: number
  color?: number
  weight?: 'normal' | 'bold'
  align?: 'left' | 'center' | 'right'
  maxWidth?: number
  wordWrap?: boolean
  lineHeight?: number
}

export function label(text: string, options: LabelOptions = {}): Text {
  const style: TextStyleOptions = {
    fontFamily: font,
    fontSize: options.size ?? fontSize.body,
    fill: options.color ?? colors.text,
    fontWeight: options.weight ?? 'normal',
    align: options.align ?? 'left',
    ...(options.lineHeight ? { lineHeight: options.lineHeight } : {}),
    ...(options.wordWrap
      ? { wordWrap: true, wordWrapWidth: options.maxWidth ?? 600, breakWords: true }
      : {})
  }
  return new Text({ text, style })
}

/** 纵向堆叠容器，自动计算每个子项的位置。 */
export class VStack extends Container {
  private cursor = 0
  private readonly gap: number

  constructor(gap = 16) {
    super()
    this.gap = gap
  }

  add(child: Container, gap = this.gap): this {
    child.y = this.cursor
    this.addChild(child)
    this.cursor += child.height + gap
    return this
  }

  get contentHeight(): number {
    return Math.max(0, this.cursor - this.gap)
  }
}

/** 横向堆叠容器。 */
export class HStack extends Container {
  private cursor = 0
  private readonly gap: number

  constructor(gap = 16) {
    super()
    this.gap = gap
  }

  add(child: Container, gap = this.gap): this {
    child.x = this.cursor
    this.addChild(child)
    this.cursor += child.width + gap
    return this
  }
}

export function panelBackground(width: number, height: number, fill = colors.panel): Graphics {
  return new Graphics()
    .roundRect(0, 0, width, height, radius.lg)
    .fill({ color: fill, alpha: 0.96 })
    .stroke({ color: colors.border, width: 2 })
}

export function badge(text: string, color = colors.accent): Container {
  const textView = label(text, { size: fontSize.tiny, color: 0x081018, weight: 'bold' })
  const paddingX = 16
  const width = textView.width + paddingX * 2
  const height = 36
  const view = new Container()
  view.addChild(new Graphics().roundRect(0, 0, width, height, height / 2).fill(color))
  textView.position.set(paddingX, (height - textView.height) / 2)
  view.addChild(textView)
  return view
}

export function divider(width: number): Graphics {
  return new Graphics().rect(0, 0, width, 1).fill({ color: colors.border, alpha: 0.7 })
}

export interface DemoButtonOptions {
  text: string
  width?: number
  height?: number
  color?: number
  textColor?: number
  fontSize?: number
  enabled?: boolean
  onPress?: () => void
}

export interface DemoButton {
  view: Container
  button: Button
  setText(text: string): void
  setEnabled(enabled: boolean): void
}

export function createButton(options: DemoButtonOptions): DemoButton {
  const width = options.width ?? 300
  const height = options.height ?? 92
  const color = options.color ?? colors.primary
  const view = new Container()
  const background = new Graphics()
    .roundRect(0, 0, width, height, radius.md)
    .fill({ color })
    .stroke({ color: 0xffffff, alpha: 0.12, width: 2 })

  const textView = label(options.text, {
    size: options.fontSize ?? fontSize.body,
    color: options.textColor ?? colors.white,
    weight: 'bold',
    align: 'center'
  })
  textView.anchor.set(0.5)
  textView.position.set(width / 2, height / 2)

  view.addChild(background, textView)

  const button = new Button(view)
  button.onPress.connect(() => options.onPress?.())
  button.onDown.connect(() => {
    view.alpha = 0.75
  })
  button.onUp.connect(() => {
    view.alpha = 1
  })
  button.onUpOut.connect(() => {
    view.alpha = 1
  })

  const setEnabled = (enabled: boolean) => {
    button.enabled = enabled
    view.alpha = enabled ? 1 : 0.4
  }
  if (options.enabled === false) setEnabled(false)

  return {
    view,
    button,
    setText(text: string) {
      textView.text = text
    },
    setEnabled
  }
}

export function createCheckBox(text: string, checked = false): CheckBox {
  const box = 44
  const unchecked = new Graphics()
    .roundRect(0, 0, box, box, 12)
    .fill(colors.panelSoft)
    .stroke({ color: colors.border, width: 2 })

  const checkedView = new Graphics()
    .roundRect(0, 0, box, box, 12)
    .fill(colors.primary)
    .moveTo(12, 23)
    .lineTo(19, 31)
    .lineTo(33, 15)
    .stroke({ color: colors.white, width: 5, cap: 'round', join: 'round' })

  return new CheckBox({
    style: {
      unchecked,
      checked: checkedView,
      text: { fontFamily: font, fontSize: fontSize.small, fill: colors.text },
      textOffset: { x: 18 }
    },
    text,
    checked
  })
}

export function createRadioGroup(items: string[], selected = 0): RadioGroup {
  return new RadioGroup({
    items: items.map((text, index) => createCheckBox(text, index === selected)),
    type: 'vertical',
    elementsMargin: 18,
    selectedItem: selected
  })
}

export interface DemoToggle {
  view: Switcher
  isOn(): boolean
}

export function createToggle(value = false): DemoToggle {
  const width = 108
  const height = 56
  const knob = 40

  const off = new Graphics()
    .roundRect(0, 0, width, height, height / 2)
    .fill(colors.track)
    .circle(knob / 2 + 8, height / 2, knob / 2)
    .fill(colors.textDim)

  const on = new Graphics()
    .roundRect(0, 0, width, height, height / 2)
    .fill(colors.primary)
    .circle(width - knob / 2 - 8, height / 2, knob / 2)
    .fill(colors.white)

  const view = new Switcher([off, on], 'onPress', value ? 1 : 0)
  return {
    view,
    isOn() {
      return view.active === 1
    }
  }
}

export interface DemoSlider {
  view: Slider
  onChange(callback: (value: number) => void): void
}

export function createSlider(options: {
  width?: number
  min?: number
  max?: number
  value?: number
  step?: number
  color?: number
  height?: number
}): DemoSlider {
  const width = options.width ?? 520
  const height = options.height ?? 16
  const thumb = 34

  const bg = new Graphics().roundRect(0, 0, width, height, height / 2).fill(colors.track)
  const fill = new Graphics()
    .roundRect(0, 0, width, height, height / 2)
    .fill(options.color ?? colors.primary)
  // 圆心画在 (thumb/2, 0)，使滑块中心与进度位置对齐
  const thumbView = new Graphics()
    .circle(thumb / 2, 0, thumb / 2)
    .fill(colors.white)
    .stroke({ color: options.color ?? colors.primary, width: 5 })

  const slider = new Slider({
    bg,
    fill,
    slider: thumbView,
    min: options.min ?? 0,
    max: options.max ?? 100,
    value: options.value ?? 50,
    step: options.step ?? 1
  })

  return {
    view: slider,
    onChange(callback: (value: number) => void) {
      slider.onUpdate.connect(callback)
    }
  }
}

export function createProgressBar(options: {
  width?: number
  height?: number
  value?: number
  color?: number
}): ProgressBar {
  const width = options.width ?? 520
  const height = options.height ?? 20
  const bg = new Graphics().roundRect(0, 0, width, height, height / 2).fill(colors.track)
  const fill = new Graphics()
    .roundRect(0, 0, width, height, height / 2)
    .fill(options.color ?? colors.accent)
  return new ProgressBar({ bg, fill, progress: options.value ?? 0 })
}

export function createCircularProgress(value = 65): CircularProgressBar {
  return new CircularProgressBar({
    backgroundColor: colors.track,
    fillColor: colors.accent,
    lineWidth: 18,
    radius: 64,
    value,
    cap: 'round'
  })
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}
