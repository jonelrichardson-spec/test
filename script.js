/*
 * NYC Subway Alerts Pro - JavaScript Module
 * Modern ES6+ JavaScript with modular functions and data management
 */

// ========== CONSTANTS & CONFIGURATION ==========
const SUBWAY_LINE_COLORS = {
    '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
    '4': '#00933C', '5': '#00933C', '6': '#00933C',
    '7': '#B933AD',
    'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
    'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
    'G': '#6CBE45',
    'J': '#996633', 'Z': '#996633',
    'L': '#A7A9AC',
    'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
    'S': '#808183'
};

const REFRESH_INTERVAL = 120000; // 2 minutes
const STORAGE_KEY = 'subwayAlertsPreferences';

// ========== GLOBAL STATE ==========
const AppState = {
    currentAlerts: [],
    filteredAlerts: [],
    userPreferences: {
        soundEnabled: false,
        rushHourMode: false,
        currentTheme: 'light',
        currentFontSize: 'normal',
        currentLanguage: 'en',
        userLocation: null
    }
};

// ========== SIMULATED ALERT DATA ==========
const SIMULATED_ALERTS = [
    {
        id: '1',
        title: 'Service Disruption on 4, 5, 6 Lines',
        description: 'Due to signal problems at Union Square, expect delays in both directions. Trains are operating with increased travel time of 15-20 minutes.',
        lines: ['4', '5', '6'],
        severity: 'critical',
        timestamp: new Date(Date.now() - 1800000),
        affectedStations: ['Union Sq', '14 St', 'Astor Pl'],
        estimatedResolution: new Date(Date.now() + 3600000),
        isRushHour: true,
        location: 'manhattan',
        serviceReliability: 65,
        walkingDistance: '0.3 miles'
    },
    {
        id: '2',
        title: 'Weekend Service Changes',
        description: 'L train is not running between 14 St-Union Sq and 8 Av due to planned maintenance work. Free shuttle bus service is available.',
        lines: ['L'],
        severity: 'warning',
        timestamp: new Date(Date.now() - 3600000),
        affectedStations: ['14 St-Union Sq', '8 Av', '6 Av'],
        estimatedResolution: new Date(Date.now() + 14400000),
        isRushHour: false,
        location: 'manhattan',
        serviceReliability: 45,
        walkingDistance: '0.5 miles'
    },
    {
        id: '3',
        title: 'Express Service Running Local',
        description: 'N and Q trains are running local in Manhattan due to track work. Allow extra travel time.',
        lines: ['N', 'Q'],
        severity: 'warning',
        timestamp: new Date(Date.now() - 900000),
        affectedStations: ['Times Sq', 'Herald Sq', 'Union Sq'],
        estimatedResolution: new Date(Date.now() + 7200000),
        isRushHour: true,
        location: 'manhattan',
        serviceReliability: 75,
        walkingDistance: '0.2 miles'
    },
    {
        id: '4',
        title: 'Station Accessibility Update',
        description: 'Elevator at 59 St-Columbus Circle is back in service. All station levels are now accessible.',
        lines: ['A', 'B', 'C', 'D'],
        severity: 'info',
        timestamp: new Date(Date.now() - 600000),
        affectedStations: ['59 St-Columbus Circle'],
        estimatedResolution: null,
        isRushHour: false,
        location: 'manhattan',
        serviceReliability: 95,
        walkingDistance: '0.8 miles'
    },
    {
        id: '5',
        title: 'Rush Hour Express Service',
        description: 'Additional 6 express trains are running during evening rush hours to reduce crowding.',
        lines: ['6'],
        severity: 'info',
        timestamp: new Date(Date.now() - 1200000),
        affectedStations: ['Multiple stations'],
        estimatedResolution: new Date(Date.now() + 1800000),
        isRushHour: true,
        location: 'manhattan',
        serviceReliability: 85,
        walkingDistance: '0.1 miles'
    },
    {
        id: '6',
        title: 'Brooklyn Service Alert',
        description: 'F train experiencing minor delays due to train traffic ahead. Expect 5-10 minute delays.',
        lines: ['F'],
        severity: 'warning',
        timestamp: new Date(Date.now() - 2700000),
        affectedStations: ['Jay St', 'Borough Hall', 'Court St'],
        estimatedResolution: new Date(Date.now() + 1800000),
        isRushHour: false,
        location: 'brooklyn',
        serviceReliability: 80,
        walkingDistance: '1.2 miles'
    }
];

// ========== TRANSLATION SYSTEM ==========
const TRANSLATIONS = {
    en: {
        title: "NYC Subway Alerts Pro",
        subtitle: "Real-time service alerts with smart features and accessibility",
        alertSounds: "Alert Sounds",
        filterByLine: "Filter by Line:",
        allLines: "All Lines",
        filterBySeverity: "Filter by Severity:",
        allSeverities: "All Severities",
        criticalOnly: "Critical Only",
        warnings: "Warnings",
        info: "Info",
        timeFilter: "Time Filter:",
        allTimes: "All Times",
        activeNow: "Active Now",
        rushHour: "Rush Hour Impact",
        plannedWork: "Planned Work",
        location: "Location:",
        allAreas: "All Areas",
        nearMe: "📍 Near Me",
        manhattan: "Manhattan",
        brooklyn: "Brooklyn",
        queens: "Queens",
        bronx: "Bronx",
        refresh: "🔄 Refresh",
        rushMode: "⏰ Rush Mode",
        reset: "🗑️ Reset",
        criticalAlerts: "Critical Alerts",
        serviceInfo: "Service Info",
        goodService: "Good Service",
        rushHourAlerts: "Rush Hour Alerts",
        exportShare: "📤 Export & Share",
        exportJSON: "📄 Export JSON",
        exportCSV: "📊 Export CSV",
        printView: "🖨️ Print View",
        shareSummary: "📱 Share Summary",
        loadingAlerts: "Loading subway alerts...",
        noAlertsFound: "✅ No Alerts Found",
        noAlertsMessage: "No service alerts match your current filters. Try adjusting your criteria or check back later.",
        share: "📱 Share",
        directions: "🗺️ Directions",
        affectedStations: "Affected Stations:",
        serviceStatus: "Service Status:",
        estimatedResolution: "Est. Resolution:",
        away: "away",
        updated: "📅 Updated:",
        refreshing: "⏳ Refreshing...",
        alertsRefreshed: "Alerts refreshed successfully!",
        settingsRestored: "Settings restored from",
        minutesAgo: "minutes ago",
        soundsEnabled: "Sounds enabled",
        soundsDisabled: "Sounds disabled",
        gettingLocation: "Getting your location...",
        locationFound: "Location found! Filtering nearby alerts.",
        locationError: "Could not get location. Please enable location services.",
        locationNotSupported: "Location not supported by your browser.",
        rushHourModeOn: "Rush Hour Mode ON",
        rushHourModeOff: "Rush Hour Mode OFF",
        exported: "Exported",
        alertsAs: "alerts as",
        alertCopied: "Alert copied to clipboard!",
        summaryCopied: "Alert summary copied to clipboard!",
        preferencesCleared: "All preferences cleared!",
        justNow: "Just now",
        minAgo: "min ago",
        hoursAgo: "hours ago",
        critical: "critical",
        warning: "warning",
        serviceReliability: {
            excellent: "🟢 Excellent",
            good: "🟡 Good", 
            fair: "🟠 Fair",
            poor: "🔴 Poor",
            veryPoor: "⛔ Very Poor"
        },
        fontSizes: {
            normal: "Normal Text",
            large: "Large Text",
            small: "Small Text"
        },
        themeToggle: {
            dark: "🌙 Dark",
            light: "☀️ Light"
        }
    },
    es: {
        title: "Alertas del Metro de NYC Pro",
        subtitle: "Alertas de servicio en tiempo real con funciones inteligentes y accesibilidad",
        alertSounds: "Sonidos de Alerta",
        filterByLine: "Filtrar por Línea:",
        allLines: "Todas las Líneas",
        filterBySeverity: "Filtrar por Severidad:",
        allSeverities: "Todas las Severidades",
        criticalOnly: "Solo Críticas",
        warnings: "Advertencias",
        info: "Información",
        timeFilter: "Filtro de Tiempo:",
        allTimes: "Todos los Tiempos",
        activeNow: "Activo Ahora",
        rushHour: "Impacto de Hora Pico",
        plannedWork: "Trabajo Planificado",
        location: "Ubicación:",
        allAreas: "Todas las Áreas",
        nearMe: "📍 Cerca de Mí",
        manhattan: "Manhattan",
        brooklyn: "Brooklyn",
        queens: "Queens",
        bronx: "Bronx",
        refresh: "🔄 Actualizar",
        rushMode: "⏰ Modo Hora Pico",
        reset: "🗑️ Restablecer",
        criticalAlerts: "Alertas Críticas",
        serviceInfo: "Info del Servicio",
        goodService: "Buen Servicio",
        rushHourAlerts: "Alertas de Hora Pico",
        exportShare: "📤 Exportar y Compartir",
        exportJSON: "📄 Exportar JSON",
        exportCSV: "📊 Exportar CSV",
        printView: "🖨️ Vista de Impresión",
        shareSummary: "📱 Compartir Resumen",
        loadingAlerts: "Cargando alertas del metro...",
        noAlertsFound: "✅ No se Encontraron Alertas",
        noAlertsMessage: "Ninguna alerta de servicio coincide con sus filtros actuales. Intente ajustar sus criterios o vuelva más tarde.",
        share: "📱 Compartir",
        directions: "🗺️ Direcciones",
        affectedStations: "Estaciones Afectadas:",
        serviceStatus: "Estado del Servicio:",
        estimatedResolution: "Resolución Estimada:",
        away: "de distancia",
        updated: "📅 Actualizado:",
        refreshing: "⏳ Actualizando...",
        alertsRefreshed: "¡Alertas actualizadas con éxito!",
        settingsRestored: "Configuración restaurada desde hace",
        minutesAgo: "minutos",
        soundsEnabled: "Sonidos habilitados",
        soundsDisabled: "Sonidos deshabilitados",
        gettingLocation: "Obteniendo su ubicación...",
        locationFound: "¡Ubicación encontrada! Filtrando alertas cercanas.",
        locationError: "No se pudo obtener la ubicación. Habilite los servicios de ubicación.",
        locationNotSupported: "Ubicación no compatible con su navegador.",
        rushHourModeOn: "Modo Hora Pico ACTIVADO",
        rushHourModeOff: "Modo Hora Pico DESACTIVADO",
        exported: "Exportadas",
        alertsAs: "alertas como",
        alertCopied: "¡Alerta copiada al portapapeles!",
        summaryCopied: "¡Resumen de alerta copiado al portapapeles!",
        preferencesCleared: "¡Todas las preferencias eliminadas!",
        justNow: "Ahora mismo",
        minAgo: "min atrás",
        hoursAgo: "horas atrás",
        critical: "crítico",
        warning: "advertencia",
        serviceReliability: {
            excellent: "🟢 Excelente",
            good: "🟡 Bueno",
            fair: "🟠 Regular", 
            poor: "🔴 Malo",
            veryPoor: "⛔ Muy Malo"
        },
        fontSizes: {
            normal: "Texto Normal",
            large: "Texto Grande",
            small: "Texto Pequeño"
        },
        themeToggle: {
            dark: "🌙 Oscuro",
            light: "☀️ Claro"
        }
    }
    // Additional languages can be added here (fr, ja)
};

// ========== UTILITY FUNCTIONS ==========
const Utils = {
    /**
     * Translation helper function
     * @param {string} key - Translation key (supports dot notation)
     * @returns {string} Translated text
     */
    translate(key) {
        const keys = key.split('.');
        let value = TRANSLATIONS[AppState.userPreferences.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                return TRANSLATIONS.en[key] || key;
            }
        }
        return value;
    },

    /**
     * Format timestamp relative to current time
     * @param {Date} timestamp - The timestamp to format
     * @returns {string} Formatted time string
     */
    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return this.translate('justNow');
        if (minutes < 60) return `${minutes} ${this.translate('minAgo')}`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ${this.translate('hoursAgo')}`;
        
        return timestamp.toLocaleDateString();
    },

    /**
     * Format time in 12-hour format
     * @param {Date} date - Date object to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    },

    /**
     * Get service reliability indicator
     * @param {number} percentage - Reliability percentage
     * @returns {string} Reliability indicator with emoji
     */
    getServiceReliabilityIndicator(percentage) {
        if (percentage >= 90) return this.translate('serviceReliability.excellent');
        if (percentage >= 75) return this.translate('serviceReliability.good');
        if (percentage >= 60) return this.translate('serviceReliability.fair');
        if (percentage >= 40) return this.translate('serviceReliability.poor');
        return this.translate('serviceReliability.veryPoor');
    },

    /**
     * Convert data to CSV format
     * @param {Array} data - Array of objects to convert
     * @returns {string} CSV formatted string
     */
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    },

    /**
     * Download file to user's device
     * @param {string} content - File content
     * @param {string} filename - Name of file
     * @param {string} contentType - MIME type
     */
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// ========== NOTIFICATION SYSTEM ==========
const NotificationManager = {
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, warning, error)
     */
    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// ========== SOUND SYSTEM ==========
const SoundManager = {
    /**
     * Play notification sound
     * @param {string} type - Sound type (critical, warning, info, refresh)
     */
    play(type) {
        if (!AppState.userPreferences.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const frequencies = {
                'critical': 800,
                'warning': 600,
                'info': 400,
                'refresh': 700
            };
            
            oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Sound playback failed:', error);
        }
    }
};

// ========== STORAGE MANAGER ==========
const StorageManager = {
    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        const preferences = {
            lineFilter: document.getElementById('lineFilter').value,
            severityFilter: document.getElementById('severityFilter').value,
            timeFilter: document.getElementById('timeFilter').value,
            locationFilter: document.getElementById('locationFilter').value,
            soundEnabled: AppState.userPreferences.soundEnabled,
            theme: AppState.userPreferences.currentTheme,
            fontSize: AppState.userPreferences.currentFontSize,
            rushHourMode: AppState.userPreferences.rushHourMode,
            language: AppState.userPreferences.currentLanguage,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.log('Could not save preferences:', error);
        }
    },

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;

            const preferences = JSON.parse(saved);
            
            // Update form elements
            document.getElementById('lineFilter').value = preferences.lineFilter || 'all';
            document.getElementById('severityFilter').value = preferences.severityFilter || 'all';
            document.getElementById('timeFilter').value = preferences.timeFilter || 'all';
            document.getElementById('locationFilter').value = preferences.locationFilter || 'all';
            
            // Update app state
            AppState.userPreferences.soundEnabled = preferences.soundEnabled || false;
            AppState.userPreferences.currentTheme = preferences.theme || 'light';
            AppState.userPreferences.currentFontSize = preferences.fontSize || 'normal';
            AppState.userPreferences.rushHourMode = preferences.rushHourMode || false;
            AppState.userPreferences.currentLanguage = preferences.language || 'en';
            
            // Apply preferences
            document.getElementById('languageSelector').value = AppState.userPreferences.currentLanguage;
            ThemeManager.apply(AppState.userPreferences.currentTheme);
            SoundManager.applySoundSettings();
            FontManager.apply(AppState.userPreferences.currentFontSize);
            
            // Show restoration notification
            if (preferences.lastUpdated) {
                const lastUpdated = new Date(preferences.lastUpdated);
                const timeDiff = new Date() - lastUpdated;
                const minutesAgo = Math.floor(timeDiff / 60000);
                
                if (minutesAgo < 60) {
                    setTimeout(() => {
                        NotificationManager.show(
                            `${Utils.translate('settingsRestored')} ${minutesAgo} ${Utils.translate('minutesAgo')}`,
                            'info'
                        );
                    }, 1000);
                }
            }
        } catch (error) {
            console.log('Could not load saved preferences:', error);
        }
    },

    /**
     * Clear all stored preferences
     */
    clearPreferences() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.log('Could not clear preferences:', error);
        }
    }
};

// ========== THEME MANAGER ==========
const ThemeManager = {
    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const newTheme = AppState.userPreferences.currentTheme === 'light' ? 'dark' : 'light';
        this.apply(newTheme);
        AppState.userPreferences.currentTheme = newTheme;
        StorageManager.savePreferences();
    },

    /**
     * Apply specific theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggle = document.querySelector('.theme-toggle');
        toggle.textContent = theme === 'light' 
            ? Utils.translate('themeToggle.dark') 
            : Utils.translate('themeToggle.light');
        AppState.userPreferences.currentTheme = theme;
    }
};

// ========== FONT MANAGER ==========
const FontManager = {
    /**
     * Change font size
     * @param {string} size - Font size ('small', 'normal', 'large')
     */
    change(size) {
        this.apply(size);
        AppState.userPreferences.currentFontSize = size;
        StorageManager.savePreferences();
    },

    /**
     * Apply font size to document
     * @param {string} size - Font size to apply
     */
    apply(size) {
        document.body.className = document.body.className.replace(/font-\w+/g, '');
        document.body.classList.add(`font-${size}`);
    }
};

// ========== LOCATION MANAGER ==========
const LocationManager = {
    /**
     * Request user's current location
     */
    request() {
        if (!('geolocation' in navigator)) {
            NotificationManager.show(Utils.translate('locationNotSupported'), 'error');
            return;
        }

        NotificationManager.show(Utils.translate('gettingLocation'), 'info');
        
        navigator.geolocation.getCurrentPosition(
            position => {
                AppState.userPreferences.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                NotificationManager.show(Utils.translate('locationFound'), 'success');
                document.getElementById('locationFilter').value = 'nearme';
                FilterManager.apply();
                StorageManager.savePreferences();
            },
            error => {
                NotificationManager.show(Utils.translate('locationError'), 'error');
                console.log('Geolocation error:', error);
            }
        );
    }
};

// ========== ALERT MANAGER ==========
const AlertManager = {
    /**
     * Load alerts (simulated API call)
     */
    async load() {
        console.log('Starting to load alerts...');
        UIManager.showLoading();
        
        return new Promise((resolve, reject) => {
            // Reduce loading time and add error handling
            setTimeout(() => {
                try {
                    console.log('Copying simulated alerts...');
                    AppState.currentAlerts = [...SIMULATED_ALERTS];
                    console.log('Alerts loaded:', AppState.currentAlerts.length);
                    
                    console.log('Applying filters...');
                    FilterManager.apply();
                    
                    console.log('Updating statistics...');
                    StatisticsManager.update();
                    
                    console.log('Checking for critical alerts...');
                    this.checkForCriticalAlerts();
                    
                    console.log('Showing success notification...');
                    NotificationManager.show(Utils.translate('alertsRefreshed'), 'success');
                    
                    console.log('Alert loading complete!');
                    resolve();
                } catch (error) {
                    console.error('Error during alert loading:', error);
                    reject(error);
                }
            }, 800); // Reduced from 1500ms to 800ms for faster loading
        });
    },

    /**
     * Check for critical alerts and notify user
     */
    checkForCriticalAlerts() {
        const criticalAlerts = AppState.currentAlerts.filter(alert => alert.severity === 'critical');
        
        if (criticalAlerts.length > 0) {
            criticalAlerts.forEach(() => SoundManager.play('critical'));
            
            // Browser notifications
            if ('Notification' in window && Notification.permission === 'granted') {
                criticalAlerts.forEach(alert => {
                    new Notification(`${Utils.translate('critical')}: ${alert.title}`, {
                        body: alert.description.substring(0, 100) + '...',
                        icon: '/favicon.ico'
                    });
                });
            }
        }
    },

    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
};

// ========== FILTER MANAGER ==========
const FilterManager = {
    /**
     * Apply all active filters to alerts
     */
    apply() {
        const lineFilter = document.getElementById('lineFilter').value;
        const severityFilter = document.getElementById('severityFilter').value;
        const timeFilter = document.getElementById('timeFilter').value;
        const locationFilter = document.getElementById('locationFilter').value;

        AppState.filteredAlerts = AppState.currentAlerts.filter(alert => {
            return this.matchesLineFilter(alert, lineFilter) &&
                   this.matchesSeverityFilter(alert, severityFilter) &&
                   this.matchesTimeFilter(alert, timeFilter) &&
                   this.matchesLocationFilter(alert, locationFilter) &&
                   this.matchesRushHourMode(alert);
        });

        UIManager.renderAlerts();
        StatisticsManager.update();
    },

    /**
     * Check if alert matches line filter
     */
    matchesLineFilter(alert, filter) {
        if (filter === 'all') return true;
        
        return alert.lines.some(line => {
            switch (filter) {
                case '123': return ['1', '2', '3'].includes(line);
                case '456': return ['4', '5', '6'].includes(line);
                case '7': return line === '7';
                case 'ACE': return ['A', 'C', 'E'].includes(line);
                case 'BDFM': return ['B', 'D', 'F', 'M'].includes(line);
                case 'G': return line === 'G';
                case 'JZ': return ['J', 'Z'].includes(line);
                case 'L': return line === 'L';
                case 'NQR': return ['N', 'Q', 'R', 'W'].includes(line);
                case 'S': return line === 'S';
                default: return false;
            }
        });
    },

    /**
     * Check if alert matches severity filter
     */
    matchesSeverityFilter(alert, filter) {
        return filter === 'all' || alert.severity === filter;
    },

    /**
     * Check if alert matches time filter
     */
    matchesTimeFilter(alert, filter) {
        switch (filter) {
            case 'all':
                return true;
            case 'active':
                return !alert.estimatedResolution || alert.estimatedResolution > new Date();
            case 'rush':
                return alert.isRushHour;
            case 'planned':
                return alert.severity === 'info';
            default:
                return true;
        }
    },

    /**
     * Check if alert matches location filter
     */
    matchesLocationFilter(alert, filter) {
        if (filter === 'all') return true;
        if (filter === 'nearme' && AppState.userPreferences.userLocation) {
            return parseFloat(alert.walkingDistance) < 1.0;
        }
        if (filter !== 'all' && filter !== 'nearme') {
            return alert.location === filter;
        }
        return true;
    },

    /**
     * Check if alert matches rush hour mode
     */
    matchesRushHourMode(alert) {
        return !AppState.userPreferences.rushHourMode || alert.isRushHour;
    }
};

// ========== UI MANAGER ==========
const UIManager = {
    /**
     * Update all UI text based on current language
     */
    updateLanguage() {
        // Header
        document.querySelector('.header h1').innerHTML = `🚇 ${Utils.translate('title')}`;
        document.querySelector('.header p').textContent = Utils.translate('subtitle');
        
        // Theme toggle button
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.textContent = AppState.userPreferences.currentTheme === 'light' 
            ? Utils.translate('themeToggle.dark') 
            : Utils.translate('themeToggle.light');
        
        // Font size selector
        const fontOptions = document.querySelectorAll('.font-size-btn option');
        fontOptions[0].textContent = Utils.translate('fontSizes.normal');
        fontOptions[1].textContent = Utils.translate('fontSizes.large');
        fontOptions[2].textContent = Utils.translate('fontSizes.small');
        
        // Sound section
        document.querySelector('.sound-toggle span').innerHTML = `🔊 ${Utils.translate('alertSounds')}`;
        
        // Control labels
        document.querySelector('label[for="lineFilter"]').textContent = Utils.translate('filterByLine');
        document.querySelector('label[for="severityFilter"]').textContent = Utils.translate('filterBySeverity');
        document.querySelector('label[for="timeFilter"]').textContent = Utils.translate('timeFilter');
        document.querySelector('label[for="locationFilter"]').textContent = Utils.translate('location');
        
        // Update filter options
        this.updateFilterOptions();
        
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-actions button');
        quickActionButtons[0].innerHTML = Utils.translate('refresh');
        quickActionButtons[1].innerHTML = Utils.translate('rushMode');
        quickActionButtons[2].innerHTML = Utils.translate('reset');
        quickActionButtons[3].innerHTML = `📍 ${Utils.translate('nearMe').replace('📍 ', '')}`;
        
        // Stats labels
        const statLabels = document.querySelectorAll('.stat-label');
        statLabels[0].textContent = Utils.translate('criticalAlerts');
        statLabels[1].textContent = Utils.translate('warnings');
        statLabels[2].textContent = Utils.translate('serviceInfo');
        statLabels[3].textContent = Utils.translate('goodService');
        statLabels[4].textContent = Utils.translate('rushHourAlerts');
        
        // Export section
        document.querySelector('.export-section h3').innerHTML = Utils.translate('exportShare');
        const exportButtons = document.querySelectorAll('.export-buttons button');
        exportButtons[0].innerHTML = Utils.translate('exportJSON');
        exportButtons[1].innerHTML = Utils.translate('exportCSV');
        exportButtons[2].innerHTML = Utils.translate('printView');
        exportButtons[3].innerHTML = Utils.translate('shareSummary');
        
        // Re-render alerts if they exist
        if (AppState.filteredAlerts.length > 0) {
            this.renderAlerts();
        }
    },

    /**
     * Update filter dropdown options
     */
    updateFilterOptions() {
        // Line filter options
        const lineFilterOptions = document.querySelectorAll('#lineFilter option');
        lineFilterOptions[0].textContent = Utils.translate('allLines');
        
        // Severity filter options  
        const severityFilterOptions = document.querySelectorAll('#severityFilter option');
        severityFilterOptions[0].textContent = Utils.translate('allSeverities');
        severityFilterOptions[1].textContent = Utils.translate('criticalOnly');
        severityFilterOptions[2].textContent = Utils.translate('warnings');
        severityFilterOptions[3].textContent = Utils.translate('info');
        
        // Time filter options
        const timeFilterOptions = document.querySelectorAll('#timeFilter option');
        timeFilterOptions[0].textContent = Utils.translate('allTimes');
        timeFilterOptions[1].textContent = Utils.translate('activeNow');
        timeFilterOptions[2].textContent = Utils.translate('rushHour');
        timeFilterOptions[3].textContent = Utils.translate('plannedWork');
        
        // Location filter options
        const locationFilterOptions = document.querySelectorAll('#locationFilter option');
        locationFilterOptions[0].textContent = Utils.translate('allAreas');
        locationFilterOptions[1].textContent = Utils.translate('nearMe');
        locationFilterOptions[2].textContent = Utils.translate('manhattan');
        locationFilterOptions[3].textContent = Utils.translate('brooklyn');
        locationFilterOptions[4].textContent = Utils.translate('queens');
        locationFilterOptions[5].textContent = Utils.translate('bronx');
    },

    /**
     * Show loading spinner
     */
    showLoading() {
        document.getElementById('alertsContainer').innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${Utils.translate('loadingAlerts')}</p>
            </div>
        `;
    },

    /**
     * Render alerts to the DOM
     */
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        
        if (AppState.filteredAlerts.length === 0) {
            container.innerHTML = `
                <div class="alert-card">
                    <div class="alert-content" style="text-align: center; padding: 48px;">
                        <h3 style="color: var(--good-service); margin-bottom: 16px; font-size: 1.5rem;">
                            ${Utils.translate('noAlertsFound')}
                        </h3>
                        <p style="color: var(--text-muted);">
                            ${Utils.translate('noAlertsMessage')}
                        </p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = AppState.filteredAlerts.map(alert => `
            <div class="alert-card ${alert.severity}">
                <div class="alert-header">
                    <div class="alert-meta">
                        <div class="alert-lines">
                            ${alert.lines.map(line => `
                                <span class="line-badge" style="background-color: ${SUBWAY_LINE_COLORS[line] || '#666'}">
                                    ${line}
                                </span>
                            `).join('')}
                        </div>
                        <span class="severity-badge ${alert.severity}">
                            ${Utils.translate(alert.severity)}
                        </span>
                        ${alert.isRushHour ? `<span class="rush-hour-badge">${Utils.translate('rushHour')}</span>` : ''}
                    </div>
                    <div class="alert-actions">
                        <button class="action-btn" onclick="ShareManager.shareAlert('${alert.id}')">${Utils.translate('share')}</button>
                        <button class="action-btn" onclick="DirectionsManager.get('${alert.affectedStations[0]}')">${Utils.translate('directions')}</button>
                    </div>
                </div>
                <div class="alert-content">
                    <h3 class="alert-title">${alert.title}</h3>
                    <p class="alert-description">${alert.description}</p>
                    <div class="alert-details">
                        <div><strong>${Utils.translate('affectedStations')}</strong> ${alert.affectedStations.join(', ')}</div>
                        <div><strong>${Utils.translate('serviceStatus')}</strong> ${Utils.getServiceReliabilityIndicator(alert.serviceReliability)}</div>
                        ${alert.estimatedResolution ? `<div><strong>${Utils.translate('estimatedResolution')}</strong> ${Utils.formatTime(alert.estimatedResolution)}</div>` : ''}
                        <div class="location-info">📍 ${alert.walkingDistance} ${Utils.translate('away')}</div>
                    </div>
                    <div class="alert-footer">
                        <span class="timestamp">
                            ${Utils.translate('updated')} ${Utils.formatTimestamp(alert.timestamp)}
                        </span>
                        <span style="color: var(--accent-blue); font-weight: 600;">
                            📍 ${Utils.translate(alert.location)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// ========== STATISTICS MANAGER ==========
const StatisticsManager = {
    /**
     * Update statistics display
     */
    update() {
        const stats = {
            critical: AppState.currentAlerts.filter(a => a.severity === 'critical').length,
            warning: AppState.currentAlerts.filter(a => a.severity === 'warning').length,
            info: AppState.currentAlerts.filter(a => a.severity === 'info').length,
            rushHour: AppState.currentAlerts.filter(a => a.isRushHour).length
        };

        // Calculate good service lines
        const linesWithIssues = new Set();
        AppState.currentAlerts.forEach(alert => {
            if (alert.severity === 'critical') {
                alert.lines.forEach(line => linesWithIssues.add(line));
            }
        });
        
        const totalLines = Object.keys(SUBWAY_LINE_COLORS).length;
        const goodServiceLines = totalLines - linesWithIssues.size;

        // Update DOM elements
        document.getElementById('criticalCount').textContent = stats.critical;
        document.getElementById('warningCount').textContent = stats.warning;
        document.getElementById('infoCount').textContent = stats.info;
        document.getElementById('goodServiceCount').textContent = goodServiceLines;
        document.getElementById('rushHourCount').textContent = stats.rushHour;
    }
};

// ========== EXPORT MANAGER ==========
const ExportManager = {
    /**
     * Export alerts in specified format
     * @param {string} format - Export format ('json' or 'csv')
     */
    export(format) {
        const data = AppState.filteredAlerts.map(alert => ({
            title: alert.title,
            description: alert.description,
            lines: alert.lines.join(', '),
            severity: alert.severity,
            timestamp: alert.timestamp.toISOString(),
            affectedStations: alert.affectedStations.join(', '),
            isRushHour: alert.isRushHour,
            location: alert.location,
            serviceReliability: alert.serviceReliability
        }));

        const filename = `subway-alerts.${format}`;
        
        if (format === 'json') {
            Utils.downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
        } else if (format === 'csv') {
            const csv = Utils.convertToCSV(data);
            Utils.downloadFile(csv, filename, 'text/csv');
        }
        
        NotificationManager.show(
            `${Utils.translate('exported')} ${data.length} ${Utils.translate('alertsAs')} ${format.toUpperCase()}`,
            'success'
        );
    },

    /**
     * Print alerts
     */
    print() {
        window.print();
    }
};

// ========== SHARE MANAGER ==========
const ShareManager = {
    /**
     * Share alert summary
     */
    shareSummary() {
        const summary = `${Utils.translate('title')} (${new Date().toLocaleDateString()})\n\n` +
            `${Utils.translate('criticalAlerts')}: ${document.getElementById('criticalCount').textContent}\n` +
            `${Utils.translate('warnings')}: ${document.getElementById('warningCount').textContent}\n` +
            `${Utils.translate('serviceInfo')}: ${document.getElementById('infoCount').textContent}\n\n` +
            `View full details at: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: Utils.translate('title'),
                text: summary,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(summary).then(() => {
                NotificationManager.show(Utils.translate('summaryCopied'), 'success');
            });
        }
    },

    /**
     * Share specific alert
     * @param {string} alertId - ID of alert to share
     */
    shareAlert(alertId) {
        const alert = AppState.currentAlerts.find(a => a.id === alertId);
        if (!alert) return;

        const alertText = `🚇 ${alert.title}\n\n${alert.description}\n\n` +
            `${Utils.translate('filterByLine').replace(':', '')} ${alert.lines.join(', ')}\n` +
            `${Utils.translate('filterBySeverity').replace(':', '')} ${Utils.translate(alert.severity).toUpperCase()}`;

        if (navigator.share) {
            navigator.share({
                title: alert.title,
                text: alertText
            });
        } else {
            navigator.clipboard.writeText(alertText).then(() => {
                NotificationManager.show(Utils.translate('alertCopied'), 'success');
            });
        }
    }
};

// ========== DIRECTIONS MANAGER ==========
const DirectionsManager = {
    /**
     * Get directions to station
     * @param {string} station - Station name
     */
    get(station) {
        const query = encodeURIComponent(`${station} subway station NYC`);
        window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
};

// ========== MAIN APPLICATION CONTROLLER ==========
const App = {
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('Loading user preferences...');
            StorageManager.loadPreferences();
            
            console.log('Loading alerts...');
            await AlertManager.load();
            
            console.log('Requesting notification permission...');
            AlertManager.requestNotificationPermission();
            
            console.log('Updating UI language...');
            UIManager.updateLanguage();
            
            console.log('Starting auto refresh...');
            this.startAutoRefresh();
            
            console.log('App initialization complete!');
        } catch (error) {
            console.error('Error during app initialization:', error);
            throw error;
        }
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Filter event listeners
        document.getElementById('lineFilter').addEventListener('change', () => {
            StorageManager.savePreferences();
            FilterManager.apply();
        });
        
        document.getElementById('severityFilter').addEventListener('change', () => {
            StorageManager.savePreferences();
            FilterManager.apply();
        });
        
        document.getElementById('timeFilter').addEventListener('change', () => {
            StorageManager.savePreferences();
            FilterManager.apply();
        });
        
        document.getElementById('locationFilter').addEventListener('change', () => {
            StorageManager.savePreferences();
            FilterManager.apply();
        });
    },

    /**
     * Start automatic refresh
     */
    startAutoRefresh() {
        setInterval(() => {
            this.refreshAlerts();
        }, REFRESH_INTERVAL);
    },

    /**
     * Refresh alerts with UI feedback
     */
    async refreshAlerts() {
        StorageManager.savePreferences();
        
        const refreshBtn = document.querySelector('.btn-primary');
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = `⏳ ${Utils.translate('refreshing')}`;
        refreshBtn.disabled = true;
        refreshBtn.style.opacity = '0.7';
        
        SoundManager.play('refresh');
        await AlertManager.load();
        
        setTimeout(() => {
            refreshBtn.innerHTML = Utils.translate('refresh');
            refreshBtn.disabled = false;
            refreshBtn.style.opacity = '1';
        }, 1600);
    },

    /**
     * Toggle rush hour mode
     */
    toggleRushHourMode() {
        AppState.userPreferences.rushHourMode = !AppState.userPreferences.rushHourMode;
        
        const button = document.querySelector('.quick-actions button:nth-child(2)');
        button.style.background = AppState.userPreferences.rushHourMode ? 'var(--accent-blue)' : '';
        button.style.color = AppState.userPreferences.rushHourMode ? 'white' : '';
        
        NotificationManager.show(
            AppState.userPreferences.rushHourMode 
                ? Utils.translate('rushHourModeOn') 
                : Utils.translate('rushHourModeOff'),
            'info'
        );
        
        FilterManager.apply();
        StorageManager.savePreferences();
    },

    /**
     * Clear all preferences
     */
    clearPreferences() {
        StorageManager.clearPreferences();
        
        // Reset state
        AppState.userPreferences.soundEnabled = false;
        AppState.userPreferences.rushHourMode = false;
        AppState.userPreferences.currentTheme = 'light';
        AppState.userPreferences.currentFontSize = 'normal';
        AppState.userPreferences.currentLanguage = 'en';
        
        // Reset form elements
        document.getElementById('lineFilter').value = 'all';
        document.getElementById('severityFilter').value = 'all';
        document.getElementById('timeFilter').value = 'all';
        document.getElementById('locationFilter').value = 'all';
        document.getElementById('languageSelector').value = 'en';
        
        // Apply defaults
        ThemeManager.apply('light');
        SoundManager.applySoundSettings();
        FontManager.apply('normal');
        UIManager.updateLanguage();
        FilterManager.apply();
        
        NotificationManager.show(Utils.translate('preferencesCleared'), 'info');
    }
};

// ========== GLOBAL FUNCTION BINDINGS ==========
// These functions are called from the HTML onclick attributes

/**
 * Change application language
 * @param {string} language - Language code
 */
function changeLanguage(language) {
    AppState.userPreferences.currentLanguage = language;
    UIManager.updateLanguage();
    StorageManager.savePreferences();
    NotificationManager.show(Utils.translate('alertsRefreshed'), 'success');
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    ThemeManager.toggle();
}

/**
 * Change font size
 * @param {string} size - Font size
 */
function changeFontSize(size) {
    FontManager.change(size);
}

/**
 * Toggle sound on/off
 */
function toggleSounds() {
    AppState.userPreferences.soundEnabled = !AppState.userPreferences.soundEnabled;
    SoundManager.applySoundSettings();
    StorageManager.savePreferences();
    NotificationManager.show(
        AppState.userPreferences.soundEnabled 
            ? Utils.translate('soundsEnabled') 
            : Utils.translate('soundsDisabled'),
        'info'
    );
}

/**
 * Apply sound settings to UI
 */
SoundManager.applySoundSettings = function() {
    const toggle = document.getElementById('soundToggle');
    toggle.classList.toggle('active', AppState.userPreferences.soundEnabled);
};

/**
 * Refresh alerts
 */
function refreshAlerts() {
    App.refreshAlerts();
}

/**
 * Toggle rush hour mode
 */
function toggleRushHourMode() {
    App.toggleRushHourMode();
}

/**
 * Clear all preferences
 */
function clearPreferences() {
    App.clearPreferences();
}

/**
 * Request user location
 */
function requestLocation() {
    LocationManager.request();
}

/**
 * Export alerts
 * @param {string} format - Export format
 */
function exportAlerts(format) {
    ExportManager.export(format);
}

/**
 * Print alerts
 */
function printAlerts() {
    ExportManager.print();
}

/**
 * Share alert summary
 */
function shareAlert() {
    ShareManager.shareSummary();
}

// ========== APPLICATION STARTUP ==========
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Quick fallback: Load data immediately if async fails
    setTimeout(() => {
        if (AppState.currentAlerts.length === 0) {
            console.log('Fallback: Loading data immediately...');
            AppState.currentAlerts = [...SIMULATED_ALERTS];
            FilterManager.apply();
            StatisticsManager.update();
            UIManager.updateLanguage();
            console.log('Fallback loading complete');
        }
    }, 2000);
    
    App.init().catch(error => {
        console.error('App initialization failed:', error);
        
        // Emergency fallback
        console.log('Emergency fallback: Loading basic data...');
        AppState.currentAlerts = [...SIMULATED_ALERTS];
        FilterManager.apply();
        StatisticsManager.update();
        UIManager.updateLanguage();
        
        // Show error notification but continue with basic functionality
        document.getElementById('alertsContainer').innerHTML = `
            <div class="alert-card warning">
                <div class="alert-content" style="text-align: center; padding: 32px;">
                    <h3 style="color: #ea580c; margin-bottom: 16px;">⚠️ Limited Functionality</h3>
                    <p style="margin-bottom: 16px;">Some features may not work properly, but basic alert viewing is available.</p>
                    <button onclick="location.reload()" class="btn-secondary">Refresh Page</button>
                </div>
            </div>
        `;
        
        // Still try to render alerts
        setTimeout(() => {
            FilterManager.apply();
        }, 500);
    });
});