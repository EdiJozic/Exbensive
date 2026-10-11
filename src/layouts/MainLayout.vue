<template>
  <q-layout view="lHh Lpr lFf" class="finance-layout">
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      :width="258"
      class="finance-drawer"
    >
      <div class="drawer-inner">
        <router-link to="/" class="brand" aria-label="Exbensive početna">
          <span class="brand-mark"><q-icon name="account_balance_wallet" /></span>
          <span>exbensive<span class="brand-period">.</span></span>
        </router-link>

        <div class="nav-group-label">WORKSPACE</div>
        <q-list class="main-nav">
          <q-item clickable v-ripple to="/" exact active-class="nav-active">
            <q-item-section avatar><q-icon name="grid_view" /></q-item-section>
            <q-item-section>Pregled</q-item-section>
            <q-item-section side><span class="active-indicator"></span></q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/convert" active-class="nav-active">
            <q-item-section avatar><q-icon name="currency_exchange" /></q-item-section>
            <q-item-section>Konverter valuta</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/add" active-class="nav-active">
            <q-item-section avatar><q-icon name="currency_bitcoin" /></q-item-section>
            <q-item-section>Crypto konverter</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/invest" active-class="nav-active">
            <q-item-section avatar><q-icon name="savings" /></q-item-section>
            <q-item-section>Štednja</q-item-section>
          </q-item>
        </q-list>

        <div class="drawer-spacer"></div>

        <div class="budget-tip">
          <div class="tip-icon"><q-icon name="lightbulb" /></div>
          <div class="tip-label">MALI SAVJET</div>
          <p>Prati svoje navike. Mali koraci stvaraju velike promjene.</p>
          <div class="tip-sparkline"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        </div>

        <div class="drawer-profile">
          <q-avatar size="38px" class="profile-avatar">EJ</q-avatar>
          <div class="profile-copy">
            <strong>{{ userStore.currentUser?.name || 'Demo korisnik' }}</strong>
            <span>{{ userStore.currentUser?.email || 'Osobne financije' }}</span>
          </div>
          <q-icon name="more_horiz" class="profile-more" />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-header class="top-header">
        <q-toolbar class="top-toolbar">
          <q-btn
            flat
            round
            dense
            icon="menu"
            aria-label="Otvori navigaciju"
            class="mobile-menu"
            @click="drawerOpen = !drawerOpen"
          />
          <div class="breadcrumbs"><span>Workspace</span><q-icon name="chevron_right" /><strong>{{ routeTitle }}</strong></div>
          <q-space />
          <q-btn flat round dense icon="notifications_none" class="notification-button">
            <q-badge floating rounded class="notification-dot" />
          </q-btn>
          <q-separator vertical class="header-separator" />
          <q-avatar size="34px" class="header-avatar">EJ</q-avatar>
        </q-toolbar>
      </q-header>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from 'src/stores/user'

const route = useRoute()
const userStore = useUserStore()
const drawerOpen = ref(false)
const routeTitle = computed(() => {
  if (route.path === '/convert') return 'Konverter valuta'
  if (route.path === '/add') return 'Crypto konverter'
  if (route.path === '/invest') return 'Štednja'
  return 'Pregled'
})
</script>

<style scoped>
.finance-layout {
  color: #212a27;
  background: #f6f8f6;
}

.finance-drawer {
  color: #e8ecea;
  background: #18221f;
  border-right: 0;
}

.drawer-inner {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 27px 17px 15px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0 0 50px 8px;
  color: #f7f9f7;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.055em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border-radius: 11px;
  background: #c8f36b;
  color: #1e2b23;
  font-size: 20px;
}

.brand-period { color: #c8f36b; }

.nav-group-label {
  margin: 0 0 11px 12px;
  color: #81908a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.main-nav :deep(.q-item) {
  min-height: 47px;
  margin: 4px 0;
  padding: 0 12px;
  border-radius: 10px;
  color: #9ba9a3;
  font-size: 12px;
  font-weight: 550;
  transition: background 170ms ease, color 170ms ease;
}

.main-nav :deep(.q-item:hover) {
  background: rgba(255, 255, 255, 0.055);
  color: #f6f8f6;
}

.main-nav :deep(.q-item__section--avatar) {
  min-width: 37px;
  color: #8da099;
}

.main-nav :deep(.nav-active) {
  background: rgba(200, 243, 107, 0.12);
  color: #d5f99b;
  font-weight: 700;
}

.main-nav :deep(.nav-active .q-item__section--avatar) { color: #c8f36b; }
.main-nav :deep(.q-item__section--side) { padding-left: 0; }
.active-indicator { width: 5px; height: 5px; border-radius: 50%; background: #c8f36b; }
.drawer-spacer { flex: 1; min-height: 35px; }

.budget-tip {
  position: relative;
  margin: 0 3px 18px;
  padding: 15px 14px 14px;
  overflow: hidden;
  border: 1px solid rgba(219, 236, 227, 0.11);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.045);
}

.tip-icon {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  margin-bottom: 14px;
  border-radius: 9px;
  background: rgba(200, 243, 107, 0.14);
  color: #c8f36b;
}

.tip-label { color: #c8f36b; font-size: 8px; font-weight: 800; letter-spacing: 0.13em; }
.budget-tip p { margin: 7px 0 17px; color: #b8c2bd; font-size: 10px; line-height: 1.65; }
.tip-sparkline { display: flex; height: 17px; align-items: end; gap: 5px; }
.tip-sparkline span { width: 16px; border-radius: 3px 3px 0 0; background: #c8f36b; opacity: 0.7; }
.tip-sparkline span:nth-child(1) { height: 6px; opacity: 0.25; }
.tip-sparkline span:nth-child(2) { height: 10px; opacity: 0.38; }
.tip-sparkline span:nth-child(3) { height: 7px; opacity: 0.42; }
.tip-sparkline span:nth-child(4) { height: 13px; opacity: 0.55; }
.tip-sparkline span:nth-child(5) { height: 9px; opacity: 0.58; }
.tip-sparkline span:nth-child(6) { height: 15px; opacity: 0.8; }
.tip-sparkline span:nth-child(7) { height: 12px; }

.drawer-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 4px 0;
  border-top: 1px solid rgba(219, 236, 227, 0.12);
}

.profile-avatar,
.header-avatar {
  background: #dce9d7;
  color: #304637;
  font-size: 11px;
  font-weight: 750;
}

.profile-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }
.profile-copy strong { overflow: hidden; color: #edf1ee; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.profile-copy span { overflow: hidden; color: #8c9b94; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.profile-more { color: #9aa8a1; }

.top-header {
  position: sticky;
  color: #37423d;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid #e9eeea;
  backdrop-filter: blur(12px);
}

.top-toolbar {
  min-height: 68px;
  padding: 0 34px;
  gap: 14px;
}

.breadcrumbs { display: flex; align-items: center; gap: 8px; color: #9aa49e; font-size: 11px; }
.breadcrumbs .q-icon { font-size: 15px; }
.breadcrumbs strong { color: #35413a; font-weight: 650; }
.notification-button { color: #64736b; }
.notification-dot { width: 6px; height: 6px; min-height: 6px; padding: 0; background: #f1876b; }
.header-separator { height: 25px; background: #e5eae6; }
.mobile-menu { display: none; color: #506057; }

@media (max-width: 700px) {
  .finance-drawer { width: 258px !important; }
  .top-toolbar { min-height: 62px; padding: 0 15px; gap: 9px; }
  .mobile-menu { display: inline-flex; }
  .breadcrumbs { font-size: 10px; }
}
</style>
