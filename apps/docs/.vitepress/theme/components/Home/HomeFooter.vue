<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

// Переводы стартовой страницы из themeConfig.home (реактивно к локали VitePress).
const { theme } = useData()
const home = computed(() => theme.value.home!)

const repoUrl = 'https://github.com/CyberPunk10/template-nest-nuxt-docker'
// Команда установки шаблона (заглушка — заменить на реальный create-скаффолдер).
const installCmd = 'npx create-nest-nuxt my-app'

// TODO(автор): заменить заглушки на реальные ссылки, потом убрать пометки в вёрстке.
const sponsorUrl = 'https://github.com/sponsors/CyberPunk10' // TODO: реальный спонсор-аккаунт
const authorUrl = 'https://github.com/CyberPunk10'
const contactEmail = 'you@example.com' // TODO: реальный email
const contactTelegram = 'https://t.me/your_handle' // TODO: реальный Telegram

// Год для копирайта. SSR подставит год сборки.
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__glow" />
    <div class="footer__inner">
      <div class="footer__brand">
        <p class="footer__name">NestJS + Nuxt 4</p>
        <p class="footer__tagline">{{ home.footer.tagline }}</p>
      </div>

      <nav class="footer__col">
        <p class="footer__col-title">{{ home.footer.projectTitle }}</p>
        <a :href="repoUrl" target="_blank" rel="noopener">{{ home.footer.links.github }}</a>
        <a :href="`${repoUrl}/issues`" target="_blank" rel="noopener">
          {{ home.footer.links.issues }}
        </a>
        <a :href="`${repoUrl}/blob/main/LICENSE`" target="_blank" rel="noopener">
          {{ home.footer.links.license }}
        </a>
      </nav>

      <nav class="footer__col">
        <p class="footer__col-title">{{ home.footer.supportTitle }}</p>
        <a :href="repoUrl" target="_blank" rel="noopener">⭐ {{ home.footer.support.star }}</a>
        <!-- TODO(автор): sponsorUrl — заглушка (github.com/sponsors/CyberPunk10). Заменить на реальный спонсор-аккаунт. -->
        <a :href="sponsorUrl" target="_blank" rel="noopener">{{ home.footer.support.sponsor }}</a>
      </nav>

      <nav class="footer__col">
        <p class="footer__col-title">{{ home.footer.contactsTitle }}</p>
        <a :href="authorUrl" target="_blank" rel="noopener">{{ home.footer.contacts.author }}</a>
        <!-- TODO(автор): email/telegram — заглушки. Вписать реальные или убрать. -->
        <a :href="`mailto:${contactEmail}`">{{ home.footer.contacts.email }}</a>
        <a :href="contactTelegram" target="_blank" rel="noopener">{{ home.footer.contacts.telegram }}</a>
      </nav>

      <div class="footer__start">
        <p class="footer__col-title">{{ home.footer.startTitle }}</p>
        <p class="footer__start-hint">{{ home.footer.startHint }}</p>
        <code class="footer__cmd">{{ installCmd }}</code>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© {{ year }} NestJS + Nuxt 4 Template</span>
      <span>{{ home.footer.poweredBy }} NestJS · Nuxt · VitePress</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--home-border-2);
  background: var(--home-surface-app);
}
/* Свечение как в hero, но развёрнутое на 180° — из нижнего центра (at 50% 100%). */
.footer__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 50% 100% at 50% 100%,
    rgba(0, 220, 130, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
}
/* Контент — поверх свечения */
.footer__inner,
.footer__bottom {
  position: relative;
}
.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 48px 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
/* Бренд — на всю ширину сверху, колонки (проект/поддержать/контакты/начать) под ним */
.footer__brand {
  grid-column: 1 / -1;
}
.footer__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--home-text-strong);
  margin: 0 0 8px;
}
.footer__tagline {
  font-size: 13px;
  color: var(--home-text-muted);
  line-height: 1.6;
  margin: 0;
  max-width: 40ch;
}
.footer__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer__col-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--home-text-dim);
  margin: 0 0 4px;
}
.footer__col a {
  font-size: 13px;
  color: var(--home-text-soft);
  text-decoration: none;
  transition: color 0.15s;
}
.footer__col a:hover {
  color: var(--home-accent);
}
.footer__start {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer__start-hint {
  font-size: 13px;
  color: var(--home-text-muted);
  margin: 0;
}
.footer__cmd {
  font-family: monospace;
  font-size: 12px;
  color: var(--home-accent);
  background: var(--home-surface-2);
  border: 1px solid var(--home-border-2);
  border-radius: var(--home-radius-md);
  padding: 8px 10px;
  white-space: nowrap;
  overflow-x: auto;
}
.footer__bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 48px;
  border-top: 1px solid var(--home-border-2);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--home-text-dim);
}

@media (max-width: 900px) {
  .footer__inner {
    grid-template-columns: 1fr 1fr;
    padding: 40px 24px 28px;
  }
}

@media (max-width: 600px) {
  .footer__inner {
    grid-template-columns: 1fr;
    padding: 32px 16px 24px;
  }
  .footer__bottom {
    padding: 20px 16px;
    flex-direction: column;
  }
}
</style>
