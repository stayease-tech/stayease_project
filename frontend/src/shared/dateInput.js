export const DATE_INPUT_MIN = "2000-01-01";
export const DATE_INPUT_MAX = "2100-12-31";

export function normalizeDateTextValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 4) return `${digits}-01-01`;
  if (digits.length === 6) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-01`;
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;

  if (/^\d{4}-\d{1,2}-?\d{0,2}$/.test(raw)) {
    const [year, month, day] = raw.split(/[-/]/).map((part) => part || "");
    const normalizedMonth = month ? String(month).padStart(2, "0") : "01";
    const normalizedDay = day ? String(day).padStart(2, "0") : "01";
    return `${year}-${normalizedMonth}-${normalizedDay}`;
  }

  return raw;
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

function isCalendarValidDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

export function isValidIsoDateInRange(value, min = DATE_INPUT_MIN, max = DATE_INPUT_MAX) {
  if (!isIsoDate(value)) return false;
  if (!isCalendarValidDate(value)) return false;
  return value >= min && value <= max;
}

function normalizeDateInputElement(input) {
  if (!input || !(input instanceof HTMLInputElement)) return;

  const isDateField = input.type === "date" || input.dataset.stayeaseDateInput === "true";
  if (!isDateField) return;

  if (input.type === "date") {
    input.type = "text";
    input.dataset.stayeaseDateInput = "true";
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("placeholder", "YYYY-MM-DD");
    input.setAttribute("autocomplete", "off");
  }

  if (!input.min) input.min = DATE_INPUT_MIN;
  if (!input.max) input.max = DATE_INPUT_MAX;
  if (!input.step) input.step = "1";

  const rawValue = input.value ?? "";
  const value = normalizeDateTextValue(rawValue);
  if (value !== rawValue) {
    input.value = value;
  }

  if (!value) {
    input.setCustomValidity("");
    return;
  }

  if (!isIsoDate(value)) {
    input.setCustomValidity("Please enter a valid date in YYYY-MM-DD format.");
    return;
  }

  if (!isCalendarValidDate(value)) {
    input.setCustomValidity("Please enter a real calendar date (e.g. June only has 30 days).");
    return;
  }

  if (value < input.min) {
    input.value = input.min;
  } else if (value > input.max) {
    input.value = input.max;
  }

  input.setCustomValidity("");
}

function validateCheckInCheckOut(form) {
  const checkIn = form?.querySelector('input[name="checkIn"]');
  const checkOut = form?.querySelector('input[name="checkOut"]');

  if (!checkIn || !checkOut) return true;
  if (!checkIn.value || !checkOut.value) return true;

  if (checkOut.value < checkIn.value) {
    checkOut.setCustomValidity("Check-out date cannot be before check-in date.");
    checkOut.reportValidity();
    return false;
  }

  checkOut.setCustomValidity("");
  return true;
}

function applyCustomFieldValidation(input) {
  if (!input || !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement)) {
    return true;
  }

  const value = input.value ?? "";
  const name = `${input.name || ""} ${input.id || ""}`.toLowerCase();
  const type = input.type || "text";
  const isRequired = input.hasAttribute("required") || input.required;

  if (isRequired && !String(value).trim()) {
    input.setCustomValidity("This field is required.");
    return false;
  }

  if (type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    input.setCustomValidity("Please enter a valid email address.");
    return false;
  }

  if ((name.includes("name") || name.includes("fullname")) && value && !/^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/.test(value.trim())) {
    input.setCustomValidity("Names may only contain letters, spaces, apostrophes, periods, or hyphens.");
    return false;
  }

  if (type === "tel" && value && !/^\d{10}$/.test(value.replace(/\D/g, ""))) {
    input.setCustomValidity("Please enter a valid 10-digit phone number.");
    return false;
  }

  if ((name.includes("phone") || name.includes("mobile") || name.includes("contact")) && value && !/^\d{10}$/.test(value.replace(/\D/g, ""))) {
    input.setCustomValidity("Please enter a valid 10-digit phone number.");
    return false;
  }

  if ((name.includes("pincode") || name.includes("zip")) && value && !/^\d{6}$/.test(value)) {
    input.setCustomValidity("Please enter a valid 6-digit pincode.");
    return false;
  }

  if ((input.getAttribute("inputmode") === "numeric" || type === "number") && value && Number.isNaN(Number(value))) {
    input.setCustomValidity("Please enter a valid number.");
    return false;
  }

  if (input.dataset.stayeaseDateInput === "true" && value && !isIsoDate(normalizeDateTextValue(value))) {
    input.setCustomValidity("Please enter a valid date in YYYY-MM-DD format.");
    return false;
  }

  input.setCustomValidity("");
  return true;
}

export function validateFormInputs(form) {
  if (!(form instanceof HTMLFormElement)) {
    return { valid: false, input: null };
  }

  const fields = Array.from(form.querySelectorAll("input, textarea, select"));
  for (const field of fields) {
    const valid = applyCustomFieldValidation(field);
    if (!valid) {
      return { valid: false, input: field };
    }
  }

  const isDateValid = validateCheckInCheckOut(form);
  return { valid: isDateValid, input: null };
}

export function configureGlobalDateInputGuards() {
  if (window.__STAYEASE_DATE_GUARD_CONFIGURED__) return;
  window.__STAYEASE_DATE_GUARD_CONFIGURED__ = true;

  const enhanceExistingDateInputs = () => {
    document.querySelectorAll('input[type="date"]').forEach((input) => normalizeDateInputElement(input));
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches?.('input[type="date"]')) {
          normalizeDateInputElement(node);
        }
        node.querySelectorAll?.('input[type="date"]').forEach((input) => normalizeDateInputElement(input));
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  enhanceExistingDateInputs();

  document.addEventListener("focusin", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      normalizeDateInputElement(event.target);
      applyCustomFieldValidation(event.target);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      normalizeDateInputElement(event.target);
      applyCustomFieldValidation(event.target);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      normalizeDateInputElement(event.target);
      applyCustomFieldValidation(event.target);
    }
  });

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const dateInputs = form.querySelectorAll('input[type="date"], input[data-stayease-date-input="true"]');
      for (const input of dateInputs) {
        normalizeDateInputElement(input);
        if (!input.checkValidity()) {
          event.preventDefault();
          input.reportValidity();
          return;
        }
      }

      const validation = validateFormInputs(form);
      if (!validation.valid) {
        event.preventDefault();
        if (validation.input) {
          validation.input.reportValidity();
        }
        return;
      }
    },
    true
  );
}