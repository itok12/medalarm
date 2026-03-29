export const ONBOARDING_VERSION = 1;

export const ONBOARDING_STEP_ORDER = ['welcome', 'profile', 'reminders', 'medicine'];

const DEFAULT_STEPS = {
  welcome: false,
  profile: false,
  reminders: false,
  medicine: false,
};

export function createDefaultOnboardingState() {
  const now = new Date().toISOString();
  return {
    version: ONBOARDING_VERSION,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    open: true,
    steps: { ...DEFAULT_STEPS },
  };
}

export function normalizeOnboardingState(state) {
  const base = createDefaultOnboardingState();
  return {
    ...base,
    ...state,
    steps: {
      ...DEFAULT_STEPS,
      ...(state?.steps || {}),
    },
    open: state?.completedAt ? false : state?.open ?? true,
    completedAt: state?.completedAt || null,
    startedAt: state?.startedAt || base.startedAt,
    updatedAt: state?.updatedAt || base.updatedAt,
  };
}

export function markOnboardingStep(state, step, value = true) {
  const next = normalizeOnboardingState(state);
  if (!Object.prototype.hasOwnProperty.call(next.steps, step)) {
    return next;
  }

  return {
    ...next,
    updatedAt: new Date().toISOString(),
    steps: {
      ...next.steps,
      [step]: value,
    },
  };
}

export function completeOnboardingState(state) {
  const next = normalizeOnboardingState(state);
  const now = new Date().toISOString();
  return {
    ...next,
    completedAt: now,
    updatedAt: now,
    open: false,
  };
}

export function isOnboardingReadyToComplete(state) {
  const next = normalizeOnboardingState(state);
  return next.steps.profile && next.steps.reminders && next.steps.medicine;
}

export function getCompletedOnboardingStepCount(state) {
  const next = normalizeOnboardingState(state);
  return ONBOARDING_STEP_ORDER.filter((step) => next.steps[step]).length;
}
