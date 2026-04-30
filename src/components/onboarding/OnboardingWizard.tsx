import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DEMO_WORKSPACE_NAME,
  ONBOARDING_STEPS,
} from "@/content/onboardingSteps";
import { track } from "@/lib/telemetry";
import { STORAGE_ENVIRONMENT, STORAGE_ONBOARDING_COMPLETE } from "@/lib/storageKeys";
import { emitSetupChanged } from "@/lib/setupEvents";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import styles from "./OnboardingWizard.module.css";

type EnvironmentChoice = "sandbox" | "live";

export function OnboardingWizard() {
  const navigate = useNavigate();
  const stepAnnounceId = useId();
  const [stepIndex, setStepIndex] = useState(0);
  const [environment, setEnvironment] = useState<EnvironmentChoice>("sandbox");
  const [demoLoaded, setDemoLoaded] = useState(false);

  const step = ONBOARDING_STEPS[stepIndex];
  const total = ONBOARDING_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  const liveMessage = useMemo(() => {
    return `Step ${stepIndex + 1} of ${total}: ${step.title}. ${step.body}`;
  }, [step, stepIndex, total]);

  useEffect(() => {
    const el = document.getElementById(stepAnnounceId);
    if (el) el.textContent = liveMessage;
  }, [liveMessage, stepAnnounceId]);

  const finishOnboarding = useCallback(
    (kind: "finish" | "skip") => {
      localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
      localStorage.setItem(STORAGE_ENVIRONMENT, environment);
      if (demoLoaded) {
        seedDemoWorkspace("onboarding");
      }
      emitSetupChanged();
      track("setup_cta_clicked", {
        action: kind === "skip" ? "onboarding_skip" : "onboarding_complete",
        environment,
        demoLoaded,
      });
      navigate("/home", { replace: true });
    },
    [demoLoaded, environment, navigate],
  );

  const handleNext = () => {
    if (isLast) {
      finishOnboarding("finish");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, total - 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleSkip = () => {
    finishOnboarding("skip");
  };

  return (
    <div className={styles.page} data-testid="onboarding-wizard">
      <header className={styles.topBar}>
        <span className={styles.brand}>Hypegamer Control Plane</span>
        <button type="button" className={styles.skip} onClick={handleSkip}>
          Skip setup and go to app
        </button>
      </header>

      <div
        id={stepAnnounceId}
        className={styles.liveRegion}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className={styles.main}>
        <nav className={styles.rail} aria-label="Setup steps">
          <p className={styles.railTitle}>Your path</p>
          {ONBOARDING_STEPS.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <button
                key={s.id}
                type="button"
                data-onboarding-step={s.id}
                className={`${styles.railStep} ${active ? styles.railStepActive : ""} ${done ? styles.railStepDone : ""}`}
                onClick={() => setStepIndex(i)}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={`${styles.railNum} ${active ? styles.railNumActive : ""} ${done ? styles.railNumDone : ""}`}
                  aria-hidden
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={styles.railLabel}>{s.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.window} role="region" aria-labelledby="onboarding-window-title">
          <div className={styles.windowHeader}>
            <span className={styles.stepTag}>
              Step {stepIndex + 1} of {total}
            </span>
            <h1 id="onboarding-window-title" className={styles.windowTitle}>
              {step.title}
            </h1>
            <p className={styles.windowBody}>{step.body}</p>
          </div>

          {step.id === "workspace" ? (
            <div
              className={styles.choiceRow}
              role="group"
              aria-label="Workspace preview"
            >
              <div
                className={`${styles.choice} ${styles.choiceSelected}`}
                tabIndex={0}
              >
                <p className={styles.choiceTitle}>{DEMO_WORKSPACE_NAME}</p>
                <p className={styles.choiceHint}>
                  Demo name for this session. Rename anytime in Settings.
                </p>
              </div>
            </div>
          ) : null}

          {step.id === "environment" ? (
            <div className={styles.choiceRow} role="group" aria-label="Environment">
              <button
                type="button"
                className={`${styles.choice} ${environment === "sandbox" ? styles.choiceSelected : ""}`}
                onClick={() => setEnvironment("sandbox")}
                aria-pressed={environment === "sandbox"}
              >
                <p className={styles.choiceTitle}>Sandbox</p>
                <p className={styles.choiceHint}>
                  Safe previews, fixtures, and non-production labels.
                </p>
              </button>
              <button
                type="button"
                className={`${styles.choice} ${environment === "live" ? styles.choiceSelected : ""}`}
                onClick={() => setEnvironment("live")}
                aria-pressed={environment === "live"}
              >
                <p className={styles.choiceTitle}>Live</p>
                <p className={styles.choiceHint}>
                  Operational data. Use when sources are approved.
                </p>
              </button>
            </div>
          ) : null}

          {step.id === "connect_source" && step.substeps ? (
            <ol className={styles.substeps}>
              {step.substeps.map((sub, idx) => (
                <li key={sub.title} className={styles.substep}>
                  <span className={styles.substepNum} aria-hidden>
                    {idx + 1}
                  </span>
                  <div>
                    <p className={styles.substepTitle}>{sub.title}</p>
                    <p className={styles.substepDetail}>{sub.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}

          {step.id === "verify_data" ? (
            <div
              className={styles.choiceRow}
              role="group"
              aria-label="Demo data"
            >
              <button
                type="button"
                className={`${styles.choice} ${demoLoaded ? styles.choiceSelected : ""}`}
                onClick={() => setDemoLoaded(true)}
                aria-pressed={demoLoaded}
              >
                <p className={styles.choiceTitle}>Load demo workspace</p>
                <p className={styles.choiceHint}>
                  Seeds sample competitions, sources, and activity for teaching UI.
                </p>
              </button>
              <button
                type="button"
                className={`${styles.choice} ${!demoLoaded ? styles.choiceSelected : ""}`}
                onClick={() => setDemoLoaded(false)}
                aria-pressed={!demoLoaded}
              >
                <p className={styles.choiceTitle}>Continue without demo data</p>
                <p className={styles.choiceHint}>
                  You will see clear empty states until data exists.
                </p>
              </button>
            </div>
          ) : null}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.back}
              onClick={handleBack}
              disabled={isFirst}
            >
              Back
            </button>
            <button type="button" className={styles.next} onClick={handleNext}>
              {isLast ? "Finish and open command center" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
