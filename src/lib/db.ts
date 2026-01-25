import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'ggglog',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ggglog_as',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool

// 타입 정의
export interface Application {
  id: number
  name: string
  phone: string
  email: string
  address: string
  completion_year: string
  site_manager: string | null
  designer: string | null
  title: string
  content: string
  status: string
  created_at: Date
  updated_at: Date
}

export interface Attachment {
  id: number
  application_id: number
  file_name: string
  file_path: string
  file_size: number
  created_at: Date
}

export interface Admin {
  id: number
  username: string
  password: string
  email: string
  created_at: Date
}

// 상태 관련 함수는 src/lib/status.ts로 이동했습니다
// 클라이언트 컴포넌트에서 사용 가능하도록 분리
