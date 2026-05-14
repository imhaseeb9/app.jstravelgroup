import router from '@/router'
import api from '@/service/api'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
        otpEmail: null,
    }),

    getters: {
        isAuthenticated: state => !!state.token,
        isSuperAdmin: state => state.user?.type === 'super_admin',
        hasPermission: state => permission => {
            if (!state.user) return false
            if (state.user.type === 'super_admin') return true
            return state.user.permissions?.includes(permission) || false
        }
    },

    actions: {
        async login(email, password) {
            this.loading = true
            this.error = null
            try {
                const response = await api.post('/auth/login', { email, password })
                const data = response.data

                if (data.requires_otp) {
                    this.otpEmail = email
                    return { requires_otp: true }
                }

                // No OTP required — direct login
                this.setAuth(data.data)
                return { requires_otp: false }

            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        async verifyOtp(email, otp) {
            this.loading = true
            this.error = null
            try {
                const response = await api.post('/auth/verify-otp', { email, otp })
                this.setAuth(response.data.data)
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Invalid OTP'
                throw error
            } finally {
                this.loading = false
            }
        },

        async resendOtp(email) {
            try {
                await api.post('/auth/resend-otp', { email })
            } catch (error) {
                throw error
            }
        },

        async logout() {
            try {
                await api.post('/auth/logout')
            } catch (error) {
                console.error(error)
            } finally {
                this.clearAuth()
                router.push('/login')
            }
        },

        async fetchMe() {
            try {
                const response = await api.get('/auth/me')
                this.user = response.data.data
                localStorage.setItem('user', JSON.stringify(this.user))
            } catch (error) {
                console.error(error)
            }
        },

        setAuth(data) {
            this.token = data.token
            this.user = data.user
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        },

        clearAuth() {
            this.token = null
            this.user = null
            this.otpEmail = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
})