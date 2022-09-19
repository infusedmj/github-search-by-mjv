<script setup lang="ts">
import { Icon } from "@iconify/vue";
const props = defineProps(["pages", "modelValue"]);

const pageButtons = () => {
  const currentPage = props.modelValue;
  let pageButtons: Array<any> = [];

  if (currentPage > 1) pageButtons.push("<");
  pageButtons.push(1);
  let p = 0;

  if (currentPage > 5) {
    pageButtons.push("...");
    for (p = currentPage - 1; p <= currentPage + 1; p++) {
      if (p == props.pages) break;
      pageButtons.push(p);
    }
  } else {
    for (p = 2; p <= 5; p++) {
      if (p == props.pages) break;
      pageButtons.push(p);
    }
  }

  if (p !== props.pages) {
    pageButtons.push("...");
  }
  pageButtons.push(props.pages);

  if (currentPage < props.pages) pageButtons.push(">");
  return pageButtons;
};
</script>
<template>
  <div class="page-navigation">
    <div v-for="p in pageButtons()" class="page-button" :key="p">
      <a
        v-if="p == '<'"
        @click="
          $emit('update:modelValue', props.modelValue - 1);
          $emit('change');
        "
      >
        <Icon class="icon" icon="akar-icons:chevron-left"></Icon>
        <span class="detail">Previous</span>
      </a>
      <a
        v-else-if="p == '>'"
        @click="
          $emit('update:modelValue', props.modelValue + 1);
          $emit('change');
        "
      >
        <span class="detail">Next</span>
        <Icon class="icon" icon="akar-icons:chevron-right"></Icon>
      </a>
      <div v-else-if="modelValue == p" class="active">
        {{ p }}
      </div>
      <div v-else-if="p == '...'" class="ellipsis">
        <Icon class="icon" icon="dashicons:ellipsis" />
      </div>
      <a
        v-else
        :class="{ active: props.modelValue == p }"
        :key="`page-${p}`"
        @click="
          $emit('update:modelValue', p);
          $emit('change');
        "
      >
        {{ p }}
      </a>
    </div>
  </div>
</template>
<style scoped>
.page-navigation {
  display: flex;
  justify-content: center;
}

.detail {
  display: none;
}

.page-button.active {
  font-weight: bold;
}

.icon {
  position: relative;
  top: 2px;
}

.page-button > div,
.page-button > a {
  width: 100%;
  display: inline-block;
  text-align: center;
  padding: 10px;
  color: #10b981;
}

.page-button a {
  cursor: pointer;
}

.page-button .active {
  font-weight: bold;
}

@media only screen and (min-width: 768px) {
  .detail {
    display: inline;
  }
}
</style>
