import { describe, it, expect } from 'vitest'
import { EventEmitter } from '../src/utils/event-emitter'

describe('EventEmitter', () => {
  it('should emit events', () => {
    const emitter = new EventEmitter()
    let called = false
    
    emitter.on('test', () => {
      called = true
    })
    
    emitter.emit('test')
    expect(called).toBe(true)
  })

  it('should pass arguments to listeners', () => {
    const emitter = new EventEmitter()
    let receivedArgs: any[] = []
    
    emitter.on('test', (...args: any[]) => {
      receivedArgs = args
    })
    
    emitter.emit('test', 1, 'test', { key: 'value' })
    expect(receivedArgs).toEqual([1, 'test', { key: 'value' }])
  })

  it('should remove listeners', () => {
    const emitter = new EventEmitter()
    let callCount = 0
    
    const callback = () => {
      callCount++
    }
    
    emitter.on('test', callback)
    emitter.emit('test')
    emitter.off('test', callback)
    emitter.emit('test')
    
    expect(callCount).toBe(1)
  })

  it('should handle once', () => {
    const emitter = new EventEmitter()
    let callCount = 0
    
    emitter.once('test', () => {
      callCount++
    })
    
    emitter.emit('test')
    emitter.emit('test')
    
    expect(callCount).toBe(1)
  })
})
