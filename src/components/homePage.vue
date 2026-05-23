<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar">
            <ion-buttons slot="end">
        <ion-button @click="goToSimple" title="Tampilan Sederhana (tabel)">
          <ion-icon :icon="listOutline" slot="start" />
          <ion-label class="ion-hide-sm-down">Sederhana</ion-label>
        </ion-button>
      </ion-buttons>
        <ion-title class="ion-text-center">
          <ion-icon :icon="cloudOutline" size="small" />
          Jakarta
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="main-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="loading" class="loading-skeleton">
        <ion-skeleton-text animated style="width: 80%; height: 60px; margin: 20px auto;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 90%; height: 120px; margin: 20px auto;"></ion-skeleton-text>
      </div>

      <div v-else-if="error" class="error-card">
        <ion-icon :icon="alertCircleOutline" size="large" />
        <p>{{ error }}</p>
        <ion-button @click="loadWeather">Coba Lagi</ion-button>
      </div>

      <div v-else class="weather-container">
        <div class="current-weather" :style="gradientStyle">
          <div class="temp-icon">
            <ion-icon :icon="getWeatherIcon(weatherData[0]?.temp, weatherData[0]?.time)" size="large" />
          </div>
          <div class="temp-value">{{ weatherData[0]?.temp }}°C</div>
          <div class="temp-desc">{{ getWeatherDesc(weatherData[0]?.temp) }}</div>
          <div class="temp-time">{{ formatTimeShort(weatherData[0]?.time) }}</div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <ion-icon :icon="thermometerOutline" />
            <div class="stat-value">{{ minTemp }}°</div>
            <div class="stat-label">Min</div>
          </div>
          <div class="stat-card">
            <ion-icon :icon="thermometerOutline" />
            <div class="stat-value">{{ maxTemp }}°</div>
            <div class="stat-label">Maks</div>
          </div>
          <div class="stat-card">
            <ion-icon :icon="calendarOutline" />
            <div class="stat-value">{{ weatherData.length }} jam</div>
            <div class="stat-label">Prakiraan</div>
          </div>
        </div>

        <div class="hourly-title">
          <ion-icon :icon="timeOutline" />
          <span>Prakiraan per Jam</span>
        </div>

        <div class="hourly-scroll">
          <div v-for="(item, idx) in weatherData" :key="idx" class="hour-card">
            <div class="hour-time">{{ formatHour(item.time) }}</div>
            <ion-icon :icon="getWeatherIcon(item.temp, item.time)" />
            <div class="hour-temp">{{ item.temp }}°</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent, IonButton, IonIcon,
  IonSkeletonText, IonButtons
} from '@ionic/vue'
import { 
  cloudOutline, alertCircleOutline, sunnyOutline, moonOutline,
  thermometerOutline, calendarOutline, timeOutline,
  rainyOutline, cloudyNightOutline, partlySunnyOutline,
  listOutline
} from 'ionicons/icons'
import '../styles/HomePage.css'

interface WeatherItem {
  time: string
  temp: number
}

const router = useRouter()
const weatherData = ref<WeatherItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const minTemp = computed(() => {
  if (!weatherData.value.length) return 0
  return Math.min(...weatherData.value.map(item => item.temp))
})
const maxTemp = computed(() => {
  if (!weatherData.value.length) return 0
  return Math.max(...weatherData.value.map(item => item.temp))
})

const gradientStyle = computed(() => {
  const temp = weatherData.value[0]?.temp || 25
  if (temp >= 30) return { background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' }
  if (temp >= 25) return { background: 'linear-gradient(135deg, #43cea2, #185a9d)' }
  if (temp >= 20) return { background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }
  return { background: 'linear-gradient(135deg, #667eea, #764ba2)' }
})

const getWeatherIcon = (temp: number, timeStr: string) => {
  const hour = new Date(timeStr).getHours()
  const isDay = hour >= 6 && hour < 18
  if (temp >= 30) return partlySunnyOutline
  if (temp >= 25) return isDay ? sunnyOutline : moonOutline
  if (temp >= 20) return isDay ? cloudyNightOutline : cloudyNightOutline
  return rainyOutline
}

const getWeatherDesc = (temp: number) => {
  if (temp >= 30) return 'Panas'
  if (temp >= 25) return 'Hangat'
  if (temp >= 20) return 'Sejuk'
  return 'Dingin'
}

const formatTimeShort = (isoString: string) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatHour = (isoString: string) => {
  return new Date(isoString).getHours() + ':00'
}

const loadWeather = async () => {
  loading.value = true
  error.value = null
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m&timezone=Asia/Jakarta'
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal mengambil data')
    const data: any = await res.json()
    const times: string[] = data.hourly.time
    const temps: number[] = data.hourly.temperature_2m
    weatherData.value = times.map((time, i) => ({
      time: time,
      temp: temps[i]
    }))
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleRefresh = async (event: CustomEvent) => {
  await loadWeather()
  ;(event.target as HTMLIonRefresherElement).complete()
}

const goToSimple = () => {
  router.push('/simple')
}

onMounted(() => {
  loadWeather()
})
</script>