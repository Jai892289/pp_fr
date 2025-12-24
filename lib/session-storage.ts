const STORAGE_KEY = 'property_assessment_form';

export const saveFormToSession = (data: {
  formData: any;
  currentStep: number;
  completedSteps: number[];
}) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const loadFormFromSession = () => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

export const clearFormSession = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};