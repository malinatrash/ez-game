import JSZip from 'jszip'
import { idb } from './idb'
import { collectAssetIds } from './sogAssets'
import { SOG_FORMAT_VERSION, type AssetIndexEntry, type SogManifest } from '../types/sog'

function extensionFromMime(mime: string): string {
  const subtype = mime.split('/')[1] ?? 'bin'
  return subtype.split(';')[0]
}

export async function exportGameToSog(gameId: string): Promise<void> {
  const game = await idb.getGame(gameId)
  if (!game) throw new Error('Game not found')

  const zip = new JSZip()
  const assets: AssetIndexEntry[] = []

  for (const id of collectAssetIds(game)) {
    const blob = await idb.getAsset(id)
    if (!blob) continue
    const filename = `${id}.${extensionFromMime(blob.type)}`
    assets.push({ id, filename, mimeType: blob.type })
    zip.file(`assets/${filename}`, blob)
  }

  const manifest: SogManifest = { formatVersion: SOG_FORMAT_VERSION, game, assets }
  zip.file('game.json', JSON.stringify(manifest))

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${game.meta.title || 'game'}.sog`
  link.click()
  URL.revokeObjectURL(url)
}
