import { JourneyRunner } from "../components/JourneyRunner";
import { sampleJourney } from "../mock/sampleJourney";

export default function Home() {
  return (
    <div>
      <JourneyRunner journey={sampleJourney} />
    </div>
  );
}
