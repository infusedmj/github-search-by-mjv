<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import type { Repo } from "@/types/github";
import PagerNav from "./PagerNav.vue";
import OverlayLoader from "./OverlayLoader.vue";
import RepositoryItem from "./RepositoryItem.vue";

const route = useRoute();
const router = useRouter();

const props = defineProps(["term", "page", "sort"]);
const searchTerm = ref("");
const isWaiting = ref(false);
const isLoading = ref(false);
const totalPages = ref(0);
const page = ref(1);
const searchResults = ref<Repo[]>([]);
const totalFound = ref(0);
const searchPerformed = ref(false);
const sortBy = ref("best_match");
const sortOptions = {
  best_match: "Best Match",
  stars: "Popularity",
  forks: "Number of Forks",
  issues: "Number of Issues",
  updated: "Last Update Date",
};
const errorMsg = ref("");

const apiTresholdSec = 6; // Public Github Requests allows only 10 requests per minute = 1 request per 6 seconds
let apiLastRequest = 0;
const repsPerPage = 30;

const initiateSearch = async () => {
  const searchTermVal = searchTerm.value.trim();
  if (router) {
    router.push({
      path: "/",
      query: {
        term: searchTermVal,
        page: `${page.value}`,
        sort: sortBy.value,
      },
    });
  }

  errorMsg.value = "";

  if (!searchTermVal) {
    searchPerformed.value = false;
  }

  if (isWaiting.value || !searchTermVal) {
    return;
  }

  const timeToWait = apiLastRequest + apiTresholdSec * 1000 - Date.now();

  if (timeToWait > 0) {
    isWaiting.value = true;
    setTimeout(async () => await searchRepo(searchTermVal), timeToWait);
  } else {
    await searchRepo(searchTermVal);
  }
};

const searchRepo = async (term: string) => {
  isWaiting.value = false;
  isLoading.value = true;

  apiLastRequest = Date.now();

  try {
    const { data, status } = await axios.get(
      `https://api.github.com/search/repositories?q=${term}&per_page=${repsPerPage}&page=${page.value}&sort=${sortBy.value}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    searchPerformed.value = true;
    isLoading.value = false;

    let results: Array<Repo> = [];
    totalFound.value = 0;
    totalPages.value = 0;

    if (status === 200) {
      totalFound.value = data.total_count;

      if (data.total_count > 0) {
        totalPages.value = Math.ceil(data.total_count / repsPerPage);
        for (let item of data.items) {
          results.push({
            id: item.id,
            full_name: item.full_name,
            description: item.description,
            language: item.language,
            owner: item.owner.login,
            owner_url: item.owner.url,
            created_at: item.created_at,
            updated_at: item.updated_at,
            tags: item.topics,
            url: item.svn_url,
            stars: item.stargazers_count,
            license: item.license ? item.license.spdx_id : "",
          });
        }
        searchResults.value = results;
      }
    }

    window.scrollTo(0, 0);
  } catch (e) {
    totalFound.value = 0;
    totalPages.value = 0;
    errorMsg.value = "Unexpected Error Occured";
    searchPerformed.value = true;
    isLoading.value = false;
  }
};

const propsToRefs = () => {
  if (props.page) {
    page.value = props.page;
  } else if (route.query.page && typeof route.query.page === "string") {
    page.value = parseInt(route.query.page);
  }

  if (props.sort && Object.keys(sortOptions).includes(props.sort)) {
    sortBy.value = props.sort;
  } else if (
    route.query.sort &&
    typeof route.query.sort === "string" &&
    Object.keys(sortOptions).includes(route.query.sort)
  ) {
    sortBy.value = route.query.sort;
  }

  if (props.term) {
    searchTerm.value = props.term;
  } else if (route.query.term && typeof route.query.term === "string") {
    searchTerm.value = route.query.term;
  }

  if (searchTerm.value) {
    initiateSearch();
  }
};

onMounted(() => {
  propsToRefs();
});

window.addEventListener("popstate", () => {
  propsToRefs();
});
</script>

<template>
  <OverlayLoader v-if="isWaiting || isLoading" />
  <div class="intro" v-if="!searchPerformed">
    <img
      src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
    />
    <h1>Github Repository Search</h1>
    <div>Created by Mark Joseph Victoria</div>
  </div>

  <div>
    <form
      @submit.prevent="
        page = 1;
        initiateSearch();
      "
      class="search-form"
    >
      <div class="github-search">
        <input
          type="text"
          class="github-search-input"
          placeholder="Search Github Repositories..."
          v-model="searchTerm"
        />
      </div>
      <button class="search-button" type="submit">Search</button>
    </form>
  </div>

  <div class="error" v-if="errorMsg">
    {{ errorMsg }}
  </div>

  <div v-if="searchPerformed">
    <div class="results-count">
      <div class="count">
        Showing <b>{{ totalFound > 1000 ? 1000 : totalFound }}</b> results from
        Github
      </div>
      <div class="sort-wrap" v-if="totalFound > 1">
        <label for="sort">Sort By:</label>
        <select
          name="sort"
          id="sort"
          class="sortBy"
          v-model="sortBy"
          @change="initiateSearch"
        >
          <option v-for="(v, k) in sortOptions" :value="k" :key="k">
            {{ v }}
          </option>
        </select>
      </div>
    </div>
    <div v-if="totalFound > 0">
      <div v-for="s in searchResults" :key="s.id">
        <RepositoryItem :item="s" />
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <PagerNav
        :pages="totalPages < 34 ? totalPages : 34"
        v-model="page"
        @change="initiateSearch"
      />
    </div>
  </div>
</template>

<style scoped>
.search-form {
  text-align: center;
}

.search-form .github-search-input {
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  padding: 10px 10px;
  font-size: 14pt;
}

.results-count {
  font-size: 13pt;
  padding: 10px 0;
}

.results-count > .count {
  margin-bottom: 10px;
}

.search-button {
  font-size: 12pt;
  border: none;
  color: white;
  background-color: #444;
  padding: 4px 20px;
  border-radius: 5px;
  height: 45px;
  margin-top: 30px;
  width: 100%;
  display: inline-block;
  cursor: pointer;
}
.sort-wrap {
  font-size: 11pt;
}

.sort-wrap select {
  font-size: 11pt;
  padding: 5px;
  margin-left: 10px;
}

.error {
  background: #fecdd3;
  color: #be123c;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 10px;
}

.intro {
  margin-top: 150px;
  text-align: center;
  margin-bottom: 30px;
}

.intro img {
  width: 100px;
  height: 100px;
}

@media only screen and (min-width: 768px) {
  .results-count {
    display: flex;
  }

  .results-count > .count {
    flex-grow: 1;
  }

  .search-form {
    display: flex;
  }

  .search-form .github-search {
    flex-grow: 1;
    padding: 0px 20px 0px 0px;
  }

  .search-button {
    margin-top: 0;
    width: auto;
  }
}
</style>
