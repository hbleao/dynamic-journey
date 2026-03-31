import { JourneyRunner } from "../components/JourneyRunner";
import { sampleJourney } from "../mock/sampleJourney";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <JourneyRunner journey={sampleJourney} />
    </div>
  );
}
