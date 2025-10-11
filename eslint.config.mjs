import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([{
    ignores: ['server/scripts/globals.ts'] 
}, {
    rules: {
        "@typescript-eslint/no-extraneous-class": "off",
        "vue/html-self-closing": [
            "warn",
            {
                html: {
                    void: "any",
                },
            },
        ],
        "vue/define-emits-declaration": ["warn"],
        "vue/define-props-declaration": ["error"],
    },
}]);
