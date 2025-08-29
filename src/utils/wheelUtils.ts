const COLORS = ['#d50f25', '#3369e8', '#eeb211', '#009925'];

export function distributeColors(numSegments: number): string[] {
  const distributedColors: string[] = [];
  
  for (let i = 0; i < numSegments; i++) {
    distributedColors.push(COLORS[i % COLORS.length]);
  }
  
  return distributedColors;
}

export function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export function getSegmentPath(index: number, total: number, centerX: number, centerY: number, radius: number) {
  const angle = (360 / total);
  const startAngle = index * angle;
  const endAngle = (index + 1) * angle;
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = angle <= 180 ? "0" : "1";
  
  return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}