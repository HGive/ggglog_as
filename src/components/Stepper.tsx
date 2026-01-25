'use client'

import { STATUS_CODES, STATUS_CODE_MAP, getStatusLabel } from '@/lib/status'

interface StepperProps {
  currentStatus: string // 상태 코드 (01, 02, ...) 또는 한글명 (하위 호환성)
}

export default function Stepper({ currentStatus }: StepperProps) {
  // 상태 코드로 변환 (한글명이면 코드로, 코드면 그대로)
  const statusCode = currentStatus.length === 2 && /^\d{2}$/.test(currentStatus) 
    ? currentStatus as '01' | '02' | '03' | '04' | '05' | '06'
    : Object.entries(STATUS_CODE_MAP).find(([_, label]) => label === currentStatus)?.[0] as '01' | '02' | '03' | '04' | '05' | '06' | undefined
  
  const currentIndex = statusCode ? STATUS_CODES.indexOf(statusCode) : -1
  
  return (
    <div className="w-full py-4 px-0 md:px-12">
      <div className="flex items-center justify-between relative">
        {/* 연결선 */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300 -z-10" />
        
        {STATUS_CODES.map((code, index) => {
          const isCompleted = index <= currentIndex // 완료된 상태 (현재 상태 포함)
          const isCurrent = index === currentIndex // 현재 상태
          const isActive = index <= currentIndex // 활성 상태 (완료 + 현재)
          const label = STATUS_CODE_MAP[code]
          
          // 상태별 색상 결정
          let statusColor = 'gray'
          if (code === '01') {
            statusColor = 'gray'
          } else if (['02', '03', '04'].includes(code)) {
            statusColor = 'blue'
          } else if (['05', '06'].includes(code)) {
            statusColor = 'green'
          }
          
          return (
            <div key={code} className="flex flex-col items-center">
              {/* 원형 마커 */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${isActive 
                    ? statusColor === 'green' ? 'border-green-600 bg-green-600' 
                      : statusColor === 'blue' ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-600 bg-gray-600'
                    : 'border-gray-300 bg-white'}
                `}
              >
                {isCompleted && (
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              {/* 라벨 */}
              <span
                className={`mt-2 text-xs whitespace-nowrap
                  ${isActive 
                    ? statusColor === 'green' ? 'text-green-600 font-medium' 
                      : statusColor === 'blue' ? 'text-blue-600 font-medium' 
                      : 'text-gray-600 font-medium'
                    : 'text-gray-400'}
                `}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { STATUS_CODES as STEPS }
