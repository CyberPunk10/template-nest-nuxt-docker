<template>
  <div class="home">
    <div class="col">
      <NuxtWelcome />
    </div>
    <div class="col col--home-data">
      <HomeTasks />
      <HomeDbTables class="home-db-tables" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0;
  flex: 1;
  min-height: 0;
  background: #0f172a;
  color: #fff;
}

.col {
  border-right: 1px solid #1e293b;
  overflow: auto;
  min-height: 0;

  :deep(.min-h-screen) {
    min-height: 0;
  }
}

.col--home-data {
  border-right: none;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-db-tables {
  margin-top: 16px;
}
</style>
