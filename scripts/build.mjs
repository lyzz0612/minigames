/**
 * 统一构建入口。
 *
 *   node scripts/build.mjs all     构建 h5 + wechat + douyin
 *   node scripts/build.mjs h5      只构建 H5
 *   node scripts/build.mjs wechat  只构建微信小游戏
 *   node scripts/build.mjs douyin  只构建抖音小游戏
 */
import { build } from 'vite'
import { mkdir, readdir, rm, stat, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../build/build.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requested = process.argv[2] ?? 'all'
const targetNames = requested === 'all' ? Object.keys(config.targets) : [requested]

function fail(message) {
  console.error(`\n[build] ${message}\n`)
  process.exit(1)
}

async function directorySize(directory) {
  let total = 0
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) total += await directorySize(fullPath)
    else total += (await stat(fullPath)).size
  }
  return total
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writeMiniGameProject(target, outDir) {
  const gameJson = {
    deviceOrientation: 'portrait',
    showStatusBar: false,
    ...target.gameJson
  }
  await writeJson(path.join(outDir, 'game.json'), gameJson)

  const projectConfig = {
    appid: target.appid,
    projectname: config.name,
    compileType: 'game',
    libVersion: target.libVersion,
    packOptions: { ignore: [], include: [] },
    condition: {},
    ...target.projectConfig
  }
  await writeJson(path.join(outDir, 'project.config.json'), projectConfig)

  // 抖音开发者工具读取 project.config.json 中的 appid；
  // 微信同时支持 project.private.config.json 覆盖本地配置，这里预置一份空文件。
  if (target.platform === 'wechat') {
    await writeJson(path.join(outDir, 'project.private.config.json'), {
      projectname: config.name,
      setting: { compileHotReLoad: false }
    })
  }
}

async function buildTarget(name) {
  const target = config.targets[name]
  if (!target) fail(`未知构建目标：${name}`)

  const isMiniGame = target.platform !== 'web'
  const outDir = path.resolve(root, target.outDir)

  console.log(`\n[build] ── ${name} (${target.platform}) → ${target.outDir}`)
  await rm(outDir, { recursive: true, force: true })

  const baseBuild = {
    target: config.build.target,
    minify: config.build.minify,
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir,
    assetsInlineLimit: 0,
    sourcemap: false
  }

  await build({
    configFile: false,
    root,
    base: isMiniGame ? './' : './',
    mode: 'production',
    define: {
      __PLATFORM__: JSON.stringify(target.platform)
    },
    resolve: {
      alias: {
        '@': path.resolve(root, 'src')
      }
    },
    publicDir: path.resolve(root, config.publicDir),
    build: isMiniGame
      ? {
          ...baseBuild,
          lib: {
            entry: path.resolve(root, config.entry),
            name: 'game',
            formats: ['iife'],
            fileName: () => 'game.js'
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              assetFileNames: 'assets/[name][extname]'
            }
          }
        }
      : {
          ...baseBuild,
          rollupOptions: {
            output: {
              entryFileNames: 'assets/[name]-[hash].js',
              chunkFileNames: 'assets/[name]-[hash].js',
              assetFileNames: 'assets/[name]-[hash][extname]'
            }
          }
        }
  })

  if (isMiniGame) await writeMiniGameProject(target, outDir)

  const bytes = await directorySize(outDir)
  const size = (bytes / 1024).toFixed(1)
  console.log(`[build] ✓ ${name} 完成，产物 ${size} KB`)
  if (isMiniGame && bytes > 4 * 1024 * 1024) {
    console.warn('[build] ⚠ 超过微信/抖音主包 4MB 限制，请拆分资源或子包')
  }
  if (isMiniGame) {
    console.log(`[build]   用开发者工具打开：${target.outDir}`)
    console.log('[build]   入口文件：game.js / 配置：game.json + project.config.json')
  }
}

async function main() {
  for (const name of targetNames) {
    await buildTarget(name)
  }
  console.log('\n[build] 全部完成\n')
}

main().catch(error => fail(error?.stack ?? String(error)))
