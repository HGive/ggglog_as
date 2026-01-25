import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { readFile } from 'fs/promises'
import path from 'path'
import { RowDataPacket } from 'mysql2'

export const dynamic = 'force-dynamic'

// GET: 파일 다운로드
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // 첨부파일 정보 조회
    const [attachments] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM attachments WHERE id = ?`,
      [id]
    )

    if (attachments.length === 0) {
      return NextResponse.json(
        { message: '파일을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const attachment = attachments[0]

    // 파일 경로 처리 (상대 경로 또는 절대 경로 모두 지원)
    let filePath: string
    if (path.isAbsolute(attachment.file_path)) {
      // 절대 경로인 경우 (기존 데이터 호환성)
      filePath = attachment.file_path
    } else {
      // 상대 경로인 경우 (새로운 방식)
      filePath = path.join(process.cwd(), attachment.file_path)
    }

    console.log('File path:', filePath)
    
    // 파일 읽기
    let fileBuffer
    try {
      fileBuffer = await readFile(filePath)
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { message: `파일을 읽을 수 없습니다: ${filePath}` },
        { status: 404 }
      )
    }

    // MIME 타입 확인 및 설정
    let mimeType = attachment.mime_type || 'application/octet-stream'
    
    // MIME 타입이 없으면 파일 확장자로 추론
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = path.extname(attachment.file_name).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.heic': 'image/heic',
        '.heif': 'image/heif',
      }
      mimeType = mimeTypes[ext] || 'application/octet-stream'
    }

    // 응답 헤더 설정
    const headers = new Headers()
    headers.set('Content-Type', mimeType)
    
    // 이미지 파일은 inline으로, 그 외는 attachment로
    const isImage = mimeType.startsWith('image/')
    if (isImage) {
      headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.file_name)}"`)
      // 이미지 캐싱 허용
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.file_name)}"`)
    }
    
    headers.set('Content-Length', String(fileBuffer.length))

    console.log('Sending file:', {
      id: attachment.id,
      fileName: attachment.file_name,
      mimeType,
      fileSize: fileBuffer.length,
      isImage,
    })

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json(
      { message: '파일 다운로드에 실패했습니다' },
      { status: 500 }
    )
  }
}
