import React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

// Custom Step Connector with your project's green gradient
const GradientStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(90deg, #8bc34a 0%, #558b2f 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(90deg, #8bc34a 0%, #558b2f 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom Step Icon with your project's green gradient
const GradientStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage: 'linear-gradient(136deg, #8bc34a 0%, #558b2f 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage: 'linear-gradient(136deg, #8bc34a 0%, #558b2f 100%)',
      },
    },
  ],
}));

const GradientStepIconComponent = (props) => {
  const { active, completed, className, icon } = props;

  return (
    <GradientStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? (
        <Check />
      ) : (
        icon
      )}
    </GradientStepIconRoot>
  );
};

const MaterialStepper = ({ 
  steps, 
  currentStep, 
  onStepChange, 
  className = '',
  allowNavigation = true
}) => {
  const handleStepClick = (stepIndex) => {
    if (allowNavigation && onStepChange) {
      onStepChange(stepIndex + 1);
    }
  };

  return (
    <Stack className={className} sx={{ width: '100%' }}>
      <Stepper 
        alternativeLabel 
        activeStep={currentStep - 1} 
        connector={<GradientStepConnector />}
      >
        {steps.map((step, index) => {
          const isClickable = allowNavigation && (index < currentStep || index === currentStep - 1);

          return (
            <Step 
              key={step.id} 
              onClick={() => isClickable && handleStepClick(index)}
              sx={{
                cursor: isClickable ? 'pointer' : 'default',
              }}
            >
              <StepLabel 
                StepIconComponent={(props) => (
                  <GradientStepIconComponent 
                    {...props} 
                    icon={step.icon ? React.createElement(step.icon, { 
                      sx: { fontSize: 24, color: 'white' }
                    }) : index + 1}
                  />
                )}
              >
                {step.title}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Stack>
  );
};

export default MaterialStepper;
