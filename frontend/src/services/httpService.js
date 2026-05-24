import config from '../config/config'

/**
 * @typedef {Object} ApiResponse - Тип успешного запроса 
 * @property {boolean} success - Успешность запроса 
 * @property {any} data - Данные 
 * @property {int} status - Статус запроса 
 * @property {Date} timestamp - Время запроса 
 * 
 * @typedef {Object} ApiError - Тип ошибки запроса 
 * @property {string} message - Сообщение ошибки 
 * @property {string?} details - Детали ошибки 
 * @property {int} status - Статус ошибки 
 * @property {Date} timestamp - Время ошибки 
 * 
 * @typedef {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} Method 
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

function getCsrfToken() {
    // const cookies = document.cookie.split('; ')
    // const csrfCookie = cookies.find(row => row.startsWith(`${CSRF_COOKIE_NAME}=`))
    // if (csrfCookie) {
    //     return csrfCookie.split('=')[1]
    // }
    // return null
    return localStorage.getItem('csrf_request_token')
}

// Инициализация CSRF токена
export async function initCsrf() {
    try {
        const response = await fetch(`${config.serverOrigin}/csrf-token`, {
            method: 'GET',
            credentials: 'include'
        })

        if (!response.ok) {
            console.error('Failed to get CSRF token:', response.status)
        }

        const data = await response.json()
        const token = data.token
        
        if (token) {
            localStorage.setItem('csrf_request_token', token)
            return true
        }
        
        return false
    } catch (error) {
        console.error('CSRF initialization failed:', error)
        return false
    }
}

function requiresCsrfToken(method) {
    const dangerousMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    return dangerousMethods.includes(method)
}

/**
 * @param {Object} requestData 
 * @param {Method} requestData.method 
 * @param {string} requestData.path 
 * @param {any | undefined} requestData.body 
 * @param {boolean?} secure 
 * @param {boolean?} skipCsrf 
 * @returns {Promise<ApiResponse>} 
 */
const request = ({ method, path, body=undefined, secure=false, skipCsrf=false }) => {
    const sessionToken = cookieStore.get('session')

    const headers = {
        'Content-Type': 'application/json'
    }

    if (secure && sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`
    }

    if (requiresCsrfToken(method) && !skipCsrf) {
        const csrfToken = getCsrfToken()
        if (csrfToken) {
            headers[CSRF_HEADER_NAME] = csrfToken
        } else {
            console.warn(`CSRF token not found for ${method} ${path}. Request may be rejected.`)
        }
    }

    return new Promise((resolve, reject) => {
        fetch(`${config.serverOrigin}${path}`, {
            method,
            headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined
        })
            .then(async response => {
                if (response.status === 204) {
                    return { success: true, data: null, status: 204, timestamp: new Date() }
                }

                let data;
                try {
                    data = await response.json()
                } catch (e) {
                    if (response.ok) {
                        return { success: true, data: null, status: response.status, timestamp: new Date() }
                    }
                    throw new Error(`Invalid JSON response: ${e.message}`)
                }

                if (!response.ok || (data && data.success == false)) {
                    const error = {
                        message: data?.message || data?.error || 'Request failed',
                        details: data?.details || data?.errors,
                        status: response.status,
                        timestamp: new Date()
                    }
                    reject(error)
                    return
                }

                resolve({
                    ...data,
                    timestamp: new Date()
                })
                return response.json()
            })
            .then(data => {
                if (!data.success) {
                    reject(data)
                }
                resolve(data)
            })
            .catch(error => {
                reject({
                    message: error.message || 'Network error',
                    detail: error,
                    status: error.status || 0,
                    timestamp: new Date()
                })
            })
    })
}

const httpService = {
    /**
     * 
     * @param {string} path 
     * @param {boolean} secure 
     * @param {boolean?} skipCsrf 
     * @returns {Promise<ApiResponse>} 
     */
    get: (path, secure=false) => {
        return request({ method: 'GET', path, secure })
    },
    /**
     * 
     * @param {string} path 
     * @param {object} body 
     * @param {boolean} secure 
     * @param {boolean?} skipCsrf 
     * @returns {Promise<ApiResponse>} 
     */
    post: (path, body, secure=false, skipCsrf=false) => {
        return request({ method: 'POST', path, body, secure, skipCsrf })
    },
    /**
     * 
     * @param {string} path 
     * @param {object} body 
     * @param {boolean} secure 
     * @param {boolean?} skipCsrf 
     * @returns {Promise<ApiResponse>} 
     */
    patch: (path, body, secure=false, skipCsrf=false) => {
        return request({ method: 'PATCH', path, body, secure, skipCsrf })
    },
    /**
     * 
     * @param {string} path 
     * @param {object} body 
     * @param {boolean} secure 
     * @param {boolean?} skipCsrf 
     * @returns {Promise<ApiResponse>} 
     */
    delete: (path, secure=false, skipCsrf=false) => {
        return request({ method: 'DELETE', path, secure, skipCsrf })
    },
    refreshCsrf: initCsrf,
    hasCsrfToken: () => {
        return getCsrfToken() !== null
    }
}

export { httpService, httpService as default }
