# Test Voice AI - Checklist

## Đã Sửa

1. ✅ **Dependency cycle** trong useVoice hook
   - Dùng `useRef` để lưu callback
   - Recognition chỉ tạo 1 lần
   - Callback luôn access được state mới nhất

## Các Bước Test

### 1. Mở Console (F12)
```
Kiểm tra xem có log nào không
```

### 2. Click Nút Mic
Phải thấy:
- Nút mic chuyển màu đỏ
- Badge "Đang nghe..." xuất hiện

### 3. Nói Vào Mic
Khi đang nói, phải thấy:
- **Interim transcript** (màu xanh, italic, text đang update realtime)
- Badge "Đang nhận diện..." với dot animation

### 4. Sau Khi Nói Xong
Phải thấy:
- Final transcript trong box màu xám
- Confidence score (%, màu tùy mức độ)
- Result box ở dưới

## Nếu Không Thấy Transcript

### Debug Steps:

1. **Check Console Errors**
```javascript
// Mở Console, check có error gì không
```

2. **Check Recognition Support**
```javascript
// Trong console, paste:
console.log('SpeechRecognition:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
```

3. **Check States**
```javascript
// Add vào VoiceDisplay.jsx line 75, trước return null:
console.log('Voice States:', {
  transcript,
  interimTranscript,
  result,
  isListening,
  confidence
});
```

4. **Check Microphone Permission**
- Xem browser có show popup xin quyền mic không
- Settings > Privacy > Microphone

## Expected Flow

```
1. User clicks mic button
   → startListening() called
   → recognition.start()
   → isListening = true
   → VoiceButton turns red

2. User speaks
   → recognition.onresult fired (isFinal: false)
   → handleUpdate called
   → callbackRef.current called
   → setInterimTranscript(text)
   → VoiceDisplay shows blue box with interim text

3. User stops speaking
   → recognition.onresult fired (isFinal: true)
   → alternatives analyzed
   → best transcript selected
   → setTranscript(finalTranscript)
   → setConfidence(score)
   → setAlternatives(alts)
   → processCommand() called
   → setResult(commandResult)
   → VoiceDisplay shows final transcript + confidence + result

4. recognition.onend
   → setIsListening(false)
   → VoiceButton turns back to purple
```

## Common Issues

### Issue 1: Transcript không hiện
**Nguyên nhân**: VoiceDisplay check `if (!transcript && !result && !interimTranscript) return null;`
**Solution**: Khi đang nói phải có `interimTranscript`, sau khi nói xong phải có `transcript`

### Issue 2: Recognition không start
**Nguyên nhân**: Quyền mic bị từ chối hoặc recognition không được tạo
**Solution**:
- Check `recognitionRef.current` có giá trị không
- Check browser console có error không

### Issue 3: Callback không được gọi
**Nguyên nhân**: `callbackRef.current` null hoặc recognition.onresult không fire
**Solution**: Đảm bảo `callbackRef.current` được set trước khi start listening

## Test Commands

Nói thử các câu sau:
1. "Tạo đơn cho tiệm ABC"
2. "Xem công nợ"
3. "Báo cáo doanh thu hôm nay"

## Files Changed

1. `/src/hooks/useVoice.js` - Fixed dependency cycle
2. `/src/services/voiceAI.js` - Enhanced recognition
3. `/src/components/voice/VoiceDisplay.jsx` - Enhanced UI

## Next Steps If Still Not Working

1. Add more console.logs in:
   - `createSpeechRecognition()` when onresult fires
   - `handleUpdate()` in useVoice
   - `callbackRef.current()` when called

2. Verify recognition events:
```javascript
recognition.onstart = () => console.log('Recognition started');
recognition.onresult = (e) => console.log('Result:', e);
recognition.onerror = (e) => console.log('Error:', e);
recognition.onend = () => console.log('Recognition ended');
```
