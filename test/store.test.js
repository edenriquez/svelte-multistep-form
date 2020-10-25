import { currentStep } from "../src/stores";

describe("showError", () => {
  let activeStep;
  let initValue = 0;
  
  beforeEach(()=> {
    currentStep.reset();
    currentStep.subscribe((value) => {
      activeStep = value;
    });
  });
  
  it("store should return activeStep", () => { 
    expect(activeStep).toEqual(initValue);
  });
  
  it("store should perform increment", () => {
    currentStep.increment();
    expect(activeStep).toEqual(initValue + 1);
    expect(activeStep).toBeGreaterThan(initValue);
  });
  
  it("store should perform decrement", () => {
    initValue = 2;
    currentStep.increment();
    currentStep.increment();
    expect(activeStep).toEqual(initValue);
    currentStep.decrement();
    expect(activeStep).toEqual(initValue - 1);
  });
  
  it("store should reset", () => {
    initValue = 2;
    currentStep.increment();
    currentStep.increment();
    currentStep.reset();
    expect(activeStep).toEqual(0);
  });
});
