import { writable } from "svelte/store";

const store = writable(0);

export const currentStep = {
  subscribe: store.subscribe,
  increment: () => store.update(val => val + 1),
  decrement: () => store.update(val => val - 1),
  reset: () => store.update(val => val = 0),
};
