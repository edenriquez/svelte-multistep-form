# svelte multistep form

Multi Step Form help to wrap form elements passing down styles to the component to be rendered, also it presents each form step in a ordered and stylish way.

### Demo
<p align="center">
  <img width="570" src ="./screen/form-demo.gif">
</p>

## Get started

Download into your project

```bash
git clone https://github.com/edenriquez/svelte-multistep-form
cd svelte-multistep-form 
npm i
```

then import into your code

```javascript
  import { Form, Step } from "<path>/<to>/MultiStepForm";
```
## Usage

Firs you need to set up the form steps and initial config

```javascript
let multiStepOptions = {
    formTitle: "New Title ✍️",
    formSubtitle: "Subtitle should be here",
    stepsDescription: [
      { title: "STEP 1", subtitle: "All the details to perform on this step" },
      { title: "STEP 2", subtitle: "All the details to perform on this step" }
    ]
  };
```

after that you only need to call `Form` and `Step` componente in the following way

```javascript
<Form {multiStepOptions}>
  <Step>
   // Here should be your form
  </Step>
</Form>
```
