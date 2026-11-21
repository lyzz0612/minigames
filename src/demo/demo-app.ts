import { Application, Container, Graphics, Text } from 'pixi.js'
import { Dialog } from '@pixi/ui'
import type { Platform } from '../platform/types'
import { TrackPlayer } from '../audio/player'
import { THEME } from '../ui/theme'
import { badge, createButton, label } from '../ui/widgets'
import { buildAudioPage, buildBasicPage, buildInputPage, buildSelectPage, Page } from './pages'

const { colors, fontSize } = THEME

const DESIGN_WIDTH = 750
const HEADER_HEIGHT = 150
const TAB_HEIGHT = 84

interface TabDefinition {
  name: string
  build: (width: number, height: number) => Page
}

const PLATFORM_NAMES: Record<string, string> = {
  web: 'H5 浏览器',
  wechat: '微信小游戏',
  douyin: '抖音小游戏'
}

export class DemoApp {
  private root = new Container()
  private page: Page | null = null
  private dialog: Dialog | null = null
  private player: TrackPlayer
  private tabs: TabDefinition[]
  private activeTab = 0
  private fpsText: Text | null = null
  private designHeight = 1000
  private pageArea = { x: 24, y: 0, width: 702, height: 600 }

  constructor(
    private readonly app: Application,
    private readonly platform: Platform
  ) {
    app.stage.addChild(this.root)
    this.player = new TrackPlayer('audio/tone-mid.wav')
    this.tabs = [
      { name: '基础', build: (width, height) => buildBasicPage(width, height, () => this.dialog?.open()) },
      { name: '输入', build: (width, height) => buildInputPage(width, height) },
      { name: '选择', build: (width, height) => buildSelectPage(width, height) },
      { name: '音频', build: (width, height) => buildAudioPage(width, height, this.player) }
    ]

    this.layout()
    this.platform.onResize(() => this.layout())
    app.ticker.add(ticker => this.tick(ticker.deltaMS))
  }

  private layout(): void {
    this.dialog = null
    this.page = null
    this.fpsText = null
    this.root.removeChildren().forEach(child => child.destroy({ children: true }))

    const info = this.platform.getSystemInfo()
    const scale = Math.min(info.windowWidth / DESIGN_WIDTH, info.windowHeight / 1000)
    this.designHeight = info.windowHeight / scale

    this.root.scale.set(scale)
    this.root.position.set((info.windowWidth - DESIGN_WIDTH * scale) / 2, 0)

    this.root.addChild(
      new Graphics().rect(0, 0, DESIGN_WIDTH, this.designHeight).fill(colors.background)
    )

    const title = label('Pixi8 小游戏 UI Demo', { size: fontSize.hero, weight: 'bold' })
    title.position.set(24, 26)
    this.root.addChild(title)

    const subtitle = label(
      `设计分辨率 750 × ${Math.round(this.designHeight)} · 缩放 ${scale.toFixed(2)} · Pixi ${this.app.renderer.name}`,
      { size: fontSize.tiny, color: colors.textDim }
    )
    subtitle.position.set(24, 96)
    this.root.addChild(subtitle)

    const platformBadge = badge(PLATFORM_NAMES[this.platform.name] ?? this.platform.name, colors.accent)
    platformBadge.position.set(DESIGN_WIDTH - platformBadge.width - 24, 30)
    this.root.addChild(platformBadge)

    this.fpsText = label('FPS --', { size: fontSize.tiny, color: colors.textDim })
    this.fpsText.position.set(DESIGN_WIDTH - 110, 96)
    this.root.addChild(this.fpsText)

    this.buildTabs()

    const pageY = HEADER_HEIGHT + TAB_HEIGHT + 24
    this.pageArea = {
      x: 24,
      y: pageY,
      width: DESIGN_WIDTH - 48,
      height: Math.max(320, this.designHeight - pageY - 24)
    }
    this.buildPage()

    this.dialog = this.createDialog()
    this.root.addChild(this.dialog)
  }

  private buildTabs(): void {
    const gap = 12
    const width = (DESIGN_WIDTH - 48 - gap * (this.tabs.length - 1)) / this.tabs.length
    const bar = new Container()
    bar.position.set(24, HEADER_HEIGHT)

    this.tabs.forEach((tab, index) => {
      const active = index === this.activeTab
      const button = createButton({
        text: tab.name,
        width,
        height: TAB_HEIGHT,
        color: active ? colors.primary : colors.panel,
        fontSize: fontSize.small,
        onPress: () => this.selectTab(index)
      })
      button.view.x = index * (width + gap)
      bar.addChild(button.view)
    })

    this.root.addChild(bar)
  }

  private buildPage(): void {
    this.page?.view.destroy({ children: true })
    this.page = null

    const tab = this.tabs[this.activeTab]
    const page = tab.build(this.pageArea.width, this.pageArea.height)
    page.view.position.set(this.pageArea.x, this.pageArea.y)
    this.page = page
    this.root.addChild(page.view)
  }

  private selectTab(index: number): void {
    if (index === this.activeTab) return
    this.activeTab = index
    this.layout()
  }

  private createDialog(): Dialog {
    const dialog = new Dialog({
      background: new Graphics()
        .roundRect(0, 0, 600, 420, 28)
        .fill(colors.panel)
        .stroke({ color: colors.border, width: 2 }),
      width: 600,
      height: 420,
      title: 'Dialog 对话框',
      content:
        '这是 @pixi/ui 的 Dialog 组件，包含标题、可滚动内容和底部按钮。点击遮罩或按钮即可关闭。',
      buttons: [{ text: '知道了' }],
      closeOnBackdropClick: true
    })
    dialog.position.set(DESIGN_WIDTH / 2, this.designHeight / 2)
    dialog.onSelect.connect(() => dialog.close())
    return dialog
  }

  private tick(deltaTime: number): void {
    this.page?.update?.(deltaTime)
    if (this.fpsText) {
      this.fpsText.text = `FPS ${Math.round(this.app.ticker.FPS)}`
    }
  }
}
