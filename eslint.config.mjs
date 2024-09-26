import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
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
});
