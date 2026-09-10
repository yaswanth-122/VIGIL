// Emergency Audio Siren & Web Speech Synthesis AI Voice Engine for VIGIL

let audioCtx = null;
let sirenOsc = null;
let sirenGain = null;
let sirenLfo = null;
let isSirenPlaying = false;

/**
 * Start synthesized emergency siren sound using Web Audio API
 */
export function startAlarm() {
  if (isSirenPlaying) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioCtx = new AudioContext();

    // Main Siren Oscillator
    sirenOsc = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();
    sirenLfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.value = 750; // Base frequency 750Hz

    // LFO to oscillate frequency up and down like a police siren
    sirenLfo.type = 'sine';
    sirenLfo.frequency.value = 2.5; // 2.5 Hz siren cycle speed
    lfoGain.gain.value = 350; // Pitch sweep width ±350Hz

    sirenLfo.connect(lfoGain);
    lfoGain.connect(sirenOsc.frequency);

    sirenGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    sirenOsc.start();
    sirenLfo.start();
    isSirenPlaying = true;
  } catch (err) {
    console.warn('Web Audio Siren error:', err);
  }
}

/**
 * Stop synthesized siren sound
 */
export function stopAlarm() {
  if (!isSirenPlaying) return;
  try {
    if (sirenOsc) {
      sirenOsc.stop();
      sirenOsc.disconnect();
    }
    if (sirenLfo) {
      sirenLfo.stop();
      sirenLfo.disconnect();
    }
    if (audioCtx) {
      audioCtx.close();
    }
  } catch (err) {
    console.warn('Error stopping siren:', err);
  } finally {
    isSirenPlaying = false;
    audioCtx = null;
    sirenOsc = null;
    sirenLfo = null;
  }
}

/**
 * Browser Speech Synthesis API - AI Emergency Voice Announcement
 */
export function speakVoiceAnnouncement(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser Speech Synthesis is not supported.');
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick a clear English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
