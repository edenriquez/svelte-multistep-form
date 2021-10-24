<script>
  import { onMount, afterUpdate } from "svelte";
  import { currentStep } from "./stores.js";
  import {
    uuidv4,
    formHasError,
    updateStepStatus,
    updateButtonVisibility
  } from "./helpers.js";

  export let multiStepOptions;
  export let resetSteps;

  let defaultStepOptions = {
    formTitle : 'Hello world',
    formSubtitle : 'Welcome to our world',
    formMethodType : 'POST',
    prevMessageText : 'Previous',
    nextMessageText : 'Next',
    formActionURL:'/'
  }

  multiStepOptions = Object.assign({}, defaultStepOptions,  multiStepOptions)

  /*
  Lifecycle Hooks
  */
  onMount(async () => {
    let steps = document.querySelectorAll(".step");

    steps.forEach((step, index) => {
      step.setAttribute("id", uuidv4());
      step.dataset.stepNumber = index;
      if ($currentStep === index) {
        step.classList.remove("step-not-active");
        step.classList.add("step-is-active");
      }
    });
    
    updateButtonVisibility();
  });

  afterUpdate(async () => {
    if (resetSteps) {
      updateStepStatus(stepStore.reset);
      resetSteps = false;
    }
  });

  /*
  App-navigation
  */
  const nextStep = () => {
    const steps = document.querySelectorAll(".step");
    if (formHasError()) {
      return;
    }
    if ($currentStep + 1 <= steps.length - 1) {
      updateStepStatus(currentStep.increment);
    }
  };

  const previousStep = () => {
    if ($currentStep - 1 > -1) {
      updateStepStatus(currentStep.decrement);
    }
  };
</script>

<style>
  .name {
    color: #848383;
  }
  .subtitle {
    color: rgb(223, 219, 219);
    display: block;
  }
  .multistep-form {
    display: flex;
  }
  .separator,
  .multistep-left-sidebar {
    flex: 1;
  }
  .multistep-right-sidebar {
    flex: 3;
    text-align: left;
  }
  .multistep-continue-button {
    float: right;
  }
  .separator-check {
    width: 15px;
    height: 20px;
    margin: 0 auto;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #48db71;
    padding: 11px 10px 2px;
    z-index: 10;
  }
  .separator-check-pending {
    width: 15px;
    height: 20px;
    margin: 0 auto;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #48db71;
    padding: 11px 10px 2px;
    z-index: 10;
  }
  .separator-check-current {
    width: 15px;
    height: 20px;
    margin: 0 auto;
    border-radius: 50%;
    background: #5e40db;
    padding: 11px 10px 2px;
    z-index: 10;
    box-shadow: 0px 1px 8px #5e40db;
  }
  .separator-check-number {
    color: white;
    text-align: center;
    margin-top: -3px;
  }
  .separator-check-number-blank {
    text-align: center;
    margin-top: -3px;
  }
  .separator-line {
    border-right: 2px solid #ccc;
    margin: 0 auto;
    position: relative;
    height: 40px; /* placeholder, should be displayed dynamically*/
    width: 1px;
    margin-bottom: 2px;
    margin-top: 2px;
  }
  .multistep-master-form {
    padding: 30px;
    height: 100%;
  }
  #multistep-prev {
    cursor: pointer;
    margin-right: 20px;
  }
  #multistep-next {
    cursor: pointer;
    margin-left: 20px;
  }
  .dot {
    height: 8px;
    width: 8px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    margin-left: -2px;
    margin-top: 18px;
  }
  .multistep-title-side {
    margin-top: 40px;
    text-align: right;
  }
  .multistep-form-title {
    text-align: left;
    color: #636262;
    font-weight: bold;
  }
  .multistep-form-subtitle {
    text-align: left;
    color: rgb(223, 219, 219);
    margin-bottom: 30px;
    font-weight: lighter;
  }
  #multistep-error-messages {
    position: absolute;
    right: 0;
    height: auto;
    width: auto;
    border-left: 10px solid red;
    text-align: left;
    padding-left: 10px;
    background: #fff;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s, opacity 0.2s linear;
  }
</style>

<div class="multistep-master-form">
  <div id="multistep-error-messages" />
  <h1 class="multistep-form-title">{multiStepOptions.formTitle}</h1>
  <h5 class="multistep-form-subtitle">{multiStepOptions.formSubtitle}</h5>
  <form class="multistep-form" method="{multiStepOptions.formMethodType}" action="{multiStepOptions.formActionURL}">
    <div class="multistep-left-sidebar">
      {#each multiStepOptions.stepsDescription as step}
        <div class="multistep-title-side">
          <span class="name"><pre>{step.title}</pre></span>
          <span class="subtitle"><pre>{step.subtitle}</pre></span>
        </div>
      {/each}
    </div>
    <div class="separator">
      {#each multiStepOptions.stepsDescription as step, index}
        <div class="separator-line">
          <span class="dot" />
        </div>
        {#if $currentStep === index}
          <div class="separator-check-current">
            <div class="separator-check-number">{index + 1}</div>
          </div>
        {:else if $currentStep > index}
          <div class="separator-check">
            <svg viewBox="0 0 32 32" style="fill:#48DB71">
              <path d="M1 14 L5 10 L13 18 L27 4 L31 8 L13 26 z" />
            </svg>
          </div>
        {:else if $currentStep < index}
          <div class="separator-check-pending">
            <div class="separator-check-number-blank">{index + 1}</div>
          </div>
        {/if}
      {/each}
    </div>
    <!-- This slot represents StepForm  -->
    <div class="multistep-right-sidebar">
      <slot />
    </div>
    <!-- end of  StepForm  -->
  </form>
  <div class="multistep-continue-button">
    <span on:click={previousStep} id="multistep-prev">{multiStepOptions.prevMessageText}</span>
    |
    <span on:click={nextStep} id="multistep-next">{multiStepOptions.nextMessageText}</span>
  </div>
</div>
