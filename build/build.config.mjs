/**
 * 构建配置格式（所有 target 共用同一份源码）
 *
 * 字段说明：
 *   name        项目名，会写进小游戏 project.config.json
 *   version     版本号，仅作记录
 *   entry       Vite 入口
 *   publicDir   原样复制的静态资源目录（音频、图片等）
 *   build       公共构建参数
 *   targets     每个目标平台的产物配置
 *
 * target 字段：
 *   platform    'web' | 'wechat' | 'douyin'，会注入为 __PLATFORM__
 *   outDir      产物目录
 *   appid       小游戏 AppID（H5 不需要）
 *   libVersion  小游戏基础库版本（H5 不需要）
 *   gameJson    写入 game.json 的字段（小游戏）
 *   projectConfig  追加写入 project.config.json 的字段（小游戏）
 */
export default {
  name: 'pixi-mini-game-demo',
  version: '1.0.0',
  entry: 'src/main.ts',
  publicDir: 'public',
  build: {
    target: 'es2019',
    minify: 'esbuild'
  },
  targets: {
    h5: {
      platform: 'web',
      outDir: 'dist/h5'
    },
    wechat: {
      platform: 'wechat',
      outDir: 'dist/wechat',
      appid: 'wx0000000000000000',
      libVersion: '3.5.7',
      gameJson: {
        deviceOrientation: 'portrait',
        showStatusBar: false,
        networkTimeout: {
          request: 10000,
          connectSocket: 10000,
          uploadFile: 10000,
          downloadFile: 10000
        }
      },
      projectConfig: {
        description: 'Pixi8 小游戏 UI 与音频演示',
        setting: {
          urlCheck: false,
          es6: true,
          enhance: true,
          postcss: false,
          minified: true,
          newFeature: true
        }
      }
    },
    douyin: {
      platform: 'douyin',
      outDir: 'dist/douyin',
      appid: 'tt0000000000000000',
      libVersion: '3.0.0',
      gameJson: {
        deviceOrientation: 'portrait',
        showStatusBar: false
      },
      projectConfig: {
        description: 'Pixi8 小游戏 UI 与音频演示',
        setting: {
          es6: true,
          minified: true,
          urlCheck: false
        }
      }
    }
  }
}
