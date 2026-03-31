"use client";

import { useJourneyRunnerController } from "@/hooks/useJourneyRunnerController";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { renderJourneyElement } from "./elementRegistry";
import styles from "./JourneyRunner.module.css";

export function JourneyRunner({ journey }: { journey: JourneyDefinition }) {
  const c = useJourneyRunnerController(journey);

  if (!c.currentStep) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>Jornada sem steps.</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.inner}>
          <div className={styles.top}>
            <div className={styles.title}>
              <div className={styles.kicker}>
                Step {c.currentStepIndex + 1} de {c.stepCount}
              </div>
              <div className={styles.stepName}>{c.currentStep.name}</div>
            </div>
            <div className={styles.progress} aria-hidden="true">
              {c.steps.map((s, i) => (
                <span
                  key={s.id}
                  className={`${styles.dot} ${
                    i === c.currentStepIndex ? styles.dotActive : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {c.storedErrorEntries.length > 0 ? (
            <div className={styles.errorBox}>
              <div className={styles.errorTitle}>
                Revise os campos antes de continuar
              </div>
              <ul className={styles.errorList}>
                {c.storedErrorEntries.map(([key, message]) => (
                  <li key={key}>
                    {key}: {message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.body}>
            {c.sortedElements.map((element) => (
              <div key={element.id}>
                {renderJourneyElement(element, {
                  register: c.register,
                  control: c.control,
                  errors: c.formState.errors,
                  goNext: c.goNext,
                  business: c.business,
                  canProceed: c.canProceed,
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
