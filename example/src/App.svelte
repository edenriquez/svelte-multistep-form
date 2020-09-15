<script>
  import { Form, Step } from "svelte-multistep-form";
  let resetSteps = false;
  let githubHandle, repoUrl, technology;
  let multiStepOptions = {
    formTitle: "New Title ✍️",
    formSubtitle: "Subtitle should be here",
    stepsDescription: [
      { title: "STEP 1", subtitle: "All the details to perform on this step" },
      { title: "STEP 2", subtitle: "All the details to perform on this step" }
    ]
  };
  let selected = {
    name: "",
    text: ""
  };
  const categories = [
    { name: "🍕", text: "🍕 Pizza" },
    { name: "🌮", text: "🌮 Tacos al pastor" },
    { name: "🥙", text: "🥙 Otro taco" }
  ];

  const handleTyping = event => {
    repoUrl = `http://github.com/${event.target.value}/`;
  };
</script>

<style>
  .wide {
    width: 100%;
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

<main>
  <Form {multiStepOptions} bind:resetSteps>
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
          bind:value={githubHandle} />
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
          bind:value={repoUrl} />
      </div>
    </Step>
    <Step>
      <div>
        <label class="input-label" for="form-category-field">Food:</label>
        <select
          class="select-categories wide"
          data-multistep-error-message="Select a profile"
          bind:value={selected}>
          {#each categories as category}
            <option value={category}>{category.text}</option>
          {/each}
        </select>
      </div>
    </Step>
  </Form>

  <div class="result">
    <h1>
      <span class="red">{githubHandle || ''}</span>
      <span class="blue">{repoUrl ? `has a repo ${repoUrl}` : ''}</span>
      <span class="orange">
        {selected.text ? `and likes ${selected.text}` : ''}
      </span>
    </h1>
  </div>
</main>
