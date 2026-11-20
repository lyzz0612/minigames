import { Container, Graphics, Text } from 'pixi.js'
import { Input } from '@pixi/ui'
import { getPlatform } from '../platform'
import { THEME } from './theme'

const { colors, radius, font, fontSize } = THEME

export interface TextFieldOptions {
  width?: number
  height?: number
  placeholder?: string
  value?: string
  maxLength?: number
  onChange?: (value: string) => void
}

export interface TextFieldHandle {
  view: Container
  getValue(): string
  setValue(value: string): void
}

class MiniTextField extends Container {
  private value: string
  private textView: Text
  private placeholderView: Text
  private readonly onChange?: (value: string) => void

  constructor(private options: TextFieldOptions) {
    super()
    const platform = getPlatform()
    const width = options.width ?? 520
    const height = options.height ?? 92
    this.value = options.value ?? ''

    this.addChild(
      new Graphics()
        .roundRect(0, 0, width, height, radius.md)
        .fill(colors.panelSoft)
        .stroke({ color: colors.border, width: 2 })
    )

    this.placeholderView = new Text({
      text: options.placeholder ?? '请输入内容',
      style: { fontFamily: font, fontSize: fontSize.small, fill: colors.textDim }
    })
    this.placeholderView.position.set(24, (height - this.placeholderView.height) / 2)

    this.textView = new Text({
      text: this.value,
      style: { fontFamily: font, fontSize: fontSize.small, fill: colors.text }
    })
    this.textView.position.set(24, (height - this.textView.height) / 2)

    this.addChild(this.placeholderView, this.textView)
    this.refresh()

    this.eventMode = 'static'
    this.cursor = 'pointer'
    this.on('pointertap', () => {
      platform.showKeyboard?.(
        { defaultValue: this.value, maxLength: options.maxLength ?? 40 },
        {
          onInput: value => this.setValue(value),
          onConfirm: value => this.setValue(value),
          onComplete: value => this.setValue(value)
        }
      )
    })
  }

  private refresh(): void {
    this.textView.text = this.value
    this.placeholderView.visible = this.value.length === 0
  }

  getValue(): string {
    return this.value
  }

  setValue(value: string): void {
    if (value === this.value) return
    this.value = value
    this.refresh()
    this.onChange?.(value)
  }
}

export function createTextField(options: TextFieldOptions): TextFieldHandle {
  const platform = getPlatform()
  const width = options.width ?? 520
  const height = options.height ?? 92

  if (platform.isMiniGame) {
    const field = new MiniTextField({ ...options, onChange: options.onChange })
    return {
      view: field,
      getValue: () => field.getValue(),
      setValue: value => field.setValue(value)
    }
  }

  const input = new Input({
    bg: new Graphics()
      .roundRect(0, 0, width, height, radius.md)
      .fill(colors.panelSoft)
      .stroke({ color: colors.border, width: 2 }),
    placeholder: options.placeholder ?? '请输入内容',
    value: options.value ?? '',
    maxLength: options.maxLength ?? 40,
    padding: 24,
    textStyle: { fontFamily: font, fontSize: fontSize.small, fill: colors.text },
    addMask: true
  })
  if (options.onChange) input.onChange.connect(options.onChange)

  return {
    view: input,
    getValue: () => input.value,
    setValue: value => {
      input.value = value
    }
  }
}
