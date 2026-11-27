import { Container, Graphics, Text } from 'pixi.js'
import { DoubleSlider, FancyButton, List, ScrollBox, Select } from '@pixi/ui'
import {
  badge,
  createButton,
  createCheckBox,
  createCircularProgress,
  createProgressBar,
  createRadioGroup,
  createSlider,
  createToggle,
  divider,
  formatTime,
  HStack,
  label,
  panelBackground,
  VStack
} from '../ui/widgets'
import { createTextField } from '../ui/text-field'
import { THEME } from '../ui/theme'
import { TrackPlayer } from '../audio/player'

const { colors, radius, font, fontSize } = THEME

export interface Page {
  view: Container
  update?(deltaTime: number): void
}

function panelView(title: string, children: Container[], width: number, hint?: string): Container {
  const padding = 24
  const content = new VStack(16)
  children.forEach(child => content.add(child))

  const titleView = label(title, { size: fontSize.title, weight: 'bold' })
  const hintView = hint
    ? label(hint, {
        size: fontSize.tiny,
        color: colors.textDim,
        wordWrap: true,
        maxWidth: width - padding * 2
      })
    : null

  const headerHeight = titleView.height + (hintView ? 8 + hintView.height : 0)
  const height = padding + headerHeight + 18 + content.contentHeight + padding

  const container = new Container()
  container.addChild(panelBackground(width, height))
  titleView.position.set(padding, padding)
  container.addChild(titleView)

  let cursor = padding + titleView.height
  if (hintView) {
    hintView.position.set(padding, cursor + 8)
    container.addChild(hintView)
    cursor += 8 + hintView.height
  }

  content.position.set(padding, cursor + 18)
  container.addChild(content)
  return container
}

function rowBetween(left: Container, right: Container, width: number, height: number): Container {
  const container = new Container()
  left.y = Math.max(0, (height - left.height) / 2)
  right.x = Math.max(left.width + 12, width - right.width)
  right.y = Math.max(0, (height - right.height) / 2)
  container.addChild(left, right)
  return container
}

function pageScroll(width: number, height: number, items: Container[]): ScrollBox {
  return new ScrollBox({
    width,
    height,
    type: 'vertical',
    items,
    elementsMargin: 18,
    radius: radius.lg
  })
}

export function buildBasicPage(width: number, height: number, onOpenDialog?: () => void): Page {
  const innerWidth = width - 48

  let pressCount = 0
  const primary = createButton({
    text: '主按钮',
    width: innerWidth / 2 - 8,
    onPress: () => undefined
  })
  const secondary = createButton({
    text: '次按钮',
    width: innerWidth / 2 - 8,
    color: colors.panelSoft,
    onPress: () => undefined
  })
  const buttonsRow = new HStack(16)
  buttonsRow.add(primary.view).add(secondary.view)

  const counter = createButton({
    text: '点击 0 次',
    width: innerWidth / 2 - 8,
    color: colors.accent,
    textColor: 0x061018,
    onPress: () => {
      pressCount += 1
      counter.setText(`点击 ${pressCount} 次`)
    }
  })
  const disabled = createButton({
    text: '禁用按钮',
    width: innerWidth / 2 - 8,
    color: colors.panelSoft,
    enabled: false
  })
  const counterRow = new HStack(16)
  counterRow.add(counter.view).add(disabled.view)

  const fancy = new FancyButton({
    defaultView: new Graphics()
      .roundRect(0, 0, innerWidth, 92, radius.md)
      .fill({ color: colors.success }),
    hoverView: new Graphics()
      .roundRect(0, 0, innerWidth, 92, radius.md)
      .fill({ color: 0x2bb583 }),
    text: new Text({
      text: 'Fancy 按钮（带动画）',
      style: {
        fontFamily: font,
        fontSize: fontSize.body,
        fill: colors.white,
        fontWeight: 'bold'
      }
    })
  })

  const dialogButton = createButton({
    text: '打开对话框 Dialog',
    width: innerWidth,
    color: colors.warning,
    textColor: 0x1a1200,
    onPress: () => onOpenDialog?.()
  })

  const buttonPanel = panelView(
    '按钮 Button / FancyButton',
    [buttonsRow, counterRow, fancy, dialogButton.view],
    width,
    '支持点击、禁用、计数、Fancy 动效与 Dialog 弹窗。'
  )

  const switchLabel = label('通知开关', { size: fontSize.small })
  const toggle = createToggle(true)
  const switchState = label('已开启', { size: fontSize.tiny, color: colors.success })
  toggle.view.onChange.connect(() => {
    const on = toggle.isOn()
    switchState.text = on ? '已开启' : '已关闭'
    switchState.style.fill = on ? colors.success : colors.textDim
  })
  const switchRow = rowBetween(switchLabel, toggle.view, innerWidth, 56)

  const check1 = createCheckBox('接收每日推送', true)
  const check2 = createCheckBox('仅在 Wi-Fi 下更新', false)

  const radioStatus = label('当前：标准模式', { size: fontSize.tiny, color: colors.accent })
  const radio = createRadioGroup(['轻量模式', '标准模式', '性能模式'], 1)
  const modes = ['轻量模式', '标准模式', '性能模式']
  radio.onChange.connect(index => {
    radioStatus.text = `当前：${modes[index] ?? modes[0]}`
  })

  const togglePanel = panelView(
    '开关 Switcher / CheckBox / RadioGroup',
    [switchRow, check1, check2, divider(innerWidth), radioStatus, radio],
    width
  )

  const circular = createCircularProgress(65)
  const circularValue = label('65%', { size: fontSize.title, weight: 'bold', align: 'center' })
  circularValue.anchor.set(0.5)

  // CircularProgressBar 把圆环画在以自身原点为圆心的局部坐标上（bounds 为 -r..r）。
  // 先把环平移 (r, r)，让 circularBox 的 bounds 从 (0,0) 开始：
  // 1) 文本放在 (r, r) 才是圆心，而不是环的右下角；
  // 2) 负 bounds 会让 @pixi/ui List 的 getChildOffset 把整个面板右移补偿。
  const ringCenter = circular.width / 2
  circular.position.set(ringCenter, ringCenter)

  const circularBox = new Container()
  circularBox.addChild(circular)
  circularValue.position.set(ringCenter, ringCenter)
  circularBox.addChild(circularValue)

  const randomButton = createButton({
    text: '随机进度',
    width: innerWidth - 200,
    height: 78,
    color: colors.primary,
    onPress: () => {
      const value = Math.floor(Math.random() * 101)
      circular.progress = value
      circularValue.text = `${value}%`
    }
  })

  const progress = createProgressBar({ width: innerWidth, height: 24, value: 30, color: colors.accent })
  const progressLabel = label('循环动画 30%', { size: fontSize.tiny, color: colors.textDim })

  const progressPanel = panelView(
    '进度 ProgressBar / CircularProgressBar',
    [circularBox, randomButton.view, progressLabel, progress],
    width
  )

  const items = [buttonPanel, togglePanel, progressPanel]
  const view = pageScroll(width, height, items)

  circularBox.x = (innerWidth - circularBox.width) / 2

  let elapsed = 0
  return {
    view,
    update(deltaTime: number) {
      elapsed += deltaTime
      const value = (elapsed * 18) % 100
      progress.progress = value
      progressLabel.text = `循环动画 ${value.toFixed(0)}%`
    }
  }
}

export function buildInputPage(width: number, height: number): Page {
  const innerWidth = width - 48

  const echo = label('输入内容会显示在这里', {
    size: fontSize.small,
    color: colors.textDim,
    wordWrap: true,
    maxWidth: innerWidth
  })
  const field = createTextField({
    width: innerWidth,
    placeholder: '点击输入昵称',
    maxLength: 20,
    onChange: value => {
      echo.text = value.length > 0 ? `你好，${value}` : '输入内容会显示在这里'
      echo.style.fill = value.length > 0 ? colors.text : colors.textDim
    }
  })

  const textPanel = panelView(
    '文本输入 TextField',
    [field.view, echo],
    width,
    'H5 使用原生 input 代理；小游戏使用系统键盘（showKeyboard）。'
  )

  const sliderValue = label('音量 50', { size: fontSize.small, color: colors.accent })
  const slider = createSlider({ width: innerWidth, min: 0, max: 100, value: 50 })
  slider.onUpdate(value => {
    sliderValue.text = `音量 ${Math.round(value)}`
  })
  const mirror = createProgressBar({ width: innerWidth, height: 20, value: 50 })
  slider.onUpdate(value => {
    mirror.progress = value
  })

  const sliderPanel = panelView('滑块 Slider', [sliderValue, slider.view, mirror], width)

  const rangeValue = label('区间 20 - 80', { size: fontSize.small, color: colors.accent })
  const range = new DoubleSlider({
    bg: new Graphics().roundRect(0, 0, innerWidth, 16, 8).fill(colors.track),
    fill: new Graphics().roundRect(0, 0, innerWidth, 16, 8).fill(colors.success),
    slider1: new Graphics().circle(17, 0, 17).fill(colors.white).stroke({ color: colors.success, width: 5 }),
    slider2: new Graphics().circle(17, 0, 17).fill(colors.white).stroke({ color: colors.success, width: 5 }),
    min: 0,
    max: 100,
    value1: 20,
    value2: 80
  })
  range.onUpdate.connect((value1, value2) => {
    rangeValue.text = `区间 ${Math.round(value1)} - ${Math.round(value2)}`
  })

  const rangePanel = panelView(
    '双向滑块 DoubleSlider',
    [rangeValue, range],
    width,
    '用于选择价格区间、时间段等。'
  )

  const reset = createButton({
    text: '重置所有输入',
    width: innerWidth,
    color: colors.panelSoft,
    onPress: () => {
      field.setValue('')
      echo.text = '输入内容会显示在这里'
      echo.style.fill = colors.textDim
      slider.view.value = 50
      mirror.progress = 50
      sliderValue.text = '音量 50'
      range.value1 = 20
      range.value2 = 80
      rangeValue.text = '区间 20 - 80'
    }
  })
  const actionPanel = panelView('操作', [reset.view], width)

  return {
    view: pageScroll(width, height, [textPanel, sliderPanel, rangePanel, actionPanel])
  }
}

export function buildSelectPage(width: number, height: number): Page {
  const innerWidth = width - 48

  const rows: Container[] = ['新手礼包', '每日任务', '限时活动', '成就奖励'].map((text, index) => {
    const row = new Container()
    row.addChild(
      new Graphics()
        .roundRect(0, 0, innerWidth, 80, radius.sm)
        .fill({ color: index % 2 === 0 ? colors.panelSoft : colors.panel })
    )
    const title = label(text, { size: fontSize.small })
    title.position.set(20, 24)
    row.addChild(title)
    const tag = badge(index % 2 === 0 ? 'NEW' : 'HOT', index % 2 === 0 ? colors.accent : colors.warning)
    tag.position.set(innerWidth - tag.width - 20, 18)
    row.addChild(tag)
    return row
  })

  const list = new List({ type: 'vertical', children: rows, elementsMargin: 12 })
  const listPanel = panelView('列表 List', [list], width, '列表用于任务、道具、排行榜等场景。')

  const selectEcho = label('当前选中：选项 A', { size: fontSize.small, color: colors.accent })
  const options = ['选项 A', '选项 B', '选项 C', '选项 D', '选项 E']
  const select = new Select({
    closedBG: new Graphics()
      .roundRect(0, 0, innerWidth, 88, radius.md)
      .fill(colors.panelSoft)
      .stroke({ color: colors.border, width: 2 }),
    openBG: new Graphics()
      .roundRect(0, 0, innerWidth, 88, radius.md)
      .fill(colors.panel)
      .stroke({ color: colors.primary, width: 2 }),
    textStyle: { fontFamily: font, fontSize: fontSize.small, fill: colors.text },
    items: {
      items: options,
      backgroundColor: colors.panel,
      hoverColor: colors.panelSoft,
      width: innerWidth,
      height: 72,
      radius: radius.sm,
      textStyle: { fontFamily: font, fontSize: fontSize.small, fill: colors.text }
    },
    selected: 0,
    scrollBox: { width: innerWidth, height: 300, radius: radius.md }
  })
  select.onSelect.connect((_value, text) => {
    selectEcho.text = `当前选中：${text}`
  })

  const selectPanel = panelView(
    '下拉选择 Select',
    [selectEcho, select],
    width,
    '点击展开选项列表，可滚动选择。'
  )

  return {
    view: pageScroll(width, height, [listPanel, selectPanel])
  }
}

const TRACKS = [
  { name: '低音 220Hz', src: 'audio/tone-low.wav' },
  { name: '中音 440Hz', src: 'audio/tone-mid.wav' },
  { name: '高音 880Hz', src: 'audio/tone-high.wav' }
]

function statusText(player: TrackPlayer): string {
  switch (player.playerStatus) {
    case 'loading':
      return '加载中…'
    case 'playing':
      return '播放中'
    case 'paused':
      return '已暂停'
    case 'ended':
      return '播放结束'
    case 'error':
      return player.errorMessage || '播放失败'
    default:
      return '待播放'
  }
}

export function buildAudioPage(width: number, height: number, player: TrackPlayer): Page {
  const innerWidth = width - 48

  const status = label('状态：加载中…', { size: fontSize.small, color: colors.textDim })
  const time = label('00:00 / 00:00', { size: fontSize.title, weight: 'bold' })
  const progress = createProgressBar({ width: innerWidth, height: 18, value: 0 })

  const playButton = createButton({
    text: '播放',
    width: innerWidth / 2 - 8,
    color: colors.primary,
    onPress: () => player.toggle()
  })
  const stopButton = createButton({
    text: '停止',
    width: innerWidth / 2 - 8,
    color: colors.panelSoft,
    onPress: () => player.stop()
  })
  const buttons = new HStack(16)
  buttons.add(playButton.view).add(stopButton.view)

  const seekValue = label('跳转 0%', { size: fontSize.tiny, color: colors.textDim })
  const seek = createSlider({ width: innerWidth, min: 0, max: 100, value: 0, color: colors.accent })
  seek.onChange(value => {
    const duration = player.duration
    if (duration > 0) player.seek((value / 100) * duration)
  })

  const volumeValue = label(`音量 ${Math.round(player.currentVolume * 100)}`, {
    size: fontSize.tiny,
    color: colors.textDim
  })
  const volume = createSlider({ width: innerWidth, min: 0, max: 100, value: player.currentVolume * 100, color: colors.success })
  volume.onUpdate(value => {
    player.setVolume(value / 100)
    volumeValue.text = `音量 ${Math.round(value)}`
  })

  const loopLabel = label('循环播放', { size: fontSize.small })
  const loopToggle = createToggle(player.isLooping)
  loopToggle.view.onChange.connect(() => player.setLoop(loopToggle.isOn()))
  const loopRow = rowBetween(loopLabel, loopToggle.view, innerWidth, 56)

  const trackEcho = label(`曲目：${TRACKS[1].name}`, { size: fontSize.small, color: colors.accent })
  const trackSelect = new Select({
    closedBG: new Graphics()
      .roundRect(0, 0, innerWidth, 84, radius.md)
      .fill(colors.panelSoft)
      .stroke({ color: colors.border, width: 2 }),
    openBG: new Graphics()
      .roundRect(0, 0, innerWidth, 84, radius.md)
      .fill(colors.panel)
      .stroke({ color: colors.primary, width: 2 }),
    textStyle: { fontFamily: font, fontSize: fontSize.small, fill: colors.text },
    items: {
      items: TRACKS.map(track => track.name),
      backgroundColor: colors.panel,
      hoverColor: colors.panelSoft,
      width: innerWidth,
      height: 68,
      radius: radius.sm,
      textStyle: { fontFamily: font, fontSize: fontSize.small, fill: colors.text }
    },
    selected: 1,
    scrollBox: { width: innerWidth, height: 240, radius: radius.md }
  })
  trackSelect.onSelect.connect(index => {
    const track = TRACKS[index]
    if (!track) return
    trackEcho.text = `曲目：${track.name}`
    player.load(track.src)
  })

  const playerPanel = panelView(
    '音频播放控制',
    [status, time, progress, buttons, seekValue, seek.view, volumeValue, volume.view, loopRow, trackEcho, trackSelect],
    width,
    '微信使用 InnerAudioContext，抖音使用同构 API，H5 使用 HTMLAudioElement。'
  )

  const apiPanel = panelView(
    '平台差异说明',
    [
      label('· 播放/暂停/停止/跳转/音量/循环 全部走 Platform 抽象', {
        size: fontSize.tiny,
        color: colors.textDim,
        wordWrap: true,
        maxWidth: innerWidth
      }),
      label('· 音频文件放在 public/audio，构建时原样复制到小游戏包', {
        size: fontSize.tiny,
        color: colors.textDim,
        wordWrap: true,
        maxWidth: innerWidth
      })
    ],
    width
  )

  const view = pageScroll(width, height, [playerPanel, apiPanel])

  let lastLabel = ''
  return {
    view,
    update() {
      const duration = player.duration
      const current = Math.min(player.currentTime, duration || player.currentTime)
      const percent = duration > 0 ? (current / duration) * 100 : 0
      progress.progress = percent
      time.text = `${formatTime(current)} / ${formatTime(duration)}`
      status.text = `状态：${statusText(player)}`
      status.style.fill = player.playerStatus === 'error' ? colors.danger : colors.textDim
      const buttonLabel = player.isPlaying ? '暂停' : '播放'
      if (buttonLabel !== lastLabel) {
        playButton.setText(buttonLabel)
        lastLabel = buttonLabel
      }
      seekValue.text = `跳转 ${Math.round(percent)}%`
    }
  }
}
