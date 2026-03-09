import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(localStorage.getItem('theme') !== 'light')

    function toggleTheme() {
        isDark.value = !isDark.value
        const theme = isDark.value ? 'dark' : 'light'
        localStorage.setItem('theme', theme)

        if (isDark.value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    function initTheme() {
        // This is mostly handled by index.html script, 
        // but here we ensure the reactive state matches.
        const theme = localStorage.getItem('theme') || 'dark'
        isDark.value = theme === 'dark'
        if (isDark.value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return {
        isDark,
        toggleTheme,
        initTheme
    }
})
