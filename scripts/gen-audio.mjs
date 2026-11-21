/**
 * 生成演示用 WAV 音频（无外部依赖）。
 * 运行：node scripts/gen-audio.mjs
 */
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'public', 'audio')

const SAMPLE_RATE = 22050
const SECONDS = 4

function createWav(frequency) {
  const sampleCount = SAMPLE_RATE * SECONDS
  const dataSize = sampleCount * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / SAMPLE_RATE
    const phase = 2 * Math.PI * frequency * time
    // 基频 + 两个泛音，音量做 1Hz 的轻微起伏
    const tremolo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 1 * time)
    const sample =
      (0.5 * Math.sin(phase) + 0.22 * Math.sin(phase * 2) + 0.08 * Math.sin(phase * 3)) * tremolo * 0.55
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(sample * 32767))), 44 + index * 2)
  }

  return buffer
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  const tracks = [
    { file: 'tone-low.wav', frequency: 220 },
    { file: 'tone-mid.wav', frequency: 440 },
    { file: 'tone-high.wav', frequency: 880 }
  ]

  for (const track of tracks) {
    const wav = createWav(track.frequency)
    await writeFile(path.join(outputDir, track.file), wav)
    console.log(`[audio] ${track.file} ${(wav.length / 1024).toFixed(1)} KB`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
