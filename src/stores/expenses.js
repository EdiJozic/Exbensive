import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref([])
  const loading = ref(false)

  // Load expenses for a specific user
  async function loadExpensesForUser(userId) {
    const res = await fetch(`http://localhost:3000/api/Troskovi?userId=${userId}`)
    if (!res.ok) throw new Error(`Dohvat troškova nije uspio (${res.status}).`)

    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('API je vratio neočekivan popis troškova.')
    return data
  }

  // Add expense
  async function addExpense({ amount, category, date, userId }) {
    if (!userId) throw new Error('Za unos troška potrebno je odabrati korisnika.')

    const res = await fetch('http://localhost:3000/api/UnosTroskova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, category, date }),
    })
    if (!res.ok) throw new Error(`Spremanje troška nije uspjelo (${res.status}).`)
  }

  return { expenses, loading, loadExpensesForUser, addExpense }
})
