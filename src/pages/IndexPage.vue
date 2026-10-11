<template>
  <q-page class="dashboard-page">
    <div class="dashboard-content">
      <div class="page-heading">
        <div>
          <div class="date-line"><span class="live-dot"></span> {{ todayLabel }}</div>
          <h1>Dobro jutro, {{ selectedUser?.name?.split(' ')[0] || 'Edi' }} <span>☀</span></h1>
          <p>Evo pregleda tvojih financija na jednom mjestu.</p>
        </div>
        <div class="heading-actions">
          <q-select
            v-if="userStore.users.length"
            v-model="selectedUserId"
            :options="userStore.users"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            dense
            borderless
            class="user-select"
            aria-label="Odaberi korisnika"
          >
            <template #prepend><q-avatar size="27px" class="select-avatar">EJ</q-avatar></template>
          </q-select>
          <q-btn unelevated no-caps class="add-expense-button" icon="add" label="Novi trošak" @click="expenseDialog = true" />
        </div>
      </div>

      <q-banner v-if="loadError" rounded class="connection-banner">
        <template #avatar><q-icon name="info_outline" /></template>
        {{ loadError }} Prikazuju se ogledni podaci.
      </q-banner>

      <div class="demo-note">
        <q-icon name="science" />
        <span><strong>Demo prikaz</strong> — grafikoni i iznosi su ogledni podaci, nisu stvarno stanje računa.</span>
      </div>

      <section class="summary-grid" aria-label="Financijski sažetak">
        <article v-for="stat in stats" :key="stat.title" class="summary-card">
          <div class="summary-top">
            <div class="summary-icon" :class="stat.tone"><q-icon :name="stat.icon" /></div>
            <span class="summary-change" :class="stat.changeTone"><q-icon :name="stat.changeIcon" /> {{ stat.change }}</span>
          </div>
          <div class="summary-label">{{ stat.title }}</div>
          <div class="summary-amount">{{ stat.amount }}<span> €</span></div>
          <div class="summary-foot">{{ stat.caption }}</div>
          <div class="summary-sparkline" :class="stat.tone">
            <span v-for="(height, index) in stat.spark" :key="index" :style="{ height: `${height}px` }"></span>
          </div>
        </article>
      </section>

      <section class="charts-grid">
        <article class="panel trend-panel">
          <div class="panel-heading">
            <div>
              <div class="panel-kicker">FINANCIJSKI PREGLED</div>
              <h2>Kretanje novca</h2>
            </div>
            <q-btn-dropdown flat no-caps class="period-button" label="Zadnjih 6 mjeseci" dropdown-icon="expand_more">
              <q-list>
                <q-item clickable v-close-popup><q-item-section>Ovaj mjesec</q-item-section></q-item>
                <q-item clickable v-close-popup><q-item-section>Zadnjih 6 mjeseci</q-item-section></q-item>
                <q-item clickable v-close-popup><q-item-section>Ova godina</q-item-section></q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div v-if="!actualExpenses.length" class="chart-legend">
            <span><i class="legend-dot income-dot"></i> Prihodi <b>€2.450</b></span>
            <span><i class="legend-dot expense-dot"></i> Troškovi <b>€1.284</b></span>
          </div>
          <div v-else class="chart-legend">
            <span><i class="legend-dot expense-dot"></i> Stvarni troškovi</span>
          </div>
          <apexchart type="area" height="250" :options="trendOptions" :series="trendSeries" />
        </article>

        <article class="panel category-panel">
          <div class="panel-heading">
            <div>
              <div class="panel-kicker">GDJE OLAZI NOVAC</div>
              <h2>Po kategorijama</h2>
            </div>
            <q-btn flat round dense icon="more_horiz" class="more-button" aria-label="Više opcija" />
          </div>
          <div class="category-chart-wrap">
            <apexchart type="donut" height="220" :options="categoryOptions" :series="categorySeries" />
            <div class="donut-center"><span>{{ actualExpenses.length ? 'STVARNI TROŠKOVI' : 'UKUPNO' }}</span><strong>€{{ categoryTotalLabel }}</strong><small>{{ actualExpenses.length ? 'zabilježeno' : 'ovaj mjesec' }}</small></div>
          </div>
          <div class="category-legend">
            <div v-for="category in categoryBreakdown" :key="category.name" class="category-row">
              <span class="category-name"><i :style="{ background: category.color }"></i>{{ category.name }}</span>
              <span class="category-value">{{ category.amount }} <small>{{ category.percent }}%</small></span>
            </div>
          </div>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="panel transactions-panel">
          <div class="panel-heading">
            <div>
              <div class="panel-kicker">NEDAVNA AKTIVNOST</div>
              <h2>Posljednje transakcije</h2>
            </div>
            <q-btn flat no-caps class="view-all-button" label="Vidi sve" icon-right="arrow_forward" />
          </div>
          <div class="transactions-list">
            <div v-for="transaction in transactions" :key="transaction.name" class="transaction-row">
              <div class="transaction-icon" :class="transaction.tone"><q-icon :name="transaction.icon" /></div>
              <div class="transaction-info">
                <strong>{{ transaction.name }}</strong>
                <span>{{ transaction.detail }}</span>
              </div>
              <div class="transaction-date">{{ transaction.date }}</div>
              <div class="transaction-amount">{{ transaction.amount }} €</div>
            </div>
          </div>
          <div class="sample-caption"><q-icon name="science" /> Primjer transakcija za prikaz dizajna</div>
        </article>

        <article class="panel budget-panel">
          <div class="panel-heading">
            <div>
              <div class="panel-kicker">MJESEČNI PLAN</div>
              <h2>Budžet potrošnje</h2>
            </div>
            <div class="budget-status"><span></span> U tijeku</div>
          </div>
          <div class="budget-amount-row"><strong>€1.284</strong><span>od €2.000</span></div>
          <div class="budget-progress"><span></span></div>
          <div class="budget-scale"><span>Potrošeno 64%</span><span>Preostalo €716</span></div>
          <div class="budget-divider"></div>
          <div class="budget-tip-row">
            <div class="tip-bulb"><q-icon name="lightbulb" /></div>
            <div><strong>Odlično ti ide!</strong><span>Na dobrom si putu da ostaneš unutar budžeta.</span></div>
          </div>
          <q-btn flat no-caps class="budget-link" label="Uredi mjesečni budžet" icon-right="arrow_forward" />
        </article>
      </section>

      <footer class="dashboard-footer">
        <span>© 2026 Exbensive</span>
        <span>Upravljaj novcem s više jasnoće <i>✳</i></span>
      </footer>
    </div>

    <q-dialog v-model="expenseDialog">
      <q-card class="expense-dialog">
        <q-card-section class="dialog-heading">
          <div class="dialog-icon"><q-icon name="receipt_long" /></div>
          <div><div class="panel-kicker">EVIDENCIJA</div><div class="text-h6">Dodaj novi trošak</div></div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup aria-label="Zatvori" />
        </q-card-section>
        <q-card-section class="dialog-form">
          <q-banner v-if="formMessage" rounded :class="formError ? 'form-error' : 'form-success'">
            {{ formMessage }}
          </q-banner>
          <q-select
            v-if="userStore.users.length"
            v-model="selectedUserId"
            :options="userStore.users"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            label="Korisnik"
            outlined
          />
          <q-banner v-else rounded class="connection-banner">
            Za spremanje troška poveži se s backendom i odaberi korisnika.
          </q-banner>
          <q-input v-model.number="amount" type="number" min="0.01" step="0.01" label="Iznos (€)" outlined prefix="€" />
          <q-select v-model="category" :options="categories" label="Kategorija" outlined />
          <q-input v-model="date" type="date" label="Datum" outlined />
        </q-card-section>
        <q-card-actions class="dialog-actions">
          <q-btn flat no-caps label="Odustani" v-close-popup />
          <q-btn unelevated no-caps label="Spremi trošak" icon="check" class="save-expense-button" :loading="savingExpense" :disable="!userStore.users.length" @click="saveExpense" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useExpensesStore } from 'src/stores/expenses'

const userStore = useUserStore()
const expensesStore = useExpensesStore()
const selectedUserId = ref(null)
const actualExpenses = ref([])
const loadError = ref('')
const expenseDialog = ref(false)
const savingExpense = ref(false)
const formMessage = ref('')
const formError = ref(false)
const amount = ref(null)
const category = ref(null)
const date = ref(new Date().toISOString().slice(0, 10))
const categories = ['Hrana', 'Zabava', 'Shopping', 'Prijevoz', 'Ostalo']
const todayLabel = new Date().toLocaleDateString('hr-HR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}).toLocaleUpperCase('hr-HR')

const selectedUser = computed(() =>
  userStore.users.find((user) => user.id === selectedUserId.value)
)

const stats = [
  {
    title: 'Ukupni prihodi',
    amount: '2.450',
    caption: 'u ovom mjesecu',
    icon: 'south_west',
    tone: 'mint',
    change: '+8,2%',
    changeIcon: 'trending_up',
    changeTone: 'positive-change',
    spark: [12, 18, 14, 23, 20, 29, 24, 34, 30, 38, 34, 46]
  },
  {
    title: 'Ukupni troškovi',
    amount: '1.284',
    caption: 'u ovom mjesecu',
    icon: 'north_east',
    tone: 'peach',
    change: '−4,6%',
    changeIcon: 'trending_down',
    changeTone: 'positive-change',
    spark: [34, 27, 31, 23, 28, 20, 25, 17, 20, 15, 18, 11]
  },
  {
    title: 'Raspoloživo',
    amount: '1.165',
    caption: 'od ukupnih prihoda',
    icon: 'account_balance_wallet',
    tone: 'lavender',
    change: '+12,4%',
    changeIcon: 'trending_up',
    changeTone: 'positive-change',
    spark: [10, 14, 12, 22, 17, 25, 22, 32, 28, 36, 33, 43]
  },
  {
    title: 'Ukupna štednja',
    amount: '320',
    caption: 'cilj: €500',
    icon: 'savings',
    tone: 'blue',
    change: '64%',
    changeIcon: 'flag',
    changeTone: 'neutral-change',
    spark: [9, 12, 15, 13, 20, 18, 26, 23, 31, 29, 37, 42]
  }
]

const transactions = [
  { name: 'Konzum', detail: 'Hrana i namirnice', date: 'Danas, 10:42', amount: '−€42,80', icon: 'shopping_basket', tone: 'mint-icon' },
  { name: 'Spotify Premium', detail: 'Pretplate', date: 'Danas, 08:15', amount: '−€6,99', icon: 'headphones', tone: 'lavender-icon' },
  { name: 'Mjesečna plaća', detail: 'Prihod', date: 'Jučer, 09:00', amount: '+€1.850,00', icon: 'payments', tone: 'blue-icon' },
  { name: 'Bolt vožnja', detail: 'Prijevoz', date: '10. lip, 18:26', amount: '−€12,40', icon: 'local_taxi', tone: 'peach-icon' }
]

const monthEntries = computed(() => Array.from({ length: 6 }, (_, index) => {
  const month = new Date()
  month.setMonth(month.getMonth() - 5 + index)
  return {
    year: month.getFullYear(),
    month: month.getMonth(),
    label: month.toLocaleDateString('hr-HR', { month: 'short' }).replace('.', '').replace(/^./, (letter) => letter.toLocaleUpperCase('hr-HR'))
  }
}))

const trendOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 250,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Inter, "Segoe UI", sans-serif',
    foreColor: '#8b9790',
    animations: { enabled: true, easing: 'easeinout', speed: 700 }
  },
  colors: ['#a7cc68', '#efa17f'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: [3, 3], lineCap: 'round' },
  fill: {
    type: 'gradient',
    gradient: { opacityFrom: 0.24, opacityTo: 0.015, stops: [0, 90, 100] }
  },
  grid: { borderColor: '#edf0ed', strokeDashArray: 4, padding: { left: 5, right: 10 } },
  xaxis: { categories: monthEntries.value.map((entry) => entry.label), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '10px' } } },
  yaxis: { min: 0, max: 3000, tickAmount: 4, labels: { formatter: (value) => `€${(value / 1000).toFixed(value ? 1 : 0)}k`, style: { fontSize: '10px' } } },
  legend: { show: false },
  tooltip: { theme: 'light', y: { formatter: (value) => `€${value.toLocaleString('hr-HR')}` } }
}))

const trendSeries = computed(() => {
  const monthValues = monthEntries.value.map(({ year, month }) => {
    return actualExpenses.value
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
      })
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  })

  if (actualExpenses.value.length) {
    return [{ name: 'Stvarni troškovi', data: monthValues }]
  }

  return [
    { name: 'Prihodi (primjer)', data: [1850, 2100, 1980, 2350, 2200, 2450] },
    { name: 'Troškovi (primjer)', data: [1420, 1580, 1370, 1620, 1390, 1284] }
  ]
})

const demoCategories = [
  { name: 'Hrana', amount: '€428', percent: 33, color: '#a7cc68', value: 428 },
  { name: 'Stanovanje', amount: '€320', percent: 25, color: '#9c8ce0', value: 320 },
  { name: 'Prijevoz', amount: '€218', percent: 17, color: '#f2aa83', value: 218 },
  { name: 'Zabava', amount: '€180', percent: 14, color: '#7eacd0', value: 180 },
  { name: 'Ostalo', amount: '€138', percent: 11, color: '#e4c969', value: 138 }
]

const categoryBreakdown = computed(() => {
  if (!actualExpenses.value.length) return demoCategories

  const totals = actualExpenses.value.reduce((result, expense) => {
    const name = expense.category || 'Ostalo'
    result[name] = (result[name] || 0) + Number(expense.amount || 0)
    return result
  }, {})
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1
  const colors = ['#a7cc68', '#9c8ce0', '#f2aa83', '#7eacd0', '#e4c969']
  return Object.entries(totals).map(([name, value], index) => ({
    name,
    amount: `€${value.toLocaleString('hr-HR', { maximumFractionDigits: 0 })}`,
    percent: Math.round((value / total) * 100),
    color: colors[index % colors.length],
    value
  }))
})

const categorySeries = computed(() => categoryBreakdown.value.map((item) => item.value))
const categoryTotalLabel = computed(() =>
  categoryBreakdown.value
    .reduce((sum, categoryItem) => sum + categoryItem.value, 0)
    .toLocaleString('hr-HR', { maximumFractionDigits: 0 })
)
const categoryOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Inter, "Segoe UI", sans-serif', animations: { enabled: true, speed: 700 } },
  colors: categoryBreakdown.value.map((item) => item.color),
  labels: categoryBreakdown.value.map((item) => item.name),
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { width: 0 },
  plotOptions: { pie: { expandOnClick: false, donut: { size: '78%' } } },
  tooltip: { y: { formatter: (value) => `€${value.toLocaleString('hr-HR')}` } }
}))

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users')
    if (!response.ok) throw new Error(`Dohvat korisnika nije uspio (${response.status}).`)
    const users = await response.json()
    if (!Array.isArray(users)) throw new Error('API je vratio neočekivan popis korisnika.')
    userStore.setUsers(users)
    if (users.length) selectedUserId.value = users[0].id
  } catch (error) {
    console.error('Greška pri učitavanju korisnika:', error)
    loadError.value = 'Korisnički podaci trenutno nisu dostupni.'
  }
})

watch(selectedUserId, async (id) => {
  const user = userStore.users.find((item) => item.id === id)
  if (user) userStore.setCurrentUser(user)
  if (!id) {
    actualExpenses.value = []
    return
  }

  try {
    actualExpenses.value = await expensesStore.loadExpensesForUser(id)
  } catch (error) {
    console.error('Greška pri učitavanju troškova:', error)
    loadError.value = 'Troškove trenutno nije moguće učitati.'
  }
})

async function saveExpense() {
  formMessage.value = ''
  formError.value = false

  if (!amount.value || Number(amount.value) <= 0 || !category.value || !selectedUserId.value) {
    formError.value = true
    formMessage.value = 'Unesi iznos, kategoriju i odaberi korisnika.'
    return
  }

  savingExpense.value = true
  try {
    await expensesStore.addExpense({
      userId: selectedUserId.value,
      amount: amount.value,
      category: category.value,
      date: date.value
    })
    actualExpenses.value = await expensesStore.loadExpensesForUser(selectedUserId.value)
    amount.value = null
    category.value = null
    formMessage.value = 'Trošak je uspješno spremljen.'
  } catch (error) {
    console.error('Greška pri spremanju troška:', error)
    formError.value = true
    formMessage.value = 'Trošak nije spremljen. Provjeri vezu s poslužiteljem i pokušaj ponovno.'
  } finally {
    savingExpense.value = false
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 68px);
  padding: 31px clamp(20px, 3vw, 42px) 18px;
  background:
    radial-gradient(ellipse at 4% 0%, rgba(229, 240, 217, 0.34), transparent 32rem),
    #f6f8f6;
}

.dashboard-content { width: min(1280px, 100%); margin: 0 auto; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.date-line { display: flex; align-items: center; gap: 8px; color: #929d96; font-size: 9px; font-weight: 750; letter-spacing: 0.12em; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #a8ca69; box-shadow: 0 0 0 3px rgba(168, 202, 105, 0.16); }
.page-heading h1 { margin: 9px 0 5px; color: #212c26; font-size: clamp(25px, 2.5vw, 32px); font-weight: 750; letter-spacing: -0.055em; line-height: 1.15; }
.page-heading h1 span { color: #e9b451; font-size: 24px; }
.page-heading p { margin: 0; color: #88948d; font-size: 11px; }
.heading-actions { display: flex; align-items: center; gap: 10px; }
.user-select { min-width: 150px; padding: 0 8px; border: 1px solid #e8ede8; border-radius: 10px; background: #fff; }
.user-select :deep(.q-field__control) { min-height: 40px; }
.select-avatar { background: #e5eedf; color: #507347; font-size: 9px; font-weight: 750; }
.add-expense-button,
.save-expense-button { min-height: 41px; padding: 0 14px; border-radius: 10px; background: #202d27; color: #fff; font-size: 11px; font-weight: 650; transition: transform 160ms ease, box-shadow 160ms ease; }
.add-expense-button:hover,
.save-expense-button:hover { transform: translateY(-1px); box-shadow: 0 7px 18px rgba(32, 45, 39, 0.16); }
.demo-note { display: flex; align-items: center; gap: 8px; margin: 0 0 17px; padding: 9px 12px; border: 1px solid #e4eadc; border-radius: 9px; background: #f0f4eb; color: #7d897d; font-size: 9px; }
.demo-note .q-icon { color: #819d54; font-size: 15px; }
.demo-note strong { color: #536c3b; }
.connection-banner { margin-bottom: 15px; background: #fff4e7; color: #8a6032; font-size: 11px; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-bottom: 15px; }
.summary-card { position: relative; min-height: 148px; padding: 17px 17px 15px; overflow: hidden; border: 1px solid #e8ede9; border-radius: 14px; background: #fff; box-shadow: 0 5px 16px rgba(32, 45, 39, 0.025); transition: transform 180ms ease, box-shadow 180ms ease; }
.summary-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(32, 45, 39, 0.07); }
.summary-top { display: flex; align-items: center; justify-content: space-between; }
.summary-icon { display: grid; width: 31px; height: 31px; place-items: center; border-radius: 10px; font-size: 16px; }
.mint { color: #688e43; }
.summary-icon.mint { background: #edf5e6; }
.peach { color: #d57e60; }
.summary-icon.peach { background: #fff0e9; }
.lavender { color: #8678c2; }
.summary-icon.lavender { background: #f1effa; }
.blue { color: #568aa0; }
.summary-icon.blue { background: #eaf3f6; }
.summary-change { display: flex; align-items: center; gap: 3px; padding: 4px 7px; border-radius: 20px; font-size: 8px; font-weight: 750; }
.summary-change .q-icon { font-size: 12px; }
.positive-change { background: #edf5e9; color: #658844; }
.neutral-change { background: #f0f2f1; color: #7d8982; }
.summary-label { margin-top: 11px; color: #88948d; font-size: 10px; }
.summary-amount { margin-top: 3px; color: #26312b; font-size: 24px; font-weight: 750; letter-spacing: -0.05em; line-height: 1.1; }
.summary-amount span { margin-left: 3px; color: #a4aea7; font-size: 12px; font-weight: 500; }
.summary-foot { margin-top: 5px; color: #a4aea7; font-size: 8px; }
.summary-sparkline { position: absolute; right: 15px; bottom: 14px; display: flex; height: 32px; align-items: end; gap: 3px; opacity: 0.52; }
.summary-sparkline span { width: 4px; border-radius: 3px 3px 0 0; background: currentColor; }
.charts-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.85fr); gap: 15px; margin-bottom: 15px; }
.panel { min-width: 0; padding: 18px 19px; border: 1px solid #e8ede9; border-radius: 14px; background: #fff; box-shadow: 0 5px 16px rgba(32, 45, 39, 0.025); }
.trend-panel { min-height: 345px; }
.category-panel { min-height: 345px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.panel-kicker { color: #9ba69f; font-size: 8px; font-weight: 800; letter-spacing: 0.12em; }
.panel-heading h2 { margin: 5px 0 0; color: #29342e; font-size: 15px; font-weight: 700; letter-spacing: -0.035em; }
.period-button { min-height: 31px; padding: 0 9px; border: 1px solid #e9eeea; border-radius: 8px; color: #78847d; font-size: 9px; }
.period-button :deep(.q-btn-dropdown__arrow) { font-size: 15px; }
.chart-legend { display: flex; gap: 20px; margin: 20px 0 2px; }
.chart-legend > span { display: flex; align-items: center; gap: 6px; color: #89948d; font-size: 9px; }
.chart-legend b { margin-left: 3px; color: #38443d; font-size: 9px; }
.legend-dot { width: 7px; height: 7px; border-radius: 50%; }
.income-dot { background: #a7cc68; }
.expense-dot { background: #efa17f; }
.trend-panel :deep(.apexcharts-canvas) { margin: 4px auto 0; }
.category-chart-wrap { position: relative; width: 100%; height: 205px; margin-top: 2px; }
.category-chart-wrap :deep(.apexcharts-canvas) { margin: 0 auto; }
.donut-center { position: absolute; top: 50%; left: 50%; display: flex; transform: translate(-50%, -49%); flex-direction: column; align-items: center; pointer-events: none; }
.donut-center span { color: #9ba69f; font-size: 7px; font-weight: 800; letter-spacing: 0.1em; }
.donut-center strong { margin-top: 3px; color: #2c3830; font-size: 20px; letter-spacing: -0.06em; }
.donut-center small { margin-top: 2px; color: #9ca79f; font-size: 8px; }
.category-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 12px; }
.category-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.category-name { display: flex; align-items: center; gap: 6px; color: #79867e; font-size: 8px; }
.category-name i { width: 7px; height: 7px; border-radius: 3px; }
.category-value { color: #39453e; font-size: 8px; font-weight: 700; white-space: nowrap; }
.category-value small { margin-left: 3px; color: #a1aba4; font-size: 7px; font-weight: 500; }
.bottom-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.85fr); gap: 15px; }
.transactions-panel { min-height: 270px; }
.view-all-button { color: #71866c; font-size: 9px; font-weight: 650; }
.view-all-button :deep(.q-icon) { font-size: 14px; }
.transactions-list { margin-top: 12px; }
.transaction-row { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto auto; align-items: center; gap: 10px; min-height: 49px; border-bottom: 1px solid #f0f2f0; }
.transaction-row:last-child { border-bottom: 0; }
.transaction-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 9px; font-size: 15px; }
.mint-icon { background: #edf5e6; color: #779b52; }
.lavender-icon { background: #f1effa; color: #8978c2; }
.blue-icon { background: #eaf3f6; color: #5d91a5; }
.peach-icon { background: #fff0e9; color: #d58768; }
.transaction-info { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.transaction-info strong { overflow: hidden; color: #3c4841; font-size: 9px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.transaction-info span { overflow: hidden; color: #a0aaa3; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.transaction-date { color: #9da8a1; font-size: 8px; white-space: nowrap; }
.transaction-amount { min-width: 62px; color: #435048; font-size: 9px; font-weight: 700; text-align: right; white-space: nowrap; }
.sample-caption { display: flex; align-items: center; gap: 5px; margin-top: 8px; color: #a0aaa3; font-size: 7px; }
.sample-caption .q-icon { color: #9bac78; font-size: 12px; }
.budget-panel { min-height: 270px; }
.budget-status { display: flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 20px; background: #f0f5e9; color: #779354; font-size: 8px; font-weight: 650; }
.budget-status span { width: 5px; height: 5px; border-radius: 50%; background: #a5c96c; }
.budget-amount-row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 24px; }
.budget-amount-row strong { color: #2d3931; font-size: 25px; letter-spacing: -0.05em; }
.budget-amount-row span { color: #98a39b; font-size: 9px; }
.budget-progress { height: 8px; margin-top: 12px; overflow: hidden; border-radius: 20px; background: #eef1ed; }
.budget-progress span { display: block; width: 64%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #a5c96b, #c8e88e); }
.budget-scale { display: flex; justify-content: space-between; margin-top: 9px; color: #929e96; font-size: 8px; }
.budget-divider { height: 1px; margin: 19px 0 14px; background: #edf0ed; }
.budget-tip-row { display: flex; align-items: center; gap: 9px; }
.tip-bulb { display: grid; width: 29px; height: 29px; flex: 0 0 auto; place-items: center; border-radius: 9px; background: #f2f4e9; color: #9aaf62; }
.budget-tip-row > div:last-child { display: flex; flex-direction: column; gap: 3px; }
.budget-tip-row strong { color: #586848; font-size: 9px; }
.budget-tip-row span { color: #929e96; font-size: 8px; line-height: 1.45; }
.budget-link { margin: 13px 0 0 -9px; color: #71866c; font-size: 8px; font-weight: 650; }
.dashboard-footer { display: flex; justify-content: space-between; margin-top: 18px; color: #a4ada7; font-size: 8px; }
.dashboard-footer i { margin-left: 3px; color: #97b864; font-style: normal; }

.expense-dialog { width: min(440px, calc(100vw - 28px)); padding: 4px; border-radius: 18px; }
.dialog-heading { display: flex; align-items: center; gap: 11px; padding: 19px 20px 12px; }
.dialog-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 12px; background: #eef4e7; color: #78964f; font-size: 19px; }
.dialog-heading .text-h6 { margin-top: 3px; color: #29342e; font-size: 17px; font-weight: 700; }
.dialog-form { display: grid; gap: 13px; padding: 10px 20px 17px; }
.dialog-actions { justify-content: flex-end; gap: 7px; padding: 0 20px 17px; }
.form-error { background: #fff0ed; color: #a94a3e; font-size: 11px; }
.form-success { background: #eef6e7; color: #577b3e; font-size: 11px; }

@keyframes fade-up { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1050px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .charts-grid,
  .bottom-grid { grid-template-columns: minmax(0, 1.3fr) minmax(240px, 0.9fr); }
  .transaction-row { grid-template-columns: 32px minmax(0, 1fr) auto; }
  .transaction-date { display: none; }
}

@media (max-width: 760px) {
  .dashboard-page { padding: 23px 16px 17px; }
  .page-heading { align-items: flex-start; flex-direction: column; }
  .heading-actions { width: 100%; justify-content: space-between; }
  .charts-grid,
  .bottom-grid { grid-template-columns: 1fr; }
  .category-panel { min-height: 330px; }
  .category-chart-wrap { max-width: 320px; margin: 3px auto 0; }
  .category-legend { max-width: 360px; margin: 0 auto; }
  .transactions-panel,
  .budget-panel { min-height: auto; }
  .budget-panel { padding-bottom: 19px; }
}

@media (max-width: 450px) {
  .summary-grid { gap: 9px; }
  .summary-card { min-height: 137px; padding: 13px; }
  .summary-amount { font-size: 21px; }
  .summary-sparkline { right: 10px; bottom: 10px; gap: 2px; }
  .summary-sparkline span { width: 3px; }
  .panel { padding: 15px 13px; }
  .chart-legend { gap: 12px; }
  .chart-legend > span { font-size: 8px; }
  .period-button { font-size: 8px; }
  .transaction-row { gap: 7px; grid-template-columns: 30px minmax(0, 1fr) auto; }
  .transaction-amount { min-width: 55px; font-size: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
</style>
