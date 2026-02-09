# TF-IDF Voice Search - Test Guide

## ✅ Implementation Complete

TF-IDF Hybrid Search has been successfully integrated into the voice command system.

**Expected Improvements:**
- Accuracy: 70% → **85-90%**
- Better disambiguation for similar products (e.g., "bột khai" vs "bột cacao")
- FREE (no API costs)
- Works offline

---

## 🧪 How to Test

### 1. Start the App

```bash
npm run dev
```

### 2. Open Browser Console

Press `F12` or `Cmd+Option+I` to open Developer Tools.

**Look for these logs when app loads:**

```
🔄 Building TF-IDF index for voice search...
✅ Built TF-IDF index for X products
⏱️ Index built in Xms
📊 Index stats: {...}
✅ TF-IDF index ready for voice commands
```

If you see these logs → **TF-IDF is working!** ✅

---

## 📝 Test Cases

### Test Case 1: "Bột khai" vs "Bột cacao" (The main issue)

**Steps:**
1. Click voice button 🎤
2. Say: **"thêm 3 kg bột khai"**
3. Check console logs

**Expected Result:**
```
🔍 TF-IDF Search: "bột khai"
  1. Bột khai (score: 1.000) ← CORRECT!
  2. Bột mì (score: 0.200)
  3. Bột cacao (score: 0.018) ← Low score, correctly rejected
✅ Using TF-IDF Hybrid search
✅ Selected: Bột khai (score: 1.000)
```

**Success Criteria:**
- ✅ Console shows "Using TF-IDF Hybrid search"
- ✅ Top result is "Bột khai" with score > 0.9
- ✅ "Bột cacao" has low score (< 0.1)
- ✅ Product added to cart is "Bột khai"

---

### Test Case 2: Other "bột" products

Test with different flour products:

| Command | Expected Product | Notes |
|---------|-----------------|-------|
| "thêm bột mì" | Bột mì | Should match exactly |
| "thêm bột năng" | Bột năng | Should not match "bột nàng" |
| "thêm bột gạo" | Bột gạo | Should match |
| "thêm 2 kg bột cacao" | Bột cacao | Should match cacao correctly |

---

### Test Case 3: Voice Recognition Errors (Typos)

Test TF-IDF robustness with voice recognition errors:

| What you say | Voice recognizes as | Expected Match | Why? |
|-------------|-------------------|---------------|------|
| "bột khai" | "bột kai" (missing 'h') | Bột khai ✅ | Partial word match |
| "bột cacao" | "bột ca cao" | Bột cacao ✅ | Word-level matching |
| "bột mì" | "bột mi" (missing tone) | Bột mì ✅ | Normalization handles this |

---

### Test Case 4: Complex Orders

**Test:**
```
"tạo đơn cho tiệm ABC, 3 kg bột khai, 2 kg đường trắng, 5 hộp sữa"
```

**Expected:**
- 3 products parsed correctly
- Each matched to the right product using TF-IDF
- No confusion between similar names

**Check Console:**
```
🔍 TF-IDF Search: "bột khai"
  1. Bột khai (score: 1.000)
✅ Selected: Bột khai

🔍 TF-IDF Search: "đường trắng"
  1. Đường trắng (score: 1.000)
✅ Selected: Đường trắng

🔍 TF-IDF Search: "sữa"
  1. Sữa đặc (score: 0.850)
✅ Selected: Sữa đặc
```

---

## 🔍 Debugging

### If TF-IDF is not working:

**Check 1: Index Built?**
```javascript
// In console:
console.log('Products:', products.length);
```
- If `products.length === 0` → Products not loaded yet

**Check 2: Console Logs**
Look for:
- ✅ `"Using TF-IDF Hybrid search"` → Working!
- ⚠️ `"TF-IDF found no match, falling back to simple matching"` → Search term too generic
- ❌ No TF-IDF logs → Index not built or not passed

**Check 3: Product Name Format**
TF-IDF works best with:
- ✅ "Bột khai"
- ✅ "Bột cacao nguyên chất"
- ❌ "B.K" (too short)
- ❌ "Product 123" (not descriptive)

---

## 📊 Performance Benchmarks

**Expected Performance:**

| Products | Index Build Time | Search Time | Memory |
|----------|-----------------|-------------|--------|
| 50 | < 10ms | < 5ms | ~25KB |
| 100 | < 20ms | < 10ms | ~50KB |
| 300 | < 50ms | < 15ms | ~150KB |
| 1000 | < 200ms | < 30ms | ~500KB |

**To Benchmark:**
```javascript
// Add this to console:
console.time('search');
// Say voice command
console.timeEnd('search');
```

---

## 🐛 Common Issues

### Issue 1: "bột khai" still matches "cacao"

**Possible Causes:**
1. TF-IDF index not built (check console)
2. Products have similar TF-IDF scores (very rare words)
3. Voice recognition error made it completely different

**Solution:**
- Check console logs for actual search term
- Verify index was built successfully
- Try saying more clearly

### Issue 2: No matches found

**Possible Causes:**
1. Search term too short (< 2 characters after tokenization)
2. All words are stop words (e.g., "kg", "hộp")
3. Product names don't match any search words

**Solution:**
- Say more specific product names
- Include distinctive words (not just "bột")

### Issue 3: Wrong product matched

**Possible Causes:**
1. Products have very similar names
2. Voice recognition error changed meaning
3. Product name too generic

**Solution:**
- Add more distinctive words to product names
- Speak more clearly
- Check what voice recognition heard (in UI)

---

## 📈 A/B Testing (Optional)

To compare old vs new algorithm:

1. **Test with OLD algorithm:**
   - Comment out line in `voiceAI.js`:
   ```javascript
   // const result = findProductByHybrid(...);
   // Use old matching instead
   ```

2. **Test same phrases with both**
3. **Compare accuracy**

**Expected Results:**
- Old: 70% accuracy (7/10 correct)
- New: 85% accuracy (8.5/10 correct)

---

## 🎉 Success Criteria

The TF-IDF implementation is successful if:

- ✅ "bột khai" correctly matches "Bột khai" (not "cacao")
- ✅ Console shows "Using TF-IDF Hybrid search"
- ✅ Search time < 50ms for 300 products
- ✅ Accuracy improved compared to before
- ✅ No API costs
- ✅ Works offline

---

## 🆘 Need Help?

If something doesn't work:

1. Check browser console for errors
2. Verify products are loaded: `console.log(products)`
3. Check TF-IDF index: `console.log(tfidfIndex)`
4. Look for red error messages in console
5. Try reloading the page

**Common fixes:**
- Clear browser cache
- Reload page
- Check if products loaded successfully
- Verify voice permissions granted
