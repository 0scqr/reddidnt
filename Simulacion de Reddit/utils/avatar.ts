export function getAvatarColor(identifier: string): string {
  const colors = [
    '#fbcfe8', // soft pink
    '#bfdbfe', // light blue
    '#e9d5ff', // lavender
    '#a7f3d0', // mint
    '#fed7aa', // soft orange
    '#fde68a', // soft yellow
  ];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
