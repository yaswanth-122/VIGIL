import { useEffect, useState } from 'react';

/**
 * Sudden Phone Fall / High Impact Sensor Hook
 * Listens for DeviceMotion high-g accelerations (> 25 m/s²) and exposes sudden drop trigger
 */
export function useImpactSensor(onImpactDetected) {
  const [impactDetected, setImpactDetected] = useState(false);
  const [isSensorActive, setIsSensorActive] = useState(false);

  useEffect(() => {
    const handleDeviceMotion = (event) => {
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt(
        (acc.x || 0) * (acc.x || 0) +
        (acc.y || 0) * (acc.y || 0) +
        (acc.z || 0) * (acc.z || 0)
      );

      // High acceleration drop threshold: > 25 m/s²
      if (totalAcc > 25) {
        setImpactDetected(true);
        if (onImpactDetected) {
          onImpactDetected(totalAcc);
        }
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      setIsSensorActive(true);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [onImpactDetected]);

  // Method to simulate sudden phone fall / freefall impact
  const triggerSimulatedFall = () => {
    setImpactDetected(true);
    if (onImpactDetected) {
      onImpactDetected(28.5); // 28.5 m/s² impact simulation
    }
  };

  return {
    impactDetected,
    isSensorActive,
    triggerSimulatedFall
  };
}
