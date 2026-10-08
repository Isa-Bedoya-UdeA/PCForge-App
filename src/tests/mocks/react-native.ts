export const Platform = {
  OS: 'android',
  select: <T>(obj: { android?: T; ios?: T; default?: T; web?: T }): T | undefined => {
    return obj.android ?? obj.default;
  },
};

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  hairlineWidth: 1,
};

export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
};

export const Animated = {
  Value: function (init: number) {
    return {
      setValue: () => {},
      interpolate: () => {},
      _value: init,
    };
  },
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  sequence: () => ({ start: (cb?: () => void) => cb?.() }),
  loop: () => ({ start: () => {}, stop: () => {} }),
  View: 'View',
  Text: 'Text',
};
