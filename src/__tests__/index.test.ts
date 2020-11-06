import { generateLink, getRightElectron } from '../utils'
import fixtures from './fixturs'

describe('epuppy', () => {
  describe('generateLink', () => {
    test('beta', () => {
      const result = generateLink(fixtures.beta)
      expect(result).toEqual(
        'https://electronjs.org/releases/beta#9.0.0-beta.24'
      )
    })

    test('nighlty', () => {
      const result = generateLink(fixtures.nighlty)
      expect(result).toEqual(
        'https://electronjs.org/releases/nightly#10.0.0-nightly.20200520'
      )
    })

    test('stable', () => {
      const result = generateLink(fixtures.stable)
      expect(result).toEqual('https://electronjs.org/releases/stable#9.0.0')
    })
  })

  describe('getRightEleectron', () => {
    test('nighlty', () => {
      const result = getRightElectron(fixtures.nighlty)
      expect(result).toEqual('electron-nightly')
    })

    test('stable and beta', () => {
      const result = getRightElectron(fixtures.stable)
      expect(result).toEqual('electron')
    })
  })
})
