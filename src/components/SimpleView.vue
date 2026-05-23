<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Data Cuaca Sederhana</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="simple-container">
      <div v-if="loading" class="loading-text">Memuat data...</div>
      <div v-else-if="error" class="error-text">Error: {{ error }}</div>
      <div v-else>
        <div class="simple-title">
          <ion-icon :icon="listOutline" />
          Tabel Suhu per Jam
        </div>
        <table class="simple-table">
          <thead>
            <tr>
              <th>Waktu (WIB)</th>
              <th>Suhu (°C)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in weatherData" :key="idx">
              <td>{{ formatDateTime(item.time) }}</td>
              <td>{{ item.temp }} °C</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon } from '@ionic/vue'
import { listOutline } from 'ionicons/icons'
import '../styles/SimpleView.css'

interface WeatherItem {
  time: string
  temp: number
}

const weatherData = ref<WeatherItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

const loadData = async () => {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m&timezone=Asia/Jakarta'
  try {
    const res = await fetch(url)
    const data = await res.json()
    const times = data.hourly.time
    const temps = data.hourly.temperature_2m
    weatherData.value = times.map((time: string, i: number) => ({
      time: time,
      temp: temps[i]
    }))
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>