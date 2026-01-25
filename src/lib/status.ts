// 진행 상태 코드 타입
export type ApplicationStatusCode = '01' | '02' | '03' | '04' | '05' | '06'

// 상태 코드 매핑
export const STATUS_CODE_MAP: Record<ApplicationStatusCode, string> = {
  '01': '신청',
  '02': '접수완료',
  '03': '담당자 배정',
  '04': '일정 조율 중',
  '05': 'A/S 완료',
  '06': '처리완료',
}

// 상태 코드 배열 (순서대로)
export const STATUS_CODES: ApplicationStatusCode[] = ['01', '02', '03', '04', '05', '06']

// 상태 코드로 한글명 가져오기
export function getStatusLabel(statusCode: string): string {
  return STATUS_CODE_MAP[statusCode as ApplicationStatusCode] || statusCode
}

// 한글명으로 상태 코드 가져오기
export function getStatusCode(label: string): ApplicationStatusCode | null {
  const entry = Object.entries(STATUS_CODE_MAP).find(([_, value]) => value === label)
  return entry ? (entry[0] as ApplicationStatusCode) : null
}
