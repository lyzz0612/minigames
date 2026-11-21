// 必须第一行导入：在小游戏环境里先安装 window/document/touch 等全局 shim，
// 之后 pixi.js 的模块级代码才能正常求值。
import './platform/setup'
import { bootstrap } from './app'

void bootstrap().catch(error => {
  console.error('[bootstrap] 启动失败', error)
  const global = globalThis as Record<string, any>
  if (global.document?.body?.appendChild) {
    const message = global.document.createElement('pre')
    message.textContent = `启动失败：${String(error)}`
    message.style.color = '#f87171'
    message.style.padding = '16px'
    global.document.body.appendChild(message)
  }
})
