<script>
  import { onMount } from "svelte";
  import { Form, Step } from "svelte-multistep-form";

  let FormComponentRef;
  let resetSteps = false;
  let githubHandle, repoUrl, technology;
  let multiStepOptions = {
    formTitle: "New Title ✍️",
    formSubtitle: "Subtitle should be here",
    stepsDescription: [
      { title: "STEP 1", subtitle: "All the details to perform on this step" },
      { title: "STEP 2", subtitle: "Skip if input equals to next" },
      { title: "STEP 3", subtitle: "All the details to perform on this step" },
    ],
  };
  let selected = {
    name: "",
    text: "",
  };
  const categories = [
    { name: "🍕", text: "🍕 Pizza" },
    { name: "🌮", text: "🌮 Tacos al pastor" },
    { name: "🥙", text: "🥙 Otro taco" },
  ];
  const handleTyping = (event) => {
    repoUrl = `http://github.com/${event.target.value}/`;
  };
</script>

<main class="example-main">
  <Form {multiStepOptions} bind:this={FormComponentRef} bind:resetSteps>
    <Step>
      <div>
        <label class="input-label" for="form-url-field">
          🤖 Github handle :
        </label>
        <input
          class="wide"
          id="form-input-field"
          data-multistep-error-message="name couldn't be empty"
          placeholder="githuber martinez"
          on:keyup={handleTyping}
          bind:value={githubHandle}
        />
      </div>
      <div>
        <label class="input-label" for="form-url-field">🦄 Repo url:</label>
        <input
          class="wide"
          id="form-url-field"
          type="url"
          required
          data-multistep-error-message="url format is wrong"
          placeholder="http://github.com/handler/repo"
          bind:value={repoUrl}
        />
      </div>
      <div>
        <input
          class="button {!repoUrl ? 'buton-disatbled' : ''}"
          value="call next programatically"
          id="form-skip-field"
          type="button"
          disabled={!repoUrl}
          on:click|preventDefault={() => FormComponentRef.nextStep()}
        />
      </div>
    </Step>
    <Step>
      <p>May or may not be skipped</p>
      <div>
        <input
          class="button"
          value="call previous programatically"
          id="form-skip-field"
          type="button"
          on:click|preventDefault={() => FormComponentRef.previousStep()}
        />
      </div>
    </Step>
    <Step>
      <div>
        <label class="input-label" for="form-category-field">Food:</label>
        <select
          class="select-categories wide"
          data-multistep-error-message="Select a profile"
          bind:value={selected}
        >
          {#each categories as category}
            <option value={category}>{category.text}</option>
          {/each}
        </select>
      </div>
    </Step>
  </Form>

  <div class="result">
    <h1>
      <span class="red">{githubHandle || ""}</span>
      <span class="blue">{repoUrl ? `has a repo ${repoUrl}` : ""}</span>
      <span class="orange">
        {selected.text ? `and likes ${selected.text}` : ""}
      </span>
    </h1>
  </div>
</main>

<style>
  * {
    font-family: sans-serif;
  }
  .example-main {
    margin: 50px;
  }
  .button {
    margin-top: 10px;
    width: auto;
    color: #fff;
    border: 0px;
    padding: 10px;
    border-radius: 8px;
    background: #8162ca;
    float: right;
    position: relative;
  }
  .buton-disatbled {
    background: #ccc;
  }
  .wide {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
  }
  .input-label {
    margin-bottom: 10px;
  }

  input {
    outline: none;
  }
  .select-categories {
    height: 40px;
    border: 0px;
    background: #fa0;
  }
  .result {
    color: #848383;
  }
  .result h1 {
    text-align: center;
  }
  .blue {
    color: rgb(89, 86, 221);
  }
  .red {
    color: rgb(218, 39, 39);
  }
  .orange {
    columns: rgb(243, 65, 42);
  }
</style>
