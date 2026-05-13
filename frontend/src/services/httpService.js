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

/**
 * @param {Object} requestData 
 * @param {Method} requestData.method 
 * @param {string} requestData.path 
 * @param {any | undefined} requestData.body 
 * @param {boolean?} secure 
 * @returns {Promise<ApiResponse>} 
 */
const request = ({ method, path, body=undefined, secure=false }) => {
    const sessionToken = cookieStore.get('session')

    const headers = {
        'Content-Type': 'application/json'
    }

    if (secure && sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`
    }

    return new Promise((resolve, reject) => {
        fetch(`${config.serverOrigin}${path}`, {
            method,
            headers,
            credentials: 'include',
            body: JSON.stringify(body)
        })
            .then(response => {
                if (response.status === 204) {
                    return { success: true, data: null, status: 204 }
                }
                return response.json()
            })
            .then(data => {
                if (!data.success) {
                    reject(data)
                }
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

const httpService = {
    /**
     * 
     * @param {string} path - Путь к серверу 
     * @param {boolean} secure - Вставка заголовка аутентификаций 
     * @returns {Promise<ApiResponse>} 
     */
    get: (path, secure=false) => {
        return request({ method: 'GET', path, secure })
    },
    /**
     * 
     * @param {string} path - Путь запроса 
     * @param {object} body - Тело запроса 
     * @param {boolean} secure - Вставка заголовка аутентификаций 
     * @returns {Promise<ApiResponse>} 
     */
    post: (path, body, secure=false) => {
        return request({ method: 'POST', path, body, secure })
    },
    /**
     * 
     * @param {string} path - Путь запроса 
     * @param {object} body - Тело запроса 
     * @param {boolean} secure - Вставка заголовка аутентификаций 
     * @returns {Promise<ApiResponse>} 
     */
    patch: (path, body, secure=false) => {
        return request({ method: 'PATCH', path, body, secure })
    },
    /**
     * 
     * @param {string} path - Путь запроса 
     * @param {object} body - Тело запроса 
     * @param {boolean} secure - Вставка заголовка аутентификаций 
     * @returns {Promise<ApiResponse>} 
     */
    delete: (path, secure=false) => {
        return request({ method: 'DELETE', path, secure })
    }
}

export { httpService, httpService as default }
