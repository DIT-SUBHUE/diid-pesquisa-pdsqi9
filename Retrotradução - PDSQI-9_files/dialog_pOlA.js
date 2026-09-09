(function (window, document) {
    "use strict";

    const previousFocus = new Map();
    const focusableSelector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    function visibleFocusable(root) {
        return Array.from(root.querySelectorAll(focusableSelector)).filter((element) => {
            const style = window.getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
        });
    }

    function updateBodyLock() {
        const hasOpenDialog = Array.from(document.querySelectorAll("[data-diid-dialog]"))
            .some((dialog) => window.getComputedStyle(dialog).display !== "none");
        document.body.style.overflow = hasOpenDialog ? "hidden" : "";
    }

    function open(dialogId, trigger) {
        const root = document.getElementById(dialogId);
        if (!root) return;

        previousFocus.set(dialogId, trigger || document.activeElement);
        window.requestAnimationFrame(() => {
            updateBodyLock();
            const initial = root.querySelector("[data-dialog-initial]") || visibleFocusable(root)[0];
            if (initial) initial.focus();
        });
    }

    function close(dialogId) {
        window.requestAnimationFrame(() => {
            updateBodyLock();
            const trigger = previousFocus.get(dialogId);
            previousFocus.delete(dialogId);
            if (trigger && document.contains(trigger) && typeof trigger.focus === "function") {
                trigger.focus();
            }
        });
    }

    function trap(event, root) {
        if (event.key !== "Tab") return;

        const focusable = visibleFocusable(root);
        if (!focusable.length) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    window.DIIDDialog = { open, close, trap };
})(window, document);
