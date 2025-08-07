interface ThreatLevelIndicatorProps {
  level: string;
  score: number;
}

export default function ThreatLevelIndicator({ level, score }: ThreatLevelIndicatorProps) {
  const getColor = (level: string) => {
    switch (level) {
      case 'safe':
      case 'low':
        return 'bg-success-500';
      case 'medium':
        return 'bg-warning-500';
      case 'high':
      case 'critical':
        return 'bg-danger-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getWidth = (score: number) => {
    return Math.min(Math.max(score, 0), 100);
  };

  const getLabel = (level: string) => {
    switch (level) {
      case 'safe':
        return 'Safe';
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full">
        <div 
          className={`h-2 rounded-full ${getColor(level)}`}
          style={{ width: `${getWidth(score)}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 min-w-[4rem]">{getLabel(level)}</span>
    </div>
  );
}
