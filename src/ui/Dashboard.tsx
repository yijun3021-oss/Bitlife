import type { LifeStateV2 } from '../game/lifeStateV2';
import { LifeTimeline } from './LifeTimeline';

interface DashboardProps {
  life: LifeStateV2;
  onChoose(choiceId: string): void;
}

export function Dashboard({ life, onChoose }: DashboardProps) {
  return (
    <div className="life-dashboard">
      <LifeTimeline life={life} onChoose={onChoose} />
    </div>
  );
}
