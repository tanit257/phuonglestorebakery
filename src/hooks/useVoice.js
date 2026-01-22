import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createSpeechRecognition,
  processVoiceCommand,
  processVoiceCommandWithConfidence,
  suggestCorrections
} from '../services/voiceAI';
import { useStore } from './useStore';

// Thời gian chờ trước khi xử lý lệnh (ms)
// Cho phép người dùng ngập ngừng và tiếp tục nói
const COMMAND_DELAY_MS = 1700;

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [alternatives, setAlternatives] = useState([]);
  const [result, setResult] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [isWaitingForMore, setIsWaitingForMore] = useState(false); // Đang chờ người dùng nói thêm

  const recognitionRef = useRef(null);
  const callbackRef = useRef(null);
  const processTimeoutRef = useRef(null); // Timeout để debounce
  const accumulatedTranscriptRef = useRef(''); // Tích lũy transcript qua nhiều lần nói
  const accumulatedConfidenceRef = useRef(0);
  const accumulatedAlternativesRef = useRef([]);
  const { products, customers, showNotification } = useStore();

  // Process voice command with confidence and suggestions
  const processCommand = useCallback((text, confidenceScore, alternativesList) => {
    setIsProcessing(true);
    setIsWaitingForMore(false);

    try {
      // Use confidence-aware processing
      const commandResult = processVoiceCommandWithConfidence(
        text,
        confidenceScore,
        products,
        customers,
        0.65 // Lower threshold for Vietnamese
      );

      // Get smart suggestions for correction
      const corrections = suggestCorrections(text, products, customers);
      setSuggestions(corrections);

      setResult({
        ...commandResult,
        confidence: confidenceScore,
        alternatives: alternativesList,
        suggestions: corrections
      });
    } catch (error) {
      console.error('Error processing command:', error);
      setResult({
        action: 'error',
        message: 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    } finally {
      setIsProcessing(false);
      // Reset accumulated transcript sau khi xử lý
      accumulatedTranscriptRef.current = '';
      accumulatedConfidenceRef.current = 0;
      accumulatedAlternativesRef.current = [];
    }
  }, [products, customers]);

  // Store latest callback in ref
  useEffect(() => {
    callbackRef.current = (update) => {
      if (update.error) {
        // Hủy timeout nếu có lỗi
        if (processTimeoutRef.current) {
          clearTimeout(processTimeoutRef.current);
          processTimeoutRef.current = null;
        }
        showNotification(update.message, 'error');
        setIsListening(false);
        setIsWaitingForMore(false);
        accumulatedTranscriptRef.current = '';
        return;
      }

      if (update.ended) {
        // Khi recognition kết thúc, nếu có transcript đang chờ thì xử lý luôn
        // (người dùng đã ngừng nói hoàn toàn)
        if (accumulatedTranscriptRef.current && processTimeoutRef.current) {
          // Đợi thêm một chút trước khi xử lý
          // Không hủy timeout, để nó tự chạy
        }
        setIsListening(false);
        return;
      }

      if (update.isFinal) {
        // Hủy timeout cũ nếu có
        if (processTimeoutRef.current) {
          clearTimeout(processTimeoutRef.current);
        }

        // Tích lũy transcript
        const newTranscript = accumulatedTranscriptRef.current
          ? accumulatedTranscriptRef.current + ' ' + update.transcript
          : update.transcript;

        accumulatedTranscriptRef.current = newTranscript;
        accumulatedConfidenceRef.current = update.confidence;
        accumulatedAlternativesRef.current = update.alternatives || [];

        // Cập nhật UI để hiển thị transcript đang chờ
        setTranscript(newTranscript);
        setConfidence(update.confidence);
        setAlternatives(update.alternatives || []);
        setInterimTranscript('');
        setIsWaitingForMore(true);

        // Add to history
        setTranscriptHistory(prev => [...prev, {
          text: update.transcript,
          confidence: update.confidence,
          timestamp: update.timestamp,
          alternatives: update.alternatives
        }]);

        // Đặt timeout để chờ người dùng nói thêm
        // Nếu không có thêm input trong COMMAND_DELAY_MS, xử lý lệnh
        processTimeoutRef.current = setTimeout(() => {
          const finalTranscript = accumulatedTranscriptRef.current;
          const finalConfidence = accumulatedConfidenceRef.current;
          const finalAlternatives = accumulatedAlternativesRef.current;

          if (finalTranscript) {
            console.log('Processing after delay:', finalTranscript);
            processCommand(finalTranscript, finalConfidence, finalAlternatives);
          }
          processTimeoutRef.current = null;
        }, COMMAND_DELAY_MS);

        // Restart recognition để tiếp tục nghe
        // (continuous = false nên cần restart thủ công)
        try {
          if (recognitionRef.current) {
            // Đợi một chút trước khi restart
            setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Có thể recognition đã bị dừng hoặc đang chạy
                console.log('Could not restart recognition:', e.message);
              }
            }, 100);
          }
        } catch (e) {
          console.log('Error restarting recognition:', e);
        }
      } else {
        // Interim transcript (while speaking)
        // Hiển thị transcript đang tích lũy + interim
        const displayTranscript = accumulatedTranscriptRef.current
          ? accumulatedTranscriptRef.current + ' ' + update.transcript
          : update.transcript;
        setInterimTranscript(displayTranscript);
        setConfidence(update.confidence || 0);

        // Hủy timeout nếu người dùng đang nói tiếp
        if (processTimeoutRef.current) {
          clearTimeout(processTimeoutRef.current);
          processTimeoutRef.current = null;
          setIsWaitingForMore(false);
        }
      }
    };
  }, [processCommand, showNotification]);

  // Initialize enhanced speech recognition ONCE
  useEffect(() => {
    // Wrapper function that always calls the latest callback
    const handleUpdate = (update) => {
      if (callbackRef.current) {
        callbackRef.current(update);
      }
    };

    const recognition = createSpeechRecognition(handleUpdate);

    if (!recognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      // Cleanup timeout
      if (processTimeoutRef.current) {
        clearTimeout(processTimeoutRef.current);
      }
    };
  }, []); // Empty deps - only create once

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      showNotification('Trình duyệt không hỗ trợ nhận diện giọng nói', 'error');
      return;
    }

    // Hủy timeout cũ nếu có
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current);
      processTimeoutRef.current = null;
    }

    // Reset state
    setTranscript('');
    setResult(null);
    setInterimTranscript('');
    setAlternatives([]);
    setSuggestions([]);
    setConfidence(0);
    setIsListening(true);
    setIsWaitingForMore(false);
    accumulatedTranscriptRef.current = '';
    accumulatedConfidenceRef.current = 0;
    accumulatedAlternativesRef.current = [];

    try {
      recognitionRef.current.start();
    } catch (error) {
      // Recognition might already be running
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  }, [showNotification]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Nếu có transcript đang chờ, xử lý ngay
    if (accumulatedTranscriptRef.current && processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current);
      processTimeoutRef.current = null;

      const finalTranscript = accumulatedTranscriptRef.current;
      const finalConfidence = accumulatedConfidenceRef.current;
      const finalAlternatives = accumulatedAlternativesRef.current;

      processCommand(finalTranscript, finalConfidence, finalAlternatives);
    }

    setIsListening(false);
    setIsWaitingForMore(false);
  }, [processCommand]);

  // Clear result
  const clearResult = useCallback(() => {
    // Hủy timeout nếu có
    if (processTimeoutRef.current) {
      clearTimeout(processTimeoutRef.current);
      processTimeoutRef.current = null;
    }

    setTranscript('');
    setInterimTranscript('');
    setResult(null);
    setAlternatives([]);
    setSuggestions([]);
    setConfidence(0);
    setIsWaitingForMore(false);
    accumulatedTranscriptRef.current = '';
    accumulatedConfidenceRef.current = 0;
    accumulatedAlternativesRef.current = [];
  }, []);

  // Retry with alternative transcript
  const retryWithAlternative = useCallback((alternativeTranscript) => {
    processCommand(alternativeTranscript, 1.0, []);
  }, [processCommand]);

  // Clear history
  const clearHistory = useCallback(() => {
    setTranscriptHistory([]);
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    confidence,
    alternatives,
    result,
    isSupported,
    suggestions,
    transcriptHistory,
    isWaitingForMore, // Thêm state mới để UI có thể hiển thị "đang chờ..."
    startListening,
    stopListening,
    clearResult,
    retryWithAlternative,
    clearHistory,
  };
};
