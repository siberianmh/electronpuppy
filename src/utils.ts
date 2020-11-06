import { IVersion } from './types'

export const generateLink = (version: IVersion) => {
  console.log('Generating link for message')
  const url = 'https://electronjs.org/releases'
  let link = `${url}/stable#${version.version}`
  if (version.npm_dist_tags.includes('beta')) {
    link = `${url}/beta#${version.version}`
  } else if (version.npm_dist_tags.includes('nightly')) {
    link = `${url}/nightly#${version.version}`
  } else if (version.npm_dist_tags.includes('stable')) {
    link = `${url}/stable#${version.version}`
  }

  return link
}

export const getRightElectron = (version: IVersion) => {
  if (version.npm_dist_tags.includes('nightly')) {
    return `electron-nightly`
  }

  return 'electron'
}

// export const requireUncached = (module: string) => {
//   delete require.cache[require.resolve(module)]
//   return require(module)
// }
