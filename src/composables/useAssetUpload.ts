import { idb } from '../services/idb'
import { createId } from '../services/id'
import { confirmDialog } from './useConfirm'

const MAX_ASSET_BYTES = 15 * 1024 * 1024

export function useAssetUpload() {
  async function uploadAsset(file: File): Promise<string> {
    if (file.size > MAX_ASSET_BYTES) {
      const sizeMb = Math.round(file.size / 1024 / 1024)
      const proceed = await confirmDialog(`Файл «${file.name}» довольно большой (${sizeMb} МБ). Загрузить всё равно?`)
      if (!proceed) throw new Error('upload cancelled')
    }
    const id = createId()
    await idb.setAsset(id, file)
    return id
  }

  return { uploadAsset }
}
