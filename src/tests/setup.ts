/// <reference types="jest" />

const storage: Record<string, string> = {};

const asyncStorageMock = {
  getItem: jest.fn(async (key: string) => storage[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  }),
  getAllKeys: jest.fn(async () => Object.keys(storage)),
  _dump: () => ({ ...storage }),
  _reset: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: asyncStorageMock,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      hostUri: '192.168.1.100:8081',
    },
  },
}));

beforeEach(() => {
  asyncStorageMock._reset();
  jest.clearAllMocks();
});
