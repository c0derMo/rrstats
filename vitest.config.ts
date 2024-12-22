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
        globals: true
    }
});