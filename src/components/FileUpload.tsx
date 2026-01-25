'use client'

import { useState, useRef, ChangeEvent } from 'react'
import imageCompression from 'browser-image-compression'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxSize?: number // MB
  maxFiles?: number
  accept?: string
  error?: string
}

// 허용된 이미지 파일 확장자
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif']
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/heic',
  'image/heif'
]

// 파일이 허용된 이미지 형식인지 검증
const isValidImageFile = (file: File): boolean => {
  // MIME 타입 체크
  if (ALLOWED_MIME_TYPES.includes(file.type)) {
    return true
  }
  
  // 확장자로 추가 체크 (MIME 타입이 없는 경우 대비)
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return true
  }
  
  return false
}

export default function FileUpload({
  onFilesChange,
  maxSize = 5,
  maxFiles = 10,
  accept = '.jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.heif,image/*',
  error,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [fileErrors, setFileErrors] = useState<Record<number, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // 이미지 압축 함수
  const compressImage = async (file: File): Promise<File> => {
    // 원본 파일 크기 확인
    const originalSizeMB = file.size / (1024 * 1024)
    
    // 1MB 이하는 압축하지 않음
    if (originalSizeMB <= 1) {
      return file
    }

    // 압축 옵션 (1-5MB 파일용)
    const options = {
      maxSizeMB: 1, // 최종 목표 크기 (1MB 이하)
      maxWidthOrHeight: 1920, // 최대 해상도
      useWebWorker: true,
      fileType: file.type.includes('png') ? 'image/jpeg' : file.type,
      initialQuality: 0.8,
    }

    try {
      const compressedFile = await imageCompression(file, options)
      const compressedSizeMB = compressedFile.size / (1024 * 1024)
      
      // 압축 결과가 원본보다 큰 경우 원본 반환
      if (compressedFile.size >= file.size) {
        console.warn('압축 후 크기가 더 큽니다. 원본 파일을 사용합니다.')
        return file
      }
      
      // 원본 파일명 유지 (압축된 파일의 name이 변경될 수 있으므로)
      const originalFileName = file.name
      const newFile = new File([compressedFile], originalFileName, {
        type: compressedFile.type,
        lastModified: file.lastModified,
      })
      
      console.log(`압축 완료: ${originalSizeMB.toFixed(1)}MB → ${compressedSizeMB.toFixed(1)}MB`)
      return newFile
    } catch (error) {
      console.error('Image compression error:', error)
      console.warn('압축 실패, 원본 파일로 업로드합니다.')
      // 압축 실패 시 원본 파일 반환
      return file
    }
  }


  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray = Array.from(newFiles)
    const newErrors: Record<number, string> = {}
    const validFiles: File[] = []
    const currentFileCount = files.length

    setCompressing(true)

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const fileIndex = currentFileCount + i

      // 이미지 파일 형식 체크
      if (!isValidImageFile(file)) {
        newErrors[fileIndex] = '이미지 파일만 업로드 가능합니다 (jpg, jpeg, png, gif, webp)'
        continue
      }
      
      // 크기 체크 (5MB 초과 시 에러)
      if (file.size > maxSize * 1024 * 1024) {
        newErrors[fileIndex] = `파일 크기가 ${maxSize}MB를 초과합니다.`
        continue
      }

      // 1MB 이하는 압축하지 않고, 1MB 초과는 압축
      try {
        const processedFile = await compressImage(file)
        validFiles.push(processedFile)
      } catch (error) {
        console.error('File processing error:', error)
        newErrors[fileIndex] = '파일 처리 중 오류가 발생했습니다.'
      }
    }

    // 최대 파일 수 체크
    const totalFiles = [...files, ...validFiles].slice(0, maxFiles)
    const remainingSlots = maxFiles - files.length
    if (validFiles.length > remainingSlots) {
      // 초과된 파일에 대한 에러 추가
      validFiles.slice(remainingSlots).forEach((_, idx) => {
        newErrors[currentFileCount + validFiles.length - remainingSlots + idx] = 
          `최대 ${maxFiles}개까지만 업로드 가능합니다.`
      })
    }

    setFileErrors(prev => ({ ...prev, ...newErrors }))
    setFiles(totalFiles)
    onFilesChange(totalFiles)
    setCompressing(false)

    // 에러 메시지 3초 후 자동 제거
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        setFileErrors(prev => {
          const updated = { ...prev }
          Object.keys(newErrors).forEach(key => {
            delete updated[Number(key)]
          })
          return updated
        })
      }, 3000)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles)
    // 해당 파일의 에러도 제거
    const newErrors = { ...fileErrors }
    delete newErrors[index]
    setFileErrors(newErrors)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        사진첨부 <span className="text-red-500">*</span>
      </label>
      
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <svg 
          className="mx-auto h-12 w-12 text-gray-400 mb-4" 
          stroke="currentColor" 
          fill="none" 
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        <p className="text-gray-600">
          클릭하거나 파일을 드래그하세요
        </p>
        <p className="text-sm text-gray-400 mt-1">
          이미지 파일만 가능 (jpg, jpeg, png, gif, webp)
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          최대 {maxFiles}개, 각 파일 {maxSize}MB 이하
        </p>
        {compressing && (
          <p className="text-sm text-blue-600 mt-2">이미지 압축 중...</p>
        )}
      </div>

      {/* 파일별 에러 메시지 */}
      {Object.keys(fileErrors).length > 0 && (
        <div className="mt-2 space-y-1">
          {Object.entries(fileErrors).map(([index, errorMsg]) => (
            <p key={index} className="text-sm text-red-500">
              {errorMsg}
            </p>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                    {file.size < 1024 * 1024 && file.size < (files.find(f => f.name === file.name)?.size || file.size) && (
                      <span className="text-green-600 ml-1">(압축됨)</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
