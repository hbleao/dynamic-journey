"use client";

import { Button } from "@/components/elements/Button";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { renderJourneyElement } from "./elementRegistry";
import styles from "./JourneyRunner.module.css";
import { useJourneyRunnerController } from "./journeyRunner/useJourneyRunnerController";

export function JourneyRunner({ journey }: { journey: JourneyDefinition }) {
  const c = useJourneyRunnerController(journey);

  if (!c.currentStep) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>Jornada sem steps.</div>
      </div>
    );
  }

  if (c.submitted) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.inner}>
            <div className={styles.result}>
              <div className={styles.title}>
                <div className={styles.kicker}>Resultado</div>
                <div className={styles.stepName}>Payload final</div>
              </div>
              <pre className={styles.code}>
                {JSON.stringify(c.submitted, null, 2)}
              </pre>
              <div className={styles.actions}>
                <div />
                <div className={styles.actionsRight}>
                  <Button
                    type="button"
                    styles="secondary"
                    onClick={() => c.setSubmitted(null)}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

          <form
            onSubmit={(event) => {
              event.preventDefault();
              c.goNext();
            }}
          >
            <div className={styles.body}>
              {c.sortedElements.map((element) => (
                <div key={element.id}>
                  {renderJourneyElement(element, {
                    register: c.register,
                    control: c.control,
                    errors: c.formState.errors,
                    navigateToStepSlug: c.navigateToStepSlug,
                    callService: c.callServiceAndNavigate,
                    bussines: c.bussines,
                    canProceed: c.canProceed,
                  })}
                </div>
              ))}
            </div>

            {c.navigationElements.length === 0 ? (
              <div className={styles.actions}>
                <Button
                  type="button"
                  styles="ghost"
                  disabled={!c.currentStep.backStepSlug}
                  onClick={c.goPrev}
                >
                  Anterior
                </Button>
                <div className={styles.actionsRight}>
                  <Button type="button" onClick={c.goNext} width="fluid">
                    {c.currentStepIndex === c.stepCount - 1
                      ? "Enviar"
                      : "Próximo"}
                  </Button>
                </div>
              </div>
            ) : null}
          </form>

          <details className={styles.debug}>
            <summary className={styles.debugSummary}>
              Debug (valores atuais)
            </summary>
            <pre className={styles.code}>
              {JSON.stringify(
                {
                  fieds: c.getValues(),
                  error: c.storedError,
                  bussines: c.bussines,
                  services: c.services,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
