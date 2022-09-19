import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import GithubSearch from "../GithubSearch.vue";

describe("GithubSearch", () => {
  it("renders properly", () => {
    const wrapper = mount(GithubSearch, {
      props: { term: "vuejs/core", page: 1, sort: "best_match" },
    });
    console.log(wrapper.text());
    expect(wrapper.text()).toContain("Github Repository Search");
  });
});
