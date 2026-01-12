/**
 * Alert Types
 *
 * Type definitions for price alerts, notifications, and alert management.
 * Supports setting price-based triggers for market movements.
 */

import type { Market } from './market.types'

// ============================================================================
// PRICE ALERT TYPES
// ============================================================================

/**
 * Price Alert
 *
 * A user-configured alert that triggers when a market price
 * crosses a specified threshold.
 */
export interface PriceAlert {
  /** Unique alert identifier */
  id: string
  /** User ID who created this alert */
  user_id: string
  /** Market ID to monitor */
  market_id: string
  /** Full market data (joined from markets table) */
  market: Market
  /** Alert condition (above/below) */
  condition: AlertCondition
  /** Target price that triggers the alert (0-1) */
  target_price: number
  /** Whether alert has been triggered */
  triggered: boolean
  /** When the alert was triggered (null if not triggered) */
  triggered_at: string | null
  /** Alert creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at?: string
}

/**
 * Alert Condition
 *
 * Type of price comparison for alert triggering
 */
export enum AlertCondition {
  /** Trigger when price rises above target */
  ABOVE = 'above',
  /** Trigger when price falls below target */
  BELOW = 'below',
  /** Trigger when price crosses target in either direction */
  CROSS = 'cross',
  /** Trigger when price reaches exactly target (rare) */
  EXACT = 'exact'
}

/**
 * Alert Priority
 *
 * Priority level for alert notifications
 */
export enum AlertPriority {
  /** Low priority - can be batched */
  LOW = 'low',
  /** Medium priority - normal notification */
  MEDIUM = 'medium',
  /** High priority - immediate notification */
  HIGH = 'high',
  /** Urgent - push notification + sound */
  URGENT = 'urgent'
}

/**
 * Alert Status
 *
 * Current state of an alert
 */
export enum AlertStatus {
  /** Alert is active and monitoring */
  ACTIVE = 'active',
  /** Alert has been triggered */
  TRIGGERED = 'triggered',
  /** Alert is paused by user */
  PAUSED = 'paused',
  /** Alert is deleted/archived */
  ARCHIVED = 'archived'
}

// ============================================================================
// ALERT TRIGGER TYPES
// ============================================================================

/**
 * Alert Trigger
 *
 * Record of an alert being triggered
 */
export interface AlertTrigger {
  /** Unique trigger record ID */
  alert_id: string
  /** Market that triggered the alert */
  market_id: string
  /** Price that triggered the alert */
  current_price: number
  /** Target price that was crossed */
  target_price: number
  /** Condition that was met */
  condition: AlertCondition
  /** Trigger timestamp */
  timestamp: string
  /** Whether user was notified */
  notified: boolean
}

/**
 * Alert History
 *
 * Historical record of all alert triggers
 */
export interface AlertHistory {
  /** Alert ID */
  alertId: string
  /** Associated market */
  market: Market
  /** All trigger events */
  triggers: AlertTrigger[]
  /** Total number of times triggered */
  triggerCount: number
  /** First trigger timestamp */
  firstTriggeredAt?: string
  /** Last trigger timestamp */
  lastTriggeredAt?: string
}

// ============================================================================
// ALERT NOTIFICATION TYPES
// ============================================================================

/**
 * Alert Notification Type
 *
 * Types of alert-related notifications
 */
export enum AlertNotificationType {
  /** Alert was triggered */
  ALERT_TRIGGERED = 'alert_triggered',
  /** New alert was created */
  ALERT_CREATED = 'alert_created',
  /** Alert was deleted */
  ALERT_DELETED = 'alert_deleted',
  /** Alert was modified */
  ALERT_MODIFIED = 'alert_modified',
  /** Alert was paused/resumed */
  ALERT_TOGGLED = 'alert_toggled'
}

/**
 * Alert Notification
 *
 * Notification data for alert events
 */
export interface AlertNotification {
  /** Notification type */
  type: AlertNotificationType
  /** Associated alert */
  alert: PriceAlert
  /** Notification message */
  message: string
  /** Notification timestamp */
  timestamp: string
  /** Whether notification was read */
  read: boolean
  /** Action URL (navigate to market) */
  actionUrl?: string
  /** Sound to play (for urgent alerts) */
  sound?: string
}

/**
 * Notification Channel
 *
 * Available channels for alert delivery
 */
export enum NotificationChannel {
  /** In-app notification */
  IN_APP = 'in_app',
  /** Email notification */
  EMAIL = 'email',
  /** Push notification (mobile) */
  PUSH = 'push',
  /** SMS notification */
  SMS = 'sms',
  /** Webhook */
  WEBHOOK = 'webhook'
}

/**
 * Notification Preferences
 *
 * User preferences for alert notifications
 */
export interface NotificationPreferences {
  /** User ID */
  userId: string
  /** Enabled notification channels */
  enabledChannels: NotificationChannel[]
  /** Whether sounds are enabled */
  soundsEnabled: boolean
  /** Quiet hours (no notifications) */
  quietHours?: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
    timezone: string
  }
  /** Minimum priority for push notifications */
  minPushPriority: AlertPriority
  /** Email notification batch interval (minutes) */
  emailBatchInterval?: number
  /** Webhook URL for custom integrations */
  webhookUrl?: string
}

// ============================================================================
// ALERT INPUT TYPES
// ============================================================================

/**
 * Create Alert Input
 *
 * Parameters for creating a new price alert
 */
export interface CreateAlertInput {
  /** Market ID to monitor */
  market_id: string
  /** Market data (for convenience) */
  market?: any // TODO: Type this properly when market types are stable
  /** Alert condition */
  condition: AlertCondition
  /** Target price (0-1) */
  target_price: number
  /** Alert priority */
  priority?: AlertPriority
  /** Notification channels to use */
  channels?: NotificationChannel[]
  /** Custom notification message */
  custom_message?: string
  /** Whether alert should repeat */
  repeat?: boolean
  /** Cooldown period between triggers (minutes) */
  cooldown_minutes?: number
  /** Expiry date for alert */
  expires_at?: string
}

/**
 * Update Alert Input
 *
 * Parameters for updating an existing alert
 */
export interface UpdateAlertInput {
  /** New target price */
  target_price?: number
  /** New condition */
  condition?: AlertCondition
  /** New priority */
  priority?: AlertPriority
  /** New notification channels */
  channels?: NotificationChannel[]
  /** Pause/resume alert */
  status?: AlertStatus
  /** New expiry date */
  expires_at?: string | null
  /** New custom message */
  custom_message?: string
}

/**
 * Alert Filters
 *
 * Available filters for querying alerts
 */
export interface AlertFilters {
  /** Filter by triggered status */
  triggered?: boolean
  /** Filter by market */
  market_id?: string
  /** Filter by condition */
  condition?: AlertCondition
  /** Filter by status */
  status?: AlertStatus
  /** Filter by priority */
  priority?: AlertPriority
  /** Filter by expiry (active vs expired) */
  active?: boolean
}

/**
 * Alert Sort Options
 *
 * Available sorting for alert lists
 */
export interface AlertSortOptions {
  /** Field to sort by */
  field: 'created_at' | 'target_price' | 'triggered_at'
  /** Sort direction */
  direction: 'asc' | 'desc'
}

// ============================================================================
// ALERT GROUP TYPES
// ============================================================================

/**
 * Alert Group
 *
 * Grouping multiple alerts together
 */
export interface AlertGroup {
  /** Unique group identifier */
  id: string
  /** Group name */
  name: string
  /** User ID who owns the group */
  user_id: string
  /** Alert IDs in this group */
  alert_ids: string[]
  /** Group creation timestamp */
  created_at: string
}

/**
 * Bulk Alert Action
 *
 * Action to apply to multiple alerts at once
 */
export interface BulkAlertAction {
  /** Alert IDs to act upon */
  alert_ids: string[]
  /** Action to perform */
  action: 'pause' | 'resume' | 'delete' | 'update_priority'
  /** New priority (for update_priority action) */
  priority?: AlertPriority
}

// ============================================================================
// ALERT TEMPLATE TYPES
// ============================================================================

/**
 * Alert Template
 *
 * Pre-configured alert patterns for quick setup
 */
export interface AlertTemplate {
  /** Template ID */
  id: string
  /** Template name */
  name: string
  /** Template description */
  description: string
  /** Default condition */
  condition: AlertCondition
  /** Default target price calculation */
  target_price_calculator: 'current_plus_pct' | 'current_minus_pct' | 'fixed'
  /** Percentage or fixed value */
  value: number
  /** Default priority */
  priority: AlertPriority
  /** Icon for display */
  icon?: string
}

/**
 * Quick Alert Presets
 *
 * Pre-defined alert configurations
 */
export enum QuickAlertPreset {
  /** Alert when price increases 10% */
  PRICE_UP_10 = 'price_up_10',
  /** Alert when price decreases 10% */
  PRICE_DOWN_10 = 'price_down_10',
  /** Alert when price increases 25% */
  PRICE_UP_25 = 'price_up_25',
  /** Alert when price decreases 25% */
  PRICE_DOWN_25 = 'price_down_25',
  /** Alert when price crosses 50% */
  CROSS_50 = 'cross_50',
  /** Alert when price crosses 90% */
  CROSS_90 = 'cross_90',
  /** Alert when price crosses 10% */
  CROSS_10 = 'cross_10'
}

// ============================================================================
// ALERT STATISTICS TYPES
// ============================================================================

/**
 * Alert Statistics
 *
 * Statistics about user's alerts
 */
export interface AlertStatistics {
  /** Total number of active alerts */
  activeAlerts: number
  /** Total number of triggered alerts */
  triggeredAlerts: number
  /** Total number of paused alerts */
  pausedAlerts: number
  /** Most triggered market */
  mostTriggeredMarket?: {
    marketId: string
    triggerCount: number
  }
  /** Average trigger time (hours from creation) */
  avgTriggerTime?: number
  /** Trigger rate (percentage of alerts that triggered) */
  triggerRate: number
}

/**
 * Market Alert Summary
 *
 * Alert summary for a specific market
 */
export interface MarketAlertSummary {
  /** Market ID */
  marketId: string
  /** Market data */
  market: Market
  /** Number of active alerts for this market */
  activeAlerts: number
  /** Price targets being watched */
  priceTargets: number[]
  /** Number of times alerts have triggered */
  totalTriggers: number
}
