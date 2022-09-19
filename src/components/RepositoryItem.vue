<script setup lang="ts">
import type { Repo } from "@/types/github";
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

const props = defineProps(["item"]);

const repo = computed(() => {
  const repository: Repo = props.item;

  if (repository.description) {
    const desc = repository.description;
    const allowedDescLen = 200;
    repository.description =
      desc.slice(0, allowedDescLen) +
      (allowedDescLen < desc.length ? "..." : "");
  }

  return repository;
});

const timeAgo = (date: string) => {
  const timeAgo = new TimeAgo("en-US");
  return timeAgo.format(new Date(date));
};
</script>
<template>
  <div class="repo-card">
    <div class="repo-wrapper">
      <div class="title">
        <a :href="repo.url" target="_blank"
          >{{ repo.full_name }}
          <Icon class="external-icon" icon="eva:external-link-fill"
        /></a>
      </div>
      <div>
        {{ repo.description }}
      </div>
      <div class="tags">
        <div class="tag" v-for="tag in repo.tags" :key="tag">
          {{ tag }}
        </div>
      </div>
      <div class="data">
        <div class="data-item" v-if="repo.stars">
          <Icon icon="bi:star" class="data-icon" />
          {{ repo.stars.toLocaleString("en-US") }}
          {{ repo.stars > 1 ? "stars" : "star" }}
        </div>
        <div class="data-item" v-if="repo.language">
          {{ repo.language }}
        </div>
        <div
          class="data-item"
          v-if="repo.license && repo.license != 'NOASSERTION'"
        >
          {{ repo.license }} License
        </div>
        <div class="data-item">Updated {{ timeAgo(repo.updated_at) }}</div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.repo-card {
  border-top: 1px solid #ddd;
}

.repo-wrapper {
  padding: 15px 10px;
}

.title {
  font-size: 14pt;
}

.tags {
  padding: 5px 0 5px;
}
.tag {
  display: inline-block;
  padding: 3px 8px;
  background: #a7f3d0;
  color: #444;
  border-radius: 8px;
  margin: 5px 6px 0 0px;
  font-size: 10pt;
}

.data > div {
  display: inline-block;
  margin: 10px 20px 0px 0px;
}

.data-item {
  color: #777;
}
.data-icon {
  font-size: 12pt;
  position: relative;
  top: 2px;
}

.external-icon {
  position: relative;
  top: 2px;
  left: 3px;
}
</style>
