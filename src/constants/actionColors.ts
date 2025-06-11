export const ACTION_COLORS: Record<string, string> = {
  click: 'red',
  double_click: 'blue',
  right_click: 'green',
  screen: 'gray',
};

export const MOUSE_ACTIONS = Object.entries(ACTION_COLORS)
  .filter(([type]) => type !== 'screen') // screen은 제외 가능
  .map(([type, color]) => ({ type, color }));

export const KEYBOARD_ACTIONS = ['hotkey', 'type', 'press'];
