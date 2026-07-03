import JSZip from 'jszip'
import { idb } from './idb'
import { SOG_FORMAT_VERSION, type SogManifest } from '../types/sog'
import { migrateGameToV2 } from './legacyMigration'

export async function importSogFile(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file)
  const manifestFile = zip.file('game.json')
  if (!manifestFile) throw new Error('Некорректный файл .sog: отсутствует game.json')

  const manifest = JSON.parse(await manifestFile.async('text')) as SogManifest
  if (manifest.formatVersion > SOG_FORMAT_VERSION) {
    throw new Error('Файл создан более новой версией приложения')
  }
  if (manifest.formatVersion === 1) {
    manifest.game = migrateGameToV2(manifest.game)
  } else if (manifest.formatVersion !== SOG_FORMAT_VERSION) {
    throw new Error('Неподдерживаемая версия формата .sog')
  }

  for (const asset of manifest.assets) {
    const assetFile = zip.file(`assets/${asset.filename}`)
    if (!assetFile) continue
    const data = await assetFile.async('blob')
    await idb.setAsset(asset.id, new Blob([data], { type: asset.mimeType }))
  }

  await idb.setGame(manifest.game)
  return manifest.game.id
}
