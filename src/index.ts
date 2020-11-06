if (
  !process.env.CONSUMER_KEY ||
  !process.env.CONSUMER_SECRET ||
  !process.env.ACCESS_TOKEN ||
  !process.env.ACCESS_TOKEN_SECRET
) {
  require('dotenv').config()
}
import axios from 'axios'
import * as Twit from 'twit'
import * as pkg from '../package.json'
import * as execa from 'execa'
import { generateLink, getRightElectron } from './utils'
import { IVersion } from './types'

const twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY!,
  consumer_secret: process.env.CONSUMER_SECRET!,
  access_token: process.env.ACCESS_TOKEN!,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET!,
})

// TODO: Clarify these dates
const MIN_DAYS = 1
const TWIT_NIGHTLY = process.env.TWIT_NIGHTLY || true

const foundNewVersion = async () => {
  const verInPackage = pkg.dependencies['mini-electron-releases']
  const verOnNPM = (
    await axios.get('https://registry.npmjs.com/mini-electron-releases', {
      responseType: 'json',
    })
  ).data['dist-tags'].latest

  if (verOnNPM === verInPackage) {
    return undefined
  } else {
    return { npm: verOnNPM, package: verInPackage }
  }
}

const updateReleases = async (npmVersion: string) =>
  await execa('yarn', ['upgrade', `mini-electron-releases@${npmVersion}`])

const getReleases = async () => {
  console.log('Getting new releases')
  const eReleases = await import('mini-electron-releases')
  const now = new Date()
  let newReleases: Array<any> = []
  for (const release of eReleases) {
    const releaseDate = new Date(release.published_at)
    const diffTime = Math.abs(now.getTime() - releaseDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays <= MIN_DAYS) {
      newReleases.push(release)
    }
  }

  newReleases.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )
  return newReleases
}

const generateMessage = (version: IVersion) => {
  if (
    version.npm_package_name === 'NFUSINGv1' ||
    version.npm_package_name === 'NFUSINGv2'
  ) {
    console.log('Found version whats doesnt published to npm, exiting')
    process.exit(0)
  }

  const link = generateLink(version)
  const electron = getRightElectron(version)

  if (electron === 'electron-nightly' && !TWIT_NIGHTLY) {
    console.log('Twitting about Nightly releases disabled!')
    return process.exit(0)
  }

  const message = `There's a new @electronjs release available: ${version.version} is out now! 🐶
$ npm install ${electron}@${version.version}
🔗 Release notes (will be) available here:
${link}
`

  if (process.env.NODE_ENV !== 'development') {
    return sendTweet(message)
  } else {
    console.log(message)
  }
}

const sendTweet = (text: string) => {
  console.log('Sending tweet :yay:')
  twitter.post('statuses/update', { status: text }, (err, data) => {
    if (!err) {
      return data
    }

    return
  })
}

const maybePushNewVersion = async () => {
  const { stdout: status } = await execa('git', ['status', '--porcelain'])

  if (status.length >= 1) {
    console.log('New changes found, pushing new version')
    await execa('git', ['add', '.'])
    await execa('git', [
      'commit',
      '-m',
      `Updating automatic files (${new Date().toISOString()})`,
    ])
    await execa('git', ['push'])
  }
}

async function main() {
  const version = await foundNewVersion()
  if (!version) {
    console.log('Version the same, exiting.')
    process.exit(0)
  }
  console.log(
    `Versions differents, updating electron-releases to ${version.npm}`
  )
  await updateReleases(version.npm)
  const releases = await getReleases()
  if (releases.length === 0) {
    console.log('No releases found, exiting.')
    process.exit(0)
  }
  generateMessage(releases[0])
  await maybePushNewVersion()
}

main().catch((err) => {
  console.log('Something goes wrong, error: ', err)
  process.exit(1)
})
