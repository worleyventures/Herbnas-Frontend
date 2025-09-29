// GST utility functions

// Valid GST percentage options according to backend validation
export const GST_PERCENTAGE_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
  { value: '40', label: '40%' }
];

// Valid GST percentage values
export const VALID_GST_PERCENTAGES = ['0', '5', '12', '18', '28', '40'];

/**
 * Validates if a GST percentage is valid
 * @param {string|number} gstPercentage - The GST percentage to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidGstPercentage = (gstPercentage) => {
  const gstStr = gstPercentage?.toString();
  return VALID_GST_PERCENTAGES.includes(gstStr);
};

/**
 * Gets the GST percentage validation error message
 * @param {string|number} gstPercentage - The GST percentage to validate
 * @returns {string} - Error message if invalid, empty string if valid
 */
export const getGstPercentageError = (gstPercentage) => {
  if (!gstPercentage) {
    return 'GST percentage is required';
  }
  
  if (!isValidGstPercentage(gstPercentage)) {
    return 'GST percentage must be one of: 0%, 5%, 12%, 18%, 28%, 40%';
  }
  
  return '';
};

/**
 * Calculates GST amount based on base amount and GST percentage
 * @param {number} baseAmount - The base amount before GST
 * @param {string|number} gstPercentage - The GST percentage
 * @returns {number} - The GST amount
 */
export const calculateGstAmount = (baseAmount, gstPercentage) => {
  const percentage = parseFloat(gstPercentage) || 0;
  return (baseAmount * percentage) / 100;
};

/**
 * Calculates total amount including GST
 * @param {number} baseAmount - The base amount before GST
 * @param {string|number} gstPercentage - The GST percentage
 * @returns {number} - The total amount including GST
 */
export const calculateTotalWithGst = (baseAmount, gstPercentage) => {
  const gstAmount = calculateGstAmount(baseAmount, gstPercentage);
  return baseAmount + gstAmount;
};
