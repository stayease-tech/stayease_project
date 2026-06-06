export const DATE_INPUT_MIN = "1900-01-01";
export const DATE_INPUT_MAX = `${new Date().getFullYear()}-12-31`;

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
  if (!input || input.type !== "date") return;

  if (!input.min) input.min = DATE_INPUT_MIN;
  if (!input.max) input.max = DATE_INPUT_MAX;
  if (!input.step) input.step = "1";

  const value = input.value;
  if (!value) {
    input.setCustomValidity("");
    return;
  }

  if (!isIsoDate(value)) {
    input.setCustomValidity("Please enter a valid date.");
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
  const checkIn = form?.querySelector('input[name="checkIn"][type="date"]');
  const checkOut = form?.querySelector('input[name="checkOut"][type="date"]');

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

export function configureGlobalDateInputGuards() {
  if (window.__STAYEASE_DATE_GUARD_CONFIGURED__) return;
  window.__STAYEASE_DATE_GUARD_CONFIGURED__ = true;

  document.addEventListener("focusin", (event) => {
    normalizeDateInputElement(event.target);
  });

  document.addEventListener("input", (event) => {
    normalizeDateInputElement(event.target);
  });

  document.addEventListener("change", (event) => {
    normalizeDateInputElement(event.target);
  });

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const dateInputs = form.querySelectorAll('input[type="date"]');
      for (const input of dateInputs) {
        normalizeDateInputElement(input);
        if (!input.checkValidity()) {
          event.preventDefault();
          input.reportValidity();
          return;
        }
      }

      if (!validateCheckInCheckOut(form)) {
        event.preventDefault();
      }
    },
    true
  );
}