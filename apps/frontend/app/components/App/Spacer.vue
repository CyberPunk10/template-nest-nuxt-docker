<script>
export default {
  name: 'AppSpacer',
}
</script>

<template>
  <div class="app-spacer" />
</template>

<style lang="scss">
.app-spacer {
  padding: var(--space-2) 0;

  &:last-child {
    display: none;
  }

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background-color: var(--control-primary-minor-color);
  }
}
</style>
