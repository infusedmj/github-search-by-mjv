import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import GithubSearch from "../GithubSearch.vue";

describe("GithubSearch", () => {
  it("renders properly", () => {
    const wrapper = mount(GithubSearch, { props: { term: "vuejs/core" } });
    expect(wrapper.text()).toContain("Vue.js");
  });
});
