import { JourneyRunner } from "../components/JourneyRunner";
import { sampleJourney } from "../mock/sampleJourney";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true" />
            <div>
              <div className={styles.title}>Dynamic Journey</div>
              <div className={styles.subtitle}>
                Fluxo configurável com validações e chamadas de serviço
              </div>
            </div>
          </div>
        </header>

        <section className={styles.content}>
          <JourneyRunner journey={sampleJourney} />
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerText}>
            Feito para prototipar jornadas com rapidez.
          </span>
        </footer>
      </main>
    </div>
  );
}
