export default {
    mounted(el, binding) {
        const {value, modifiers} = binding;
        if (value) {
            if (!el.dataset.initialHtml) {
            el.dataset.initialHtml = el.innerHTML;
            }
            el.innerHTML = modifiers.empty
                ? ''
                : '<span class="loading-spinner m-auto"></span>';
            el.classList.add('loading');
            el.disabled = true;
        }
    },
    updated(el, binding) {
        const {value, modifiers} = binding;

        if (value) {
            if (!el.classList.contains('loading')) {
                if (!el.dataset.initialHtml) {
            el.dataset.initialHtml = el.innerHTML;
                }
                el.innerHTML = modifiers.empty
                    ? ''
                    : '<span class="loading-spinner m-auto"></span>';
            el.classList.add('loading');
                el.disabled = true;
            }
        } else {
            if (el.classList.contains('loading')) {
                el.innerHTML = el.dataset.initialHtml || '';
            el.classList.remove('loading');
                delete el.dataset.initialHtml;
                el.disabled = false;
            }
        }
    },
};