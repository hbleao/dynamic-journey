import { JourneyRunner } from "../../components/JourneyRunner";
import { consultaCreditoJourney } from "../../mock/consultaCreditoJourney";
import styles from "../page.module.css";

export default function CatchAllPage() {
  return (
    <div className={styles.page}>
      <JourneyRunner journey={consultaCreditoJourney} />
    </div>
  );
}
