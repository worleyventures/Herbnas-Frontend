import React from 'react';
import { HiCheck, HiChevronRight } from 'react-icons/hi2';

const Stepper = ({ 
  steps, 
  currentStep, 
  onStepChange, 
  className = '',
  allowNavigation = true 
}) => {
  return (
    <div className={`stepper-container ${className}`}>
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isClickable = allowNavigation && (isCompleted || stepNumber === currentStep);
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepChange(stepNumber)}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${isCompleted 
                        ? 'bg-[#22c55e] border-[#22c55e] text-white' 
                        : isCurrent 
                          ? 'bg-white border-[#22c55e] text-[#22c55e] shadow-lg' 
                          : 'bg-white border-gray-300 text-gray-400'
                      }
                      ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}
                    `}
                  >
                    {isCompleted ? (
                      <HiCheck className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </button>
                  
                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      isCurrent ? 'text-[#22c55e]' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 hidden lg:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-[#22c55e]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3
              ${currentStep > 1 
                ? 'bg-[#22c55e] border-[#22c55e] text-white' 
                : 'bg-white border-[#22c55e] text-[#22c55e]'
              }
            `}>
              {currentStep > 1 ? (
                <HiCheck className="w-4 h-4" />
              ) : (
                <span className="text-sm font-semibold">{currentStep}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {steps[currentStep - 1]?.title}
              </p>
              <p className="text-xs text-gray-500">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {currentStep} / {steps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#22c55e] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Stepper;
