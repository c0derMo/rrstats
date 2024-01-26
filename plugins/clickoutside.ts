export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('click-outside', {
        beforeMount: function (element, binding) {
            element.clickOutsideEvent = function (event: Event) {
                if (!(element === event.target || element.contains(event.target))) {
                    binding.value(event);
                }
            }
            document.body.addEventListener('click', element.clickOutsideEvent);
        },
        unmounted: function (element) {
            document.body.removeEventListener('click', element.clickOutsideEvent);
        }
    });
})