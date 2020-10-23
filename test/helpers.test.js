import "@testing-library/jest-dom";
import { render } from "@testing-library/svelte";
import MasterForm from "../src/MasterForm.svelte";
import mock from "./mock"; // we are using mock data to test the application independent from the example app
import { UUID_PATTERN } from "../src/constants";
import {
  uuidv4,
  deleteChildNodes,
  createElementAppendTo,
} from "../src/helpers";

describe("uuidv4", () => {
  let firstUuid;
  let secondUuid;
  let uuidLength = UUID_PATTERN.length;

  it("should generate an uuid with the length of the uuid pattern", () => {
    firstUuid = uuidv4();
    expect(firstUuid).toHaveLength(uuidLength);
  });

  it("generate a second uuid and compare the first uuid with the second one", () => {
    secondUuid = uuidv4();
    expect(secondUuid).toHaveLength(uuidLength);
    expect(firstUuid).not.toBe();
  });
});

describe("deleteChildNodes", () => {
  let title;

  beforeEach(() => {
    const { getByText } = render(MasterForm, mock);
    title = getByText("New Title");
  });

  it("should contain one child", () => {
    expect(title.childNodes.length).toEqual(1);
  });

  it("should contain no children", () => {
    deleteChildNodes(title);
    expect(title.childNodes.length).toEqual(0);
  });
});

describe("createElementAppendTo", () => {
  let firstStep;
  let newDiv;
  let newDivContent;

  beforeEach(() => {
    const { getByText } = render(MasterForm, mock);
    firstStep = getByText("STEP 1");
    newDiv = "div";
    newDivContent = "new content from div";
  });

  it("create div and append it to existing element", () => {
    expect(firstStep).not.toContainHTML(newDivContent);
    createElementAppendTo(newDiv, newDivContent, firstStep);
    expect(firstStep).toContainHTML(newDivContent);
  });

  it("create div and h1 and append them to existing element", () => {
    const newH1 = "h1";
    const newH1Content = "new content from h1";
    expect(firstStep).not.toContainHTML(newDivContent);
    createElementAppendTo(newDiv, newDivContent, firstStep);
    expect(firstStep).toContainHTML(newDivContent);
    expect(firstStep).not.toContainHTML(newH1Content);
    createElementAppendTo(newH1, newH1Content, firstStep);
    expect(firstStep).toContainHTML(newH1Content);
  });
});
