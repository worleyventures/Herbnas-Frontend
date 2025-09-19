import React from 'react';
import { HiCheck } from 'react-icons/hi2';

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
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepChange(stepNumber)}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ease-in-out
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg scale-105' 
                        : isCurrent 
                          ? 'bg-white border-green-500 text-green-500 shadow-xl scale-110 ring-4 ring-green-100' 
                          : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500'
                      }
                      ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95' : 'cursor-not-allowed'}
                      group
                    `}
                  >
                    {isCompleted ? (
                      <HiCheck className="w-6 h-6 stepper-icon-bounce" />
                    ) : (
                      <IconComponent className={`w-6 h-6 transition-all duration-300 ${
                        isCurrent ? 'stepper-icon-pulse' : 'group-hover:scale-110 group-hover:stepper-icon-rotate'
                      }`} />
                    )}
                  </button>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center transition-all duration-300">
                    <p className={`text-sm font-semibold transition-all duration-300 ${
                      isCurrent ? 'text-green-600 scale-105' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 hidden lg:block transition-all duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 mr-4 transition-all duration-500 ease-in-out
              ${currentStep > 1 
                ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg scale-105' 
                : 'bg-white border-green-500 text-green-500 shadow-xl scale-110 ring-4 ring-green-100'
              }
            `}>
              {currentStep > 1 ? (
                <HiCheck className="w-5 h-5 stepper-icon-bounce" />
              ) : (
                (() => {
                  const IconComponent = steps[currentStep - 1]?.icon;
                  return IconComponent ? (
                    <IconComponent className="w-5 h-5 stepper-icon-pulse" />
                  ) : (
                    <span className="text-sm font-semibold">{currentStep}</span>
                  );
                })()
              )}
            </div>
            <div className="transition-all duration-300">
              <p className="text-sm font-semibold text-gray-900">
                {steps[currentStep - 1]?.title}
              </p>
              <p className="text-xs text-gray-500">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 font-medium">
            {currentStep} / {steps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          >
            <div className="absolute inset-0 stepper-progress-shimmer"></div>
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {steps.map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 scale-125' 
                    : isCurrent 
                      ? 'bg-green-500 scale-150 animate-pulse' 
                      : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
