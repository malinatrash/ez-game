export interface MediaDims {
  w: number
  h: number
}

export function readImageDimensions(file: File): Promise<MediaDims | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export function readVideoDimensions(file: File): Promise<MediaDims | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      resolve({ w: video.videoWidth, h: video.videoHeight })
      URL.revokeObjectURL(url)
    }
    video.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    video.src = url
  })
}
