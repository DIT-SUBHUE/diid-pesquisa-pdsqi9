(function () {
    const COMMON_PASSWORDS = new Set([
        "123456",
        "123456789",
        "senha",
        "password",
        "qwerty",
        "admin",
        "diid",
    ]);

    function getIdentityTerms(list) {
        return [
            list.dataset.username || "",
            (list.dataset.email || "").split("@")[0] || "",
        ]
            .map((value) => value.trim().toLowerCase())
            .filter((value) => value.length >= 3);
    }

    function buildChecks(identityTerms) {
        const isNotCommon = (value) =>
            value.length > 0 && !COMMON_PASSWORDS.has(value.toLowerCase());
        const isNotPersonal = (value) => {
            const normalized = value.toLowerCase();
            return (
                normalized.length > 0 &&
                !identityTerms.some((term) => normalized.includes(term))
            );
        };

        return {
            length: (value) => value.length >= 8,
            numeric: (value) => value.length > 0 && !/^\d+$/.test(value),
            safe: (value) => isNotCommon(value) && isNotPersonal(value),
            match: (value, confirmationValue) =>
                value.length > 0 &&
                confirmationValue.length > 0 &&
                value === confirmationValue,
        };
    }

    function setPasswordVisibility(toggle, input, isVisible) {
        const showLabel = toggle.dataset.showLabel || "Mostrar senha";
        const hideLabel = toggle.dataset.hideLabel || "Ocultar senha";
        const label = isVisible ? hideLabel : showLabel;

        input.type = isVisible ? "text" : "password";
        toggle.dataset.state = isVisible ? "visible" : "hidden";
        toggle.setAttribute("aria-label", label);
        toggle.setAttribute("aria-pressed", isVisible ? "true" : "false");
        toggle.title = label;

        toggle
            .querySelectorAll("[data-password-icon]")
            .forEach((icon) => {
                const activeIcon = isVisible ? "hide" : "show";
                icon.hidden = icon.dataset.passwordIcon !== activeIcon;
            });
    }

    function initPasswordToggle(toggle) {
        if (toggle.dataset.passwordToggleReady === "true") {
            return;
        }

        const field = toggle.closest("[data-password-field]");
        const input = field ? field.querySelector("input") : null;

        if (!input) {
            return;
        }

        toggle.dataset.passwordToggleReady = "true";
        setPasswordVisibility(toggle, input, input.type === "text");

        toggle.addEventListener("click", () => {
            setPasswordVisibility(toggle, input, input.type !== "text");
        });
    }

    function findElements(root, selector) {
        const elements = [];

        if (root.matches && root.matches(selector)) {
            elements.push(root);
        }

        elements.push(...root.querySelectorAll(selector));
        return elements;
    }

    function initPasswordToggles(root) {
        findElements(root, "[data-password-toggle]").forEach(initPasswordToggle);
    }

    function initPasswordChangeForm(form) {
        if (form.dataset.passwordChangeReady === "true") {
            return;
        }

        const input = form.querySelector("#id_new_password1");
        const confirmation = form.querySelector("#id_new_password2");
        const list = form.querySelector("[data-password-rules]");
        const submitButton = form.querySelector("[data-password-submit]");

        if (!input || !confirmation || !list || !submitButton) {
            return;
        }

        form.dataset.passwordChangeReady = "true";
        const checks = buildChecks(getIdentityTerms(list));
        const meterSteps = Array.from(list.querySelectorAll("[data-password-step]"));

        function syncPasswordState() {
            const value = input.value || "";
            const confirmationValue = confirmation.value || "";
            let rulesMet = true;
            let metCount = 0;

            list.querySelectorAll("[data-rule]").forEach((rule) => {
                const check = checks[rule.dataset.rule];
                const met = check ? check(value, confirmationValue) : false;
                rulesMet = rulesMet && met;
                metCount += met ? 1 : 0;
                rule.dataset.state = met ? "met" : "pending";

                if (
                    rule.dataset.rule === "match" &&
                    value.length > 0 &&
                    confirmationValue.length > 0 &&
                    !met
                ) {
                    rule.dataset.state = "mismatch";
                }
            });

            meterSteps.forEach((step, index) => {
                step.dataset.state = index < metCount ? "met" : "pending";
            });

            form.dataset.ready = rulesMet ? "true" : "false";
            submitButton.disabled = !rulesMet;
            submitButton.setAttribute("aria-disabled", rulesMet ? "false" : "true");
        }

        form.addEventListener("submit", (event) => {
            if (form.dataset.ready !== "true") {
                event.preventDefault();
            }
        });
        input.addEventListener("input", syncPasswordState);
        confirmation.addEventListener("input", syncPasswordState);
        syncPasswordState();
    }

    function initPasswordForms(root) {
        initPasswordToggles(root);
        findElements(root, "[data-password-change-form]").forEach(initPasswordChangeForm);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => initPasswordForms(document));
    } else {
        initPasswordForms(document);
    }

    document.addEventListener("htmx:afterSwap", (event) => {
        initPasswordForms(event.target);
    });
})();
