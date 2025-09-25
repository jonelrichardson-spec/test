/**
 * NYC Subway Alerts Pro - Main JavaScript Module
 * Handles all interactive functionality and data management
 */

// ========== MODULE IMPORTS & CONFIGURATION ==========
// Note: In a real application, you might import external libraries here
// import { format } from 'date-fns'; // Example external library
// import { debounce } from 'lodash'; // Example utility library

// ========== APPLICATION STATE ==========
const AppState = {
    currentView: 'geo',
    filters: {
        line: 'all',
        severity: 'all'
    },
    alerts: [],
    stats: {
        critical: 2,
        warning: 3,
        info: 1,
        good: 18
    }
};

// ========== CONFIGURATION CONSTANTS ==========
const CONFIG = {
    NOTIFICATION_DURATION: 2500,
    ANIMATION_DURATION: 300,
    REFRESH_INTERVAL: 30000, // 30 seconds
    API_ENDPOINTS: {
        alerts: '/api/alerts',
        stats: '/api/stats'
    },
    LINE_COLORS: {
        '4': '#00933C',
        '5': '#00933C', 
        '6': '#00933C',
        'L': '#a7a9ac',
        'N': '#fccc0a',
        'Q': '#fccc0a',
        'R': '#fccc0a'
    }
};

// ========== UTILITY FUNCTIONS ==========
/**
 * Debounce function to limit rapid successive calls
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Get DOM element with error handling
 */
const getElement = (selector) => {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
};

/**
 * Add event listener with error handling
 */
const addEventListenerSafe = (element, event, handler) => {
    if (element && typeof handler === 'function') {
        element.addEventListener(event, handler);
    } else {
        console.warn('Invalid element or handler for event listener');
    }
};

// ========== NOTIFICATION SYSTEM ==========
class NotificationManager {
    constructor() {
        this.container = getElement('#notificationContainer') || document.body;
        this.activeNotifications = new Set();
    }

    /**
     * Show notification with specified message and type
     */
    show(message, type = 'info') {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        this.activeNotifications.add(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-remove after delay
        setTimeout(() => {
            this.remove(notification);
        }, CONFIG.NOTIFICATION_DURATION);

        return notification;
    }

    /**
     * Create notification DOM element
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add click to dismiss
        notification.addEventListener('click', () => {
            this.remove(notification);
        });

        return notification;
    }

    /**
     * Remove notification with animation
     */
    remove(notification) {
        if (this.activeNotifications.has(notification)) {
            notification.classList.remove('show');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.activeNotifications.delete(notification);
            }, CONFIG.ANIMATION_DURATION);
        }
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.activeNotifications.forEach(notification => {
            this.remove(notification);
        });
    }
}

// ========== MAP MANAGEMENT ==========
class MapManager {
    constructor() {
        this.currentView = AppState.currentView;
        this.initializeEventListeners();
    }

    /**
     * Initialize map-related event listeners
     */
    initializeEventListeners() {
        // View toggle buttons
        document.querySelectorAll('.map-view-btn').forEach(btn => {
            addEventListenerSafe(btn, 'click', (e) => {
                const view = e.target.dataset.view;
                if (view && view !== this.currentView) {
                    this.switchView(view);
                }
            });
        });

        // Station markers (geographic view)
        document.querySelectorAll('.station-marker').forEach(marker => {
            addEventListenerSafe(marker, 'click', (e) => {
                const station = e.target.dataset.station;
                if (station) {
                    this.handleStationClick(station);
                }
            });
        });

        // Station groups (schematic view)
        document.querySelectorAll('.station-group').forEach(group => {
            addEventListenerSafe(group, 'click', (e) => {
                const station = e.currentTarget.dataset.station;
                if (station) {
                    this.handleStationClick(station);
                }
            });
        });

        // Subway lines
        document.querySelectorAll('.subway-line').forEach(line => {
            addEventListenerSafe(line, 'click', (e) => {
                const lineCode = e.target.dataset.line;
                if (lineCode) {
                    this.handleLineClick(lineCode);
                }
            });
        });

        // Borough areas
        document.querySelectorAll('.borough').forEach(borough => {
            addEventListenerSafe(borough, 'click', (e) => {
                const boroughName = e.target.dataset.borough;
                if (boroughName) {
                    this.handleBoroughClick(boroughName);
                }
            });
        });
    }

    /**
     * Switch between map views
     */
    switchView(view) {
        if (this.currentView === view) return;

        // Update button states
        document.querySelectorAll('.map-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Switch map displays
        document.querySelectorAll('.map-view').forEach(mapView => {
            mapView.classList.toggle('active', mapView.id === `${view}Map`);
        });

        this.currentView = view;
        AppState.currentView = view;

        // Show confirmation
        notificationManager.show(`Switched to ${view === 'geo' ? 'Geographic' : 'Schematic'} view`, 'success');
    }

    /**
     * Handle station click events
     */
    handleStationClick(stationName) {
        const stationInfo = this.getStationInfo(stationName);
        if (stationInfo) {
            notificationManager.show(`Station: ${stationName} - ${stationInfo.status}`, stationInfo.type);
            this.highlightStation(stationName);
        }
    }

    /**
     * Handle subway line click events
     */
    handleLineClick(lineCode) {
        const lineInfo = this.getLineInfo(lineCode);
        if (lineInfo) {
            notificationManager.show(`${lineCode} Line: ${lineInfo.status}`, lineInfo.type);
            filterManager.setLineFilter(lineCode);
        }
    }

    /**
     * Handle borough click events
     */
    handleBoroughClick(boroughName) {
        const formattedName = boroughName.charAt(0).toUpperCase() + boroughName.slice(1);
        notificationManager.show(`Viewing ${formattedName} stations`, 'info');
    }

    /**
     * Get station information
     */
    getStationInfo(stationName) {
        const stationData = {
            'Union Sq': { status: 'Critical Service Issues', type: 'error' },
            '14 St': { status: 'Service Warning', type: 'warning' },
            '8 Ave': { status: 'Service Disrupted', type: 'warning' },
            'Times Sq': { status: 'Normal Service', type: 'success' }
        };
        return stationData[stationName] || { status: 'Unknown Status', type: 'info' };
    }

    /**
     * Get line information
     */
    getLineInfo(lineCode) {
        const lineData = {
            '456': { status: 'Service Delays', type: 'error' },
            'L': { status: 'Weekend Service Changes', type: 'warning' },
            'NQR': { status: 'Normal Service', type: 'success' }
        };
        return lineData[lineCode] || { status: 'Unknown Status', type: 'info' };
    }

    /**
     * Highlight station on map
     */
    highlightStation(stationName) {
        // Remove existing highlights
        document.querySelectorAll('.station-highlight').forEach(el => {
            el.classList.remove('station-highlight');
        });

        // Add highlight to current station
        const stationElements = document.querySelectorAll(`[data-station="${stationName}"]`);
        stationElements.forEach(element => {
            element.classList.add('station-highlight');
            setTimeout(() => {
                element.classList.remove('station-highlight');
            }, 3000);
        });
    }
}

// ========== FILTER MANAGEMENT ==========
class FilterManager {
    constructor() {
        this.lineFilter = getElement('#lineFilter');
        this.severityFilter = getElement('#severityFilter');
        this.initializeEventListeners();
    }

    /**
     * Initialize filter event listeners
     */
    initializeEventListeners() {
        if (this.lineFilter) {
            addEventListenerSafe(this.lineFilter, 'change', 
                debounce((e) => this.handleLineFilter(e.target.value), 300)
            );
        }

        if (this.severityFilter) {
            addEventListenerSafe(this.severityFilter, 'change', 
                debounce((e) => this.handleSeverityFilter(e.target.value), 300)
            );
        }
    }

    /**
     * Handle line filter changes
     */
    handleLineFilter(lineValue) {
        AppState.filters.line = lineValue;
        this.applyFilters();
        
        const filterText = lineValue === 'all' ? 'All Lines' : `Line ${lineValue}`;
        notificationManager.show(`Filtering by: ${filterText}`, 'info');
    }

    /**
     * Handle severity filter changes
     */
    handleSeverityFilter(severityValue) {
        AppState.filters.severity = severityValue;
        this.applyFilters();
        
        const filterText = severityValue === 'all' ? 'All Severities' : 
            severityValue.charAt(0).toUpperCase() + severityValue.slice(1);
        notificationManager.show(`Filtering by: ${filterText}`, 'info');
    }

    /**
     * Set line filter programmatically
     */
    setLineFilter(lineValue) {
        if (this.lineFilter) {
            this.lineFilter.value = lineValue;
            this.handleLineFilter(lineValue);
        }
    }

    /**
     * Apply current filters to alert cards
     */
    applyFilters() {
        const alertCards = document.querySelectorAll('.alert-card');
        
        alertCards.forEach(card => {
            const cardLines = card.dataset.lines;
            const cardSeverity = card.dataset.severity;
            
            const lineMatch = AppState.filters.line === 'all' || 
                (cardLines && cardLines.includes(AppState.filters.line));
            
            const severityMatch = AppState.filters.severity === 'all' || 
                cardSeverity === AppState.filters.severity;
            
            if (lineMatch && severityMatch) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });

        this.updateVisibleAlertCount();
    }

    /**
     * Update count of visible alerts
     */
    updateVisibleAlertCount() {
        const visibleAlerts = document.querySelectorAll('.alert-card[style*="block"], .alert-card:not([style*="none"])').length;
        const totalAlerts = document.querySelectorAll('.alert-card').length;
        
        // Update UI indicator if it exists
        const countElement = getElement('#alertCount');
        if (countElement) {
            countElement.textContent = `${visibleAlerts} of ${totalAlerts}`;
        }
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        AppState.filters.line = 'all';
        AppState.filters.severity = 'all';
        
        if (this.lineFilter) this.lineFilter.value = 'all';
        if (this.severityFilter) this.severityFilter.value = 'all';
        
        this.applyFilters();
        notificationManager.show('Filters reset', 'success');
    }
}

// ========== DATA MANAGEMENT ==========
class DataManager {
    constructor() {
        this.lastRefresh = null;
        this.refreshInterval = null;
        this.isRefreshing = false;
    }

    /**
     * Initialize data refresh system
     */
    initialize() {
        this.startAutoRefresh();
        this.lastRefresh = new Date();
    }

    /**
     * Start automatic data refresh
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, CONFIG.REFRESH_INTERVAL);
    }

    /**
     * Stop automatic data refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Manual data refresh
     */
    async refreshData() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        const refreshBtn = getElement('#refreshBtn');
        
        try {
            // Update UI to show loading state
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '⟳ Refreshing...';
            }

            // Simulate API call (replace with real API calls)
            await this.simulateDataFetch();
            
            this.updateStats();
            this.lastRefresh = new Date();
            
            notificationManager.show('Alerts refreshed successfully!', 'success');
            
        } catch (error) {
            console.error('Refresh failed:', error);
            notificationManager.show('Failed to refresh alerts', 'error');
        } finally {
            // Restore UI state
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '🔄 Refresh';
            }
            this.isRefreshing = false;
        }
    }

    /**
     * Simulate data fetching (replace with real API calls)
     */
    async simulateDataFetch() {
        return new Promise(resolve => {
            setTimeout(() => {
                // Simulate slight variations in stats
                AppState.stats.critical = Math.max(0, AppState.stats.critical + Math.floor(Math.random() * 3) - 1);
                AppState.stats.warning = Math.max(0, AppState.stats.warning + Math.floor(Math.random() * 3) - 1);
                resolve();
            }, 1000);
        });
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const elements = {
            critical: getElement('#criticalCount'),
            warning: getElement('#warningCount'),
            info: getElement('#infoCount'),
            good: getElement('#goodCount')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element && AppState.stats[key] !== undefined) {
                element.textContent = AppState.stats[key];
                element.classList.add('slide-in');
            }
        });
    }
}

// ========== GLOBAL INSTANCES ==========
let notificationManager;
let mapManager;
let filterManager;
let dataManager;

// ========== MAIN APPLICATION INITIALIZATION ==========
/**
 * Initialize the application when DOM is loaded
 */
function initializeApp() {
    try {
        // Initialize managers
        notificationManager = new NotificationManager();
        mapManager = new MapManager();
        filterManager = new FilterManager();
        dataManager = new DataManager();

        // Set up refresh button
        const refreshBtn = getElement('#refreshBtn');
        if (refreshBtn) {
            addEventListenerSafe(refreshBtn, 'click', () => {
                dataManager.refreshData();
            });
        }

        // Initialize data management
        dataManager.initialize();

        // Add keyboard shortcuts
        addKeyboardShortcuts();

        // Show welcome notification
        setTimeout(() => {
            notificationManager.show('NYC Subway Alerts Pro loaded successfully!', 'success');
        }, 500);

        console.log('NYC Subway Alerts Pro initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);
        if (notificationManager) {
            notificationManager.show('Application initialization failed', 'error');
        }
    }
}

/**
 * Add keyboard shortcuts
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R for refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !e.shiftKey) {
            e.preventDefault();
            dataManager.refreshData();
        }
        
        // Escape to clear notifications
        if (e.key === 'Escape') {
            notificationManager.clearAll();
        }

        // G for geographic view, S for schematic view
        if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
            mapManager.switchView('geo');
        }
        if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
            mapManager.switchView('schema');
        }
    });
}

/**
 * Handle page visibility changes for performance optimization
 */
function handleVisibilityChange() {
    if (document.hidden) {
        dataManager.stopAutoRefresh();
    } else {
        dataManager.startAutoRefresh();
        // Refresh data when page becomes visible again
        dataManager.refreshData();
    }
}

// ========== EVENT LISTENERS ==========
// DOM Content Loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Page Visibility API
document.addEventListener('visibilitychange', handleVisibilityChange);

// Window unload cleanup
window.addEventListener('beforeunload', () => {
    if (dataManager) {
        dataManager.stopAutoRefresh();
    }
});

// Handle errors gracefully
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    if (notificationManager) {
        notificationManager.show('An error occurred. Please refresh the page.', 'error');
    }
});

// ========== PUBLIC API ==========
// Expose some functions globally for backwards compatibility
window.NYCSubwayAlerts = {
    refreshAlerts: () => dataManager?.refreshData(),
    showAlert: (station) => mapManager?.handleStationClick(station),
    showLineAlert: (line) => mapManager?.handleLineClick(line),
    switchView: (view) => mapManager?.switchView(view),
    resetFilters: () => filterManager?.resetFilters()
};

// Legacy function aliases for backwards compatibility
window.refreshAlerts = () => window.NYCSubwayAlerts.refreshAlerts();
window.showAlert = (station) => window.NYCSubwayAlerts.showAlert(station);
window.showLineAlert = (line) => window.NYCSubwayAlerts.showLineAlert(line);
window.switchView = (view) => window.NYCSubwayAlerts.switchView(view);