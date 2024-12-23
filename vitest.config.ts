import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
    esbuild: {
        tsconfigRaw: {
            compilerOptions: {
                experimentalDecorators: true,
            },
        },
    },
    test: {
        environment: 'nuxt',
        coverage: {
            include: ['components/**/*.vue', 'composables/**/*.vue', 'layouts/**/*.vue', 'middleware/**/*.vue', 'pages/**/*.vue', 'plugins/**/*.ts', 'server/**/*.ts', 'utils/**/*.ts']
        }
    }
});