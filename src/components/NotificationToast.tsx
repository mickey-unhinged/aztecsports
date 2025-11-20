import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Notification sound using Web Audio API
const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Create a pleasant notification sound
  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

export const useNotificationSound = () => {
  const toastWithSound = (message: string, type: "success" | "error" | "info" = "info") => {
    playNotificationSound();
    
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast(message);
    }
  };

  return { toastWithSound };
};

// Export a function to show notifications with sound
export const showNotificationWithSound = (message: string, type: "success" | "error" | "info" = "info") => {
  playNotificationSound();
  
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
};
