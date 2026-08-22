import { getHealthDataset } from "../../lib/data-adapter";
import PipelineStageVisualizer from "../../components/PipelineStageVisualizer";

export default function AgentPage() {
  const dataset = getHealthDataset();

  return (
    <div className="space-y-6">
      {/* 4-Stage Pipeline Visualizer Component */}
      <PipelineStageVisualizer dataset={dataset} />
    </div>
  );
}
