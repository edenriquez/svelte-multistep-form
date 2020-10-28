import { currentStep } from "./stores.js";
import {
  UUID_PATTERN,
  ERROR_DISPLAY_TIME,
  BUTTON_OPACITY,
  BUTTON_DISABLED_OPACITY,
} from "./constants.js";

let activeStep;
currentStep.subscribe((value) => {
  activeStep = value;
});

export const formHasError = () => {
  const steps = document.querySelectorAll(".step");
  const step = steps[activeStep];

  const requiredFields = step.querySelectorAll("[required]");
  let hasError = false;
  let errorMessages = [];

  requiredFields.forEach((el) => {
    if (!el.checkValidity()) {
      hasError = true;
      errorMessages.push(el.dataset.multistepErrorMessage);
    }
  });

  if (hasError) {
    showError(errorMessages);
  }
  return hasError;
};

export const showError = (errorMessages) => {
  let errorField = document.querySelector("#multistep-error-messages");

  deleteChildNodes(errorField);
  showOrHide(errorField, "visible");

  errorMessages.forEach((message) => {
    createElementAppendTo("p", message, errorField);
  });

  setTimeout(() => {
    showOrHide(errorField, "hidden");
  }, ERROR_DISPLAY_TIME);
};


export const updateStepStatus = (operation) => {
  if (!operation) return;
  const steps = document.querySelectorAll(".step");

  steps[activeStep].classList.remove("step-is-active");
  steps[activeStep].classList.add("step-not-active");

  operation();

  steps[activeStep].classList.remove("step-not-active");
  steps[activeStep].classList.add("step-is-active");

  updateButtonVisibility();
};

export const updateButtonVisibility = () => {
  const steps = document.querySelectorAll(".step");
  const stepsLength = steps.length;
  
  const prev = document.querySelector("#multistep-prev");
  const next = document.querySelector("#multistep-next");

  prev.style.opacity = BUTTON_OPACITY;
  next.style.opacity = BUTTON_OPACITY;

  if (activeStep == 0) {
    prev.style.opacity = BUTTON_DISABLED_OPACITY;
  }
  if (activeStep == stepsLength - 1) {
    next.style.opacity = BUTTON_DISABLED_OPACITY;
  }
};

export const showOrHide = (el, status) => {
  if (!el) return;

  const statusOptions = {
    hidden: BUTTON_DISABLED_OPACITY,
    visible: BUTTON_OPACITY,
  };

  el.style.visibility = statusOptions[status] ? status : null;
  el.style.opacity = statusOptions[status] ? statusOptions[status] : null;
};

// TODO: think about it if this is nedeed or useless
export const uuidv4 = () => {
  return UUID_PATTERN.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const deleteChildNodes = (el) => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

export const createElementAppendTo = (type, content, target) => {
  let el = document.createElement(type);
  el.innerHTML = content;
  target.appendChild(el);
};