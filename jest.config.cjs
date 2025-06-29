module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    // 这里可以添加你的路径别名映射，例如：
    // '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
  // 解决 ESM 包的兼容性
  transformIgnorePatterns: [
    '/node_modules/(?!(isows|@supabase|@supabase/supabase-js|@supabase/realtime-js)/)'
  ],
};