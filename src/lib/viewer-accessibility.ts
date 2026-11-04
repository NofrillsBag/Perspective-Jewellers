export const productDescriptions = {
  ring: 'The Terra Ring: a polished gold-tone band with an organic, softly undulating outline and rounded edges, standing upright on pale limestone.',
  earrings: 'The Sol Hoops: a pair of thick gold-tone hoop earrings with irregular, softly sculpted curves and visible posts, resting on pale textured stone.',
  necklace: 'The Pebble Necklace: a fine gold-tone chain arranged in an oval, with a small, rounded pebble-shaped pendant on pale textured stone.',
};

export function viewerKeyAction(key: string) {
  switch (key) {
    case 'ArrowLeft': return 'left';
    case 'ArrowRight': return 'right';
    case 'ArrowUp': return 'up';
    case 'ArrowDown': return 'down';
    case '+': case '=': return 'zoom-in';
    case '-': case '_': return 'zoom-out';
    case 'Home': case 'r': case 'R': return 'reset';
    case ' ': return 'toggle';
    default: return null;
  }
}