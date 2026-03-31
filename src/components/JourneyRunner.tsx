"use client";

import { useJourneyController } from "@/hooks/useJourneyController";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { renderJourneyElement } from "./elementRegistry";
import styles from "./JourneyRunner.module.css";

export function JourneyRunner({ journey }: { journey: JourneyDefinition }) {
  const c = useJourneyController(journey);

  return (
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
  );
}
