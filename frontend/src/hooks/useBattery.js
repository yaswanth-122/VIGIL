import { useState, useEffect } from 'react';

/**
 * Real device Battery Monitoring API hook
 * Returns { batteryLevel, isCharging, warningLevel, isSupported }
 * Warning Levels: 'NORMAL' (>30%), 'LOW' (20-30%), 'CRITICAL' (10-20%), 'EMERGENCY' (<10%)
 */
export function useBattery() {
  const [batteryLevel, setBatteryLevel] = useState(95);
  const [isCharging, setIsCharging] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('getBattery' in navigator)) {
      setIsSupported(false);
      return;
    }

    let batteryRef = null;

    const updateBatteryInfo = (battery) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
    };

    navigator.getBattery().then((battery) => {
      batteryRef = battery;
      updateBatteryInfo(battery);

      battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
      battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
    }).catch((err) => {
      console.warn('Battery API error:', err);
      setIsSupported(false);
    });

    return () => {
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', () => updateBatteryInfo(batteryRef));
        batteryRef.removeEventListener('chargingchange', () => updateBatteryInfo(batteryRef));
      }
    };
  }, []);

  let warningLevel = 'NORMAL';
  if (batteryLevel < 10) {
    warningLevel = 'EMERGENCY';
  } else if (batteryLevel <= 20) {
    warningLevel = 'CRITICAL';
  } else if (batteryLevel <= 30) {
    warningLevel = 'LOW';
  }

  return {
    batteryLevel,
    isCharging,
    warningLevel,
    isSupported
  };
}
