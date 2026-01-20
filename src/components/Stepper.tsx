'use client'

interface StepperProps {
  currentStatus: string
}

const STEPS = [
  '신청',
  '접수완료',
  '담당자 배정',
  '일정 조율 중',
  'A/S 완료',
  '처리완료'
]

export default function Stepper({ currentStatus }: StepperProps) {
  const currentIndex = STEPS.indexOf(currentStatus)
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* 연결선 */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300 -z-10" />
        
        {STEPS.map((step, index) => {
          const isActive = index <= currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <div key={step} className="flex flex-col items-center">
              {/* 원형 마커 */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white
                  ${isActive ? 'border-black' : 'border-gray-300'}
                  ${isCurrent ? 'bg-black' : ''}
                `}
              >
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              
              {/* 라벨 */}
              <span
                className={`mt-2 text-xs whitespace-nowrap
                  ${isActive ? 'text-black font-medium' : 'text-gray-400'}
                `}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { STEPS }
