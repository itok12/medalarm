import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getJson, setJson } from '../services/deviceStorage';
import { useAuth } from './AuthContext';
import {
  completeOnboardingState,
  createDefaultOnboardingState,
  getCompletedOnboardingStepCount,
  isOnboardingReadyToComplete,
  markOnboardingStep,
  normalizeOnboardingState,
} from '../utils/onboardingState';

const STORAGE_PREFIX = 'medalarm-onboarding-v1';
const OnboardingContext = createContext(null);

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}-${userId}`;
}

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(createDefaultOnboardingState());
  const [hydrated, setHydrated] = useState(false);

  const persistState = useCallback(
    (nextState) => {
      if (!user?.userId) {
        return;
      }

      setJson(getStorageKey(user.userId), nextState).catch((error) => {
        console.error('Failed to persist onboarding state:', error);
      });
    },
    [user?.userId]
  );

  const applyState = useCallback(
    (updater) => {
      setState((previous) => {
        const nextState = normalizeOnboardingState(
          typeof updater === 'function' ? updater(previous) : updater
        );
        persistState(nextState);
        return nextState;
      });
    },
    [persistState]
  );

  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      if (!user?.userId) {
        if (!ignore) {
          setState(createDefaultOnboardingState());
          setHydrated(true);
        }
        return;
      }

      setHydrated(false);
      const stored = await getJson(getStorageKey(user.userId), null);
      if (!ignore) {
        setState(normalizeOnboardingState(stored || createDefaultOnboardingState()));
        setHydrated(true);
      }
    }

    hydrate();
    return () => {
      ignore = true;
    };
  }, [user?.userId]);

  const value = useMemo(
    () => ({
      hydrated,
      state,
      shouldShowChecklist: hydrated && !state.completedAt,
      completedSteps: getCompletedOnboardingStepCount(state),
      readyToComplete: isOnboardingReadyToComplete(state),
      setOpen: (open) => applyState((previous) => ({ ...previous, open })),
      markStep: (step, value = true) =>
        applyState((previous) => markOnboardingStep(previous, step, value)),
      completeOnboarding: () =>
        applyState((previous) => completeOnboardingState(previous)),
      restartOnboarding: () => applyState(createDefaultOnboardingState()),
    }),
    [applyState, hydrated, state]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;
