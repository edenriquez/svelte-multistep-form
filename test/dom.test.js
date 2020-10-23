/**
 * mountApp
 * showError
 * showOrHide
 * updateStepStatus
 * formHasError
**/

import "@testing-library/jest-dom";
import { render } from "@testing-library/svelte";
import mock from "./mock";
import { currentStep } from '../src/stores';
import { BUTTON_OPACITY, BUTTON_DISABLED_OPACITY } from "../src/constants";
import ExampleApp from "../example/src/App.svelte";
import MasterForm from "../src/MasterForm.svelte";
import {
  showOrHide,
  showError,
  formHasError,
  updateStepStatus,
  updateButtonVisibility,
} from "../src/helpers";

describe("mountApp", () => {
  let form;
  let title;

  beforeEach(() => {
    const { container } = render(MasterForm, mock);
    form = container.querySelector(".multistep-form");
    title = container.querySelectorAll(".multistep-title-side");
  });

  it("multistep-form should be in the document", () => {
    expect(form).toBeInTheDocument();
  });

  it("multistep-form should have more than one step", () => {
    expect(title.length).toBeGreaterThan(1);
  });
});

describe("showOrHide", () => {
  let nextButton;
  let nextButtonStyle;

  beforeEach(() => {
    const { getByText } = render(MasterForm, mock);
    nextButton = getByText("next");
    nextButtonStyle = nextButton.style;
  });

  it("show the next button", () => {
    const status = "visible";
    showOrHide(nextButton, status);
    expect(nextButtonStyle).toHaveProperty("visibility", status);
    expect(nextButtonStyle).toHaveProperty("opacity", BUTTON_OPACITY);
  });

  it("hide the next button", () => {
    const status = "hidden";
    showOrHide(nextButton, status);
    expect(nextButtonStyle).toHaveProperty("visibility", status);
    expect(nextButtonStyle).toHaveProperty("opacity", BUTTON_DISABLED_OPACITY);
  });
});

describe("showError", () => {
  it("show two error messages", () => {
    const { getByText } = render(MasterForm, mock);
    const errorMessages = ['Error occurred', 'Got up on the wrong foot'];
    showError(errorMessages);
    const isFirstErrorDom = getByText(errorMessages[0]);
    const isSecondErrorDom = getByText(errorMessages[0]);
    expect(isFirstErrorDom).toBeInTheDocument();
    expect(isSecondErrorDom).toBeInTheDocument();
  });
});

describe("showOrHide", () => {
  let nextButton;

  beforeEach(() => {
    const { getByText } = render(MasterForm, mock);
    nextButton = getByText("next");
  });

  it("hide element", () => {
    showOrHide(nextButton, 'hidden');
    expect(nextButton).toHaveStyle('visibility: hidden');
    expect(nextButton).toHaveStyle(`opacity: ${BUTTON_DISABLED_OPACITY}`);
  });
  
  it("show element", () => {
    showOrHide(nextButton, 'visible');
    expect(nextButton).toHaveStyle('visibility: visible');
    expect(nextButton).toHaveStyle(`opacity: ${BUTTON_OPACITY}`);
  });
});

// Use example app to have steps with slots available 
describe("formHasError", () => {
  let errorContainer;

  beforeEach(() => {
    const { container } = render(ExampleApp);
    errorContainer = container.querySelector('#multistep-error-messages');
  });

  it("check if error-messages container is available but not visible", () => {
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).not.toBeVisible();
  });

  it("check if form has error and trigger error", () => {
    formHasError();
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toBeVisible();
  });
});

// Use example app to have steps with slots available 
describe("updateStepStatus", () => {
  let steps;

  beforeEach(() => {
    currentStep.reset();
    const { container } = render(ExampleApp);
    steps = container.querySelectorAll('.step');
  });

  it("after going to the next step, test if the active class is on the right step", () => {
    updateStepStatus(currentStep.increment);
    expect(steps[0]).not.toHaveClass('step-is-active');
    expect(steps[1]).toHaveClass('step-is-active');
  });
});

// Use example app to have steps with slots available 
describe("updateButtonVisibility", () => {
  let prev;
  let next;

  beforeEach(() => {
    currentStep.reset();
    const { getByText } = render(ExampleApp);
    prev = getByText('prev');
    next = getByText('next');
  });

  it("check if on the first step the prev button is partly visible", () => {
    updateButtonVisibility();
    expect(prev).toHaveStyle(`opacity: ${BUTTON_DISABLED_OPACITY}`);
  });
  
  it("check if on the second step the prev button is fully visible", () => {
    currentStep.increment();
    updateButtonVisibility();
    expect(prev).toHaveStyle(`opacity: ${BUTTON_OPACITY}`);
  });
  
  it("check if on the first step the next button is fully visible", () => {
    expect(next).toHaveStyle(`opacity: ${BUTTON_OPACITY}`);
  });
});
