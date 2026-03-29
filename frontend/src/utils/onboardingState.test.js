import {
  completeOnboardingState,
  createDefaultOnboardingState,
  getCompletedOnboardingStepCount,
  isOnboardingReadyToComplete,
  markOnboardingStep,
  normalizeOnboardingState,
} from './onboardingState';

describe('onboardingState', () => {
  test('creates a default open state', () => {
    const state = createDefaultOnboardingState();

    expect(state.open).toBe(true);
    expect(state.completedAt).toBeNull();
    expect(state.steps).toEqual({
      welcome: false,
      profile: false,
      reminders: false,
      medicine: false,
    });
  });

  test('merges missing step values during normalization', () => {
    const state = normalizeOnboardingState({
      open: false,
      steps: { profile: true },
    });

    expect(state.open).toBe(false);
    expect(state.steps.profile).toBe(true);
    expect(state.steps.reminders).toBe(false);
  });

  test('marks steps complete and counts progress', () => {
    const state = markOnboardingStep(createDefaultOnboardingState(), 'profile');

    expect(state.steps.profile).toBe(true);
    expect(getCompletedOnboardingStepCount(state)).toBe(1);
  });

  test('only becomes ready after key steps are completed', () => {
    let state = createDefaultOnboardingState();
    state = markOnboardingStep(state, 'profile');
    state = markOnboardingStep(state, 'reminders');

    expect(isOnboardingReadyToComplete(state)).toBe(false);

    state = markOnboardingStep(state, 'medicine');
    expect(isOnboardingReadyToComplete(state)).toBe(true);
  });

  test('completing onboarding closes the modal', () => {
    const state = completeOnboardingState(createDefaultOnboardingState());

    expect(state.open).toBe(false);
    expect(state.completedAt).toBeTruthy();
  });
});
