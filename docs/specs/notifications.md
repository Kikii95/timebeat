# Notifications Specification

**Version**: 1.0
**Date**: 2026-03-04
**Status**: Draft

## Overview

Timebeat uses notifications to keep users informed about their time tracking sessions, breaks, and goals. Notifications work across all platforms with native integrations.

## Notification Types

### 1. Break Reminders

Remind user to take a break after continuous work.

| Setting | Default | Range |
|---------|---------|-------|
| Interval | 25 min | 15-60 min |
| Enabled | true | — |

**Content**:
```
Title: Time for a break! ☕
Body: You've been working for 25 minutes. Take a 5-minute break.
Actions: [Take Break] [Snooze 5m] [Dismiss]
```

### 2. Session End (Timed Mode)

Alert when planned time is reached.

**Content**:
```
Title: Session complete! 🎉
Body: Your 3-hour session on "Timebeat" is finished.
Actions: [Stop Timer] [Continue +30m] [Dismiss]
```

### 3. Long Session Warning

Warn user about unusually long sessions.

| Trigger | Default |
|---------|---------|
| Same task | > 5 hours |

**Content**:
```
Title: Long session detected ⚠️
Body: You've been on "Fix auth bug" for over 5 hours.
Actions: [Take Break] [Switch Task] [Dismiss]
```

### 4. Goal Progress

Notify about goal milestones.

**Triggers**:
- 50% of goal reached
- 90% of goal reached
- Goal completed
- Goal missed (end of period)

**Content (completion)**:
```
Title: Goal achieved! 🏆
Body: You hit your weekly goal of 40 hours.
Actions: [View Stats] [Dismiss]
```

### 5. Wellness Reminders (P2)

Optional health-focused notifications.

| Type | Default Interval |
|------|------------------|
| Hydration | 2 hours |
| Stretch | 1 hour |
| Fresh air | 4 hours |

**Content (hydration)**:
```
Title: Stay hydrated! 💧
Body: Time to drink some water.
Actions: [Done] [Snooze] [Dismiss]
```

## Platform Implementation

### Web (Notification API)

```typescript
async function showNotification(title: string, options: NotificationOptions) {
  // Check permission
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notifications not permitted');
    return;
  }

  const notification = new Notification(title, {
    icon: '/icons/notification.png',
    badge: '/icons/badge.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
}
```

**Limitations**:
- Requires HTTPS
- Permission can be denied
- No actions on some browsers
- Limited when tab inactive

### Desktop (Tauri)

Using `tauri-plugin-notification`:

```rust
use tauri_plugin_notification::NotificationExt;

fn send_notification(app: &AppHandle, title: &str, body: &str) {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .icon("icons/notification.png")
        .show()
        .unwrap();
}
```

**Features**:
- Native OS notifications
- Actions supported
- Works in background
- Sound support

### Mobile (Capacitor)

Using `@capacitor/local-notifications`:

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

async function scheduleNotification(title: string, body: string, delay: number) {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title,
        body,
        schedule: { at: new Date(Date.now() + delay) },
        sound: 'notification.wav',
        actionTypeId: 'TIMER_ACTIONS',
        extra: { type: 'break_reminder' },
      },
    ],
  });
}
```

**iOS**:
- Request permission on first use
- Background notifications limited
- Rich notifications with actions

**Android**:
- Notification channels
- Foreground service notification
- Full action support

## Settings

### User Preferences

```typescript
interface NotificationSettings {
  // Master toggle
  enabled: boolean;

  // Break reminders
  breakReminders: {
    enabled: boolean;
    intervalMinutes: number; // 15-60
  };

  // Session alerts
  sessionEnd: {
    enabled: boolean;
    beforeMinutes: number; // 0 = at end, 5 = 5 min before
  };

  // Long session warning
  longSession: {
    enabled: boolean;
    thresholdHours: number; // 3-8
  };

  // Goals
  goalProgress: {
    enabled: boolean;
    milestones: boolean; // 50%, 90%
    completion: boolean;
  };

  // Wellness (P2)
  wellness: {
    hydration: { enabled: boolean; intervalHours: number };
    stretch: { enabled: boolean; intervalHours: number };
    freshAir: { enabled: boolean; intervalHours: number };
  };

  // Sound
  sound: {
    enabled: boolean;
    volume: number; // 0-100
  };
}
```

### Settings UI

```tsx
<SettingsSection title="Notifications">
  <Toggle
    label="Enable notifications"
    value={settings.enabled}
    onChange={updateSettings}
  />

  <SubSection title="Break Reminders">
    <Toggle label="Enabled" ... />
    <Slider
      label="Interval"
      min={15}
      max={60}
      step={5}
      unit="minutes"
    />
  </SubSection>

  {/* More sections */}
</SettingsSection>
```

## Notification Service

### Architecture

```typescript
class NotificationService {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  // Schedule recurring notification
  scheduleRecurring(id: string, interval: number, callback: () => void) {
    this.cancel(id); // Cancel existing
    const timer = setInterval(callback, interval);
    this.timers.set(id, timer);
  }

  // Schedule one-time notification
  scheduleOnce(id: string, delay: number, callback: () => void) {
    this.cancel(id);
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);
    this.timers.set(id, timer);
  }

  // Cancel scheduled notification
  cancel(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  // Cancel all
  cancelAll() {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers.clear();
  }
}
```

### Integration with Timer

```typescript
// In timer store
start(project, task, plannedMinutes) {
  // ... start logic

  // Schedule break reminder
  notificationService.scheduleRecurring(
    'break-reminder',
    settings.breakReminders.intervalMinutes * 60 * 1000,
    () => showBreakReminder()
  );

  // Schedule session end (if timed)
  if (plannedMinutes) {
    notificationService.scheduleOnce(
      'session-end',
      plannedMinutes * 60 * 1000,
      () => showSessionEnd()
    );
  }
}

stop() {
  // Cancel all timer-related notifications
  notificationService.cancel('break-reminder');
  notificationService.cancel('session-end');

  // ... stop logic
}
```

## Sound Alerts

### Sound Files

| Sound | File | Duration |
|-------|------|----------|
| Break reminder | `break.wav` | 2s |
| Session end | `complete.wav` | 3s |
| Warning | `warning.wav` | 1s |
| Goal achieved | `achievement.wav` | 3s |

### Playing Sounds

```typescript
class SoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  async initialize() {
    this.audioContext = new AudioContext();
    await this.loadSounds();
  }

  async loadSounds() {
    const soundFiles = ['break', 'complete', 'warning', 'achievement'];
    for (const name of soundFiles) {
      const response = await fetch(`/sounds/${name}.wav`);
      const buffer = await response.arrayBuffer();
      const decoded = await this.audioContext!.decodeAudioData(buffer);
      this.sounds.set(name, decoded);
    }
  }

  play(name: string) {
    if (!this.audioContext || !settings.sound.enabled) return;

    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();

    source.buffer = buffer;
    gain.gain.value = settings.sound.volume / 100;

    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start();
  }
}
```

## Do Not Disturb

### System DND Detection

```typescript
async function isSystemDndEnabled(): Promise<boolean> {
  // Web: Not available (return false)
  // Tauri: Check via system API
  // Capacitor: Use native plugin
  return false;
}
```

### App DND Mode

```typescript
interface DndSettings {
  enabled: boolean;
  schedule: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
  allowCritical: boolean; // Allow session-end even in DND
}
```

## Action Handling

### Web

```typescript
notification.onclick = (event) => {
  const action = event.action;
  switch (action) {
    case 'take-break':
      timerStore.startBreak();
      break;
    case 'snooze':
      notificationService.scheduleOnce('break-reminder', 5 * 60 * 1000, showBreakReminder);
      break;
    case 'dismiss':
      // Do nothing
      break;
  }
  notification.close();
};
```

### Desktop/Mobile

Actions are handled via deep links or native callbacks.

```typescript
// Capacitor
LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
  const { actionId, notification: { extra } } = notification;
  handleNotificationAction(actionId, extra);
});
```

## Testing

### Unit Tests

```typescript
describe('NotificationService', () => {
  it('should schedule recurring notification', () => {});
  it('should cancel notification', () => {});
  it('should respect DND settings', () => {});
  it('should play sound when enabled', () => {});
});
```

### Manual Testing

- [ ] Break reminder fires at correct interval
- [ ] Session end notification appears
- [ ] Actions work correctly
- [ ] Sound plays when enabled
- [ ] DND respected
- [ ] Settings persist

---

*This specification defines notification behavior for Timebeat.*
