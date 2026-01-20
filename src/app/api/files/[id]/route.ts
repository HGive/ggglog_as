import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { readFile } from 'fs/promises'
import { RowDataPacket } from 'mysql2'

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

    // 파일 읽기
    const fileBuffer = await readFile(attachment.file_path)

    // 응답 헤더 설정
    const headers = new Headers()
    headers.set('Content-Type', attachment.mime_type || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.file_name)}"`)
    headers.set('Content-Length', String(fileBuffer.length))

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
