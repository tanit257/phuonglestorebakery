// Voice command processor using keyword matching
// No external API needed - works offline!

// Normalize Vietnamese text for matching
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
};

// Calculate similarity score between two strings using multiple algorithms
const calculateMatchScore = (searchText, itemText) => {
  const search = normalizeText(searchText);
  const item = normalizeText(itemText);

  // Exact match - highest score
  if (search === item) return 1.0;

  // Calculate Levenshtein distance for typo tolerance
  const levenshteinSimilarity = 1 - (levenshteinDistance(search, item) / Math.max(search.length, item.length));

  // Check if search is contained in item or vice versa
  const containsScore = item.includes(search) ? 0.9 : search.includes(item) ? 0.85 : 0;

  // Word-level matching - ENHANCED for Vietnamese
  const searchWords = search.split(' ').filter(w => w.length > 1);
  const itemWords = item.split(' ').filter(w => w.length > 1);

  // Keep original text for contradiction checking (preserve Vietnamese tones)
  const searchWordsOriginal = searchText.toLowerCase().split(' ').filter(w => w.length > 1);
  const itemWordsOriginal = itemText.toLowerCase().split(' ').filter(w => w.length > 1);

  let wordMatchScore = 0;
  let penaltyScore = 0;

  if (searchWords.length > 0 && itemWords.length > 0) {
    let exactMatches = 0;
    let partialMatches = 0;

    searchWords.forEach(sw => {
      itemWords.forEach(iw => {
        // Exact word match (highest priority)
        if (sw === iw) {
          exactMatches++;
        }
        // Word contains or is contained (lower priority)
        else if (sw.length > 2 && iw.length > 2 && (sw.includes(iw) || iw.includes(sw))) {
          partialMatches += 0.5;
        }
      });
    });

    // Calculate word match score with emphasis on exact matches
    wordMatchScore = (exactMatches * 1.0 + partialMatches * 0.5) / searchWords.length;

    // IMPORTANT: Penalty for contradictory keywords (Vietnamese specific)
    // Use ORIGINAL text (with tones) to detect contradictions accurately
    const contradictions = [
      ['đen', 'trắng'],   // black vs white (with Vietnamese tones!)
      ['đỏ', 'xanh'],     // red vs blue
      ['nhỏ', 'lớn'],     // small vs big
      ['ngọt', 'chát'],   // sweet vs bitter
      ['nóng', 'lạnh'],   // hot vs cold
      ['tươi', 'khô'],    // fresh vs dry
      ['mặn', 'lạt'],     // salty vs bland
    ];

    for (const [word1, word2] of contradictions) {
      const hasWord1InSearch = searchWordsOriginal.some(w => w.includes(word1));
      const hasWord2InSearch = searchWordsOriginal.some(w => w.includes(word2));
      const hasWord1InItem = itemWordsOriginal.some(w => w.includes(word1));
      const hasWord2InItem = itemWordsOriginal.some(w => w.includes(word2));

      // If search mentions one but item has the opposite, apply penalty
      if ((hasWord1InSearch && hasWord2InItem) || (hasWord2InSearch && hasWord1InItem)) {
        penaltyScore = -0.8; // VERY HEAVY penalty for contradictory terms
        break; // Exit early - one contradiction is enough
      }
    }
  }

  // Starting characters match (important for Vietnamese)
  const startsWithScore = item.startsWith(search) ? 0.95 : search.startsWith(item) ? 0.9 : 0;

  // Return the highest score from all methods, applying penalty if exists
  const baseScore = Math.max(levenshteinSimilarity, containsScore, wordMatchScore, startsWithScore);
  return Math.max(0, baseScore + penaltyScore); // Ensure score doesn't go negative
};

// Find best matching item from list with improved algorithm
const findBestMatch = (searchText, items, nameKey = 'name', minScore = 0.6) => {
  if (!searchText || !items || items.length === 0) return null;

  // Calculate scores for all items
  const scoredItems = items.map(item => ({
    item,
    score: calculateMatchScore(searchText, item[nameKey])
  }));

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  // Return best match if score is above threshold
  const best = scoredItems[0];

  // Debug logging
  console.log('Search:', searchText);
  console.log('Top 3 matches:', scoredItems.slice(0, 3).map(s => ({
    name: s.item[nameKey],
    score: (s.score * 100).toFixed(1) + '%'
  })));

  return best.score >= minScore ? best.item : null;
};

// Parse quantity from text
const parseQuantity = (text) => {
  // Match patterns like "5kg", "5 kg", "5", "năm"
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(kg|g|hộp|gói|chai|lít|vỉ|lọ|cái|túi)?/gi,
    /(\d+(?:[.,]\d+)?)/g,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[0].replace(',', '.'));
      if (!isNaN(num) && num > 0) return num;
    }
  }
  
  // Vietnamese number words
  const numberWords = {
    'một': 1, 'mot': 1,
    'hai': 2,
    'ba': 3,
    'bốn': 4, 'bon': 4,
    'năm': 5, 'nam': 5,
    'sáu': 6, 'sau': 6,
    'bảy': 7, 'bay': 7,
    'tám': 8, 'tam': 8,
    'chín': 9, 'chin': 9,
    'mười': 10, 'muoi': 10,
  };
  
  const normalizedText = normalizeText(text);
  for (const [word, num] of Object.entries(numberWords)) {
    if (normalizedText.includes(word)) return num;
  }
  
  return 1; // Default to 1
};

// Parse items from order text
const parseOrderItems = (text, products) => {
  const items = [];

  // First, remove common command words and customer references
  let cleanText = text
    // Remove leading command words
    .replace(/^(tạo đơn|tao don|đơn hàng|don hang|thêm|them|bỏ vào|bo vao|cho vào|cho vao)\s*/i, '')
    // Remove customer reference patterns (more specific)
    .replace(/(cho|của|cua)\s+(anh|chị|em|cô|chú|bác|tiệm|tiem)\s+[^\s,và]+/gi, '')
    .replace(/(khách|khach)\s+(hàng|hang)?\s*(anh|chị|em|cô|chú|bác)?\s+[^\s,và]+/gi, '')
    .trim();

  console.log('After removing commands/customer, cleanText:', cleanText);

  // Split by common separators (comma, "và", "với") OR by quantity patterns
  // This regex splits when it finds a number followed by units (kg, g, etc) and then another number
  // E.g., "3 kg đường đen 2 kg gà" -> ["3 kg đường đen", "2 kg gà"]
  let parts = cleanText.split(/\s*[,]\s*|\s+và\s+|\s+với\s+/i).map(s => s.trim()).filter(Boolean);

  // If we got only one part, try splitting by quantity patterns
  if (parts.length === 1) {
    // Split before each number+unit pattern (lookahead)
    const quantityParts = cleanText.split(/(?=\d+(?:[.,]\d+)?\s*(?:kg|g|hộp|gói|chai|lít|vỉ|lọ|cái|túi))/i).map(s => s.trim()).filter(Boolean);
    if (quantityParts.length > 1) {
      parts = quantityParts;
      console.log('Split by quantity pattern into:', parts);
    }
  }

  console.log('Parsing order items from parts:', parts);

  for (const part of parts) {
    console.log(`\n--- Processing part: "${part}" ---`);

    // Extract quantity from this part
    const quantity = parseQuantity(part);
    console.log(`Extracted quantity: ${quantity}`);

    // Remove quantity-related words to get cleaner product name
    const productText = part
      .replace(/\d+(?:[.,]\d+)?/g, '') // Remove numbers
      .replace(/\s*(kg|g|hộp|gói|chai|lít|vỉ|lọ|cái|túi)\s*/gi, '') // Remove units
      .replace(/\s*(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s*/gi, '') // Remove number words
      .trim();

    console.log(`Cleaned product text: "${productText}"`);

    if (!productText || productText.length < 2) {
      console.log('Product text too short, skipping...');
      continue;
    }

    // Use improved fuzzy matching to find the best product
    const product = findBestMatch(productText, products, 'name', 0.5);

    if (product) {
      console.log(`✓ MATCHED: "${productText}" -> "${product.name}" (qty: ${quantity})`);
      items.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        subtotal: quantity * product.price,
      });
    } else {
      console.log(`✗ NO MATCH found for "${productText}"`);
    }
  }

  return items;
};

// Main command processor
export const processVoiceCommand = (transcript, products, customers) => {
  const text = transcript.toLowerCase().trim();
  const normalizedText = normalizeText(text);
  
  // ============ ADD TO CART (priority for "thêm" commands) ============
  const addKeywords = ['thêm', 'them', 'bỏ vào', 'bo vao', 'cho vào', 'cho vao', 'thêm vào', 'them vao'];
  const isAddToCart = addKeywords.some(kw => normalizedText.startsWith(normalizeText(kw)));
  
  // Check if it's just "add to cart" without creating new order
  const createOrderKeywords = ['tạo đơn', 'tao don', 'đơn hàng', 'don hang', 'đặt hàng', 'dat hang'];
  const hasCreateOrderKeyword = createOrderKeywords.some(kw => normalizedText.includes(normalizeText(kw)));
  
  if (isAddToCart && !hasCreateOrderKeyword) {
    const items = parseOrderItems(text, products);
    
    if (items.length > 0) {
      return {
        action: 'add_to_cart',
        data: { items },
        message: `Thêm ${items.map(i => `${i.quantity} ${i.product_name}`).join(', ')} vào giỏ hàng`,
      };
    }
    
    // If no items found, try to find product by remaining text
    const searchText = text.replace(/^(thêm|them|bỏ vào|bo vao|cho vào|cho vao)\s*/i, '').trim();
    const quantity = parseQuantity(searchText);
    const product = findBestMatch(searchText, products);
    
    if (product) {
      return {
        action: 'add_to_cart',
        data: {
          items: [{
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: product.price,
            subtotal: quantity * product.price,
          }]
        },
        message: `Thêm ${quantity} ${product.name} vào giỏ hàng`,
      };
    }
    
    return {
      action: 'add_to_cart',
      data: { items: [] },
      message: 'Không tìm thấy sản phẩm. Hãy nói rõ tên sản phẩm.',
    };
  }

  // ============ CREATE ORDER ============
  const isCreateOrder = createOrderKeywords.some(kw => normalizedText.includes(normalizeText(kw))) ||
    ['mua', 'bán', 'ban', 'đặt', 'dat'].some(kw => normalizedText.includes(kw));
  
  if (isCreateOrder) {
    // Find customer
    let customer = null;
    const forKeywords = ['cho', 'của', 'cua', 'tiệm', 'tiem', 'khách', 'khach'];
    
    for (const kw of forKeywords) {
      const kwIndex = normalizedText.indexOf(kw);
      if (kwIndex !== -1) {
        // Get text after keyword
        const afterKeyword = text.substring(kwIndex + kw.length + 1);
        customer = findBestMatch(afterKeyword.split(',')[0], customers);
        if (customer) break;
      }
    }
    
    // If no keyword found, try to match customer name directly
    if (!customer) {
      for (const c of customers) {
        if (normalizedText.includes(normalizeText(c.name))) {
          customer = c;
          break;
        }
      }
    }
    
    // Parse items
    const items = parseOrderItems(text, products);
    
    return {
      action: 'create_order',
      data: {
        customer_id: customer?.id || null,
        customer_name: customer?.name || null,
        items,
      },
      message: customer 
        ? `Tạo đơn cho ${customer.name} với ${items.length} sản phẩm`
        : items.length > 0 
          ? `Tìm thấy ${items.length} sản phẩm. Vui lòng chọn khách hàng.`
          : 'Vui lòng nói rõ tên khách hàng và sản phẩm.',
    };
  }
  
  // ============ VIEW DEBT ============
  const debtKeywords = ['công nợ', 'cong no', 'nợ', 'no', 'tiền', 'tien', 'chưa thanh toán', 'chua thanh toan'];
  const isViewDebt = debtKeywords.some(kw => normalizedText.includes(normalizeText(kw)));
  
  if (isViewDebt) {
    // Find customer
    let customer = null;
    for (const c of customers) {
      if (normalizedText.includes(normalizeText(c.name))) {
        customer = c;
        break;
      }
    }
    
    // Parse time period
    let period = 'all';
    let month = null;
    let year = new Date().getFullYear();
    
    const monthMatch = text.match(/tháng\s*(\d{1,2})/i);
    if (monthMatch) {
      month = parseInt(monthMatch[1]);
      period = 'month';
    }
    
    const yearMatch = text.match(/năm\s*(\d{4})/i);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
      period = month ? 'month' : 'year';
    }
    
    return {
      action: 'view_debt',
      data: {
        customer_id: customer?.id || null,
        customer_name: customer?.name || null,
        period,
        month,
        year,
      },
      message: customer 
        ? `Xem công nợ của ${customer.name}${month ? ` tháng ${month}` : ''}${year !== new Date().getFullYear() ? ` năm ${year}` : ''}`
        : 'Xem tổng công nợ tất cả khách hàng',
    };
  }
  
  // ============ VIEW REPORT ============
  const reportKeywords = ['báo cáo', 'bao cao', 'doanh thu', 'doanh so', 'thống kê', 'thong ke'];
  const isViewReport = reportKeywords.some(kw => normalizedText.includes(normalizeText(kw)));
  
  if (isViewReport) {
    let type = 'today';
    if (normalizedText.includes('tuần') || normalizedText.includes('tuan')) type = 'week';
    if (normalizedText.includes('tháng') || normalizedText.includes('thang')) type = 'month';
    
    return {
      action: 'view_report',
      data: { type },
      message: `Xem báo cáo ${type === 'today' ? 'hôm nay' : type === 'week' ? 'tuần này' : 'tháng này'}`,
    };
  }
  
  // ============ SEARCH PRODUCT ============
  const productKeywords = ['sản phẩm', 'san pham', 'hàng', 'hang', 'giá', 'gia'];
  const isSearchProduct = productKeywords.some(kw => normalizedText.includes(normalizeText(kw)));
  
  if (isSearchProduct) {
    const product = findBestMatch(text, products);
    return {
      action: 'search_product',
      data: {
        product_id: product?.id || null,
        product_name: product?.name || null,
        search_term: text,
      },
      message: product 
        ? `Tìm thấy: ${product.name} - ${product.price.toLocaleString('vi-VN')}đ/${product.unit}`
        : 'Không tìm thấy sản phẩm',
    };
  }
  
  // ============ SEARCH CUSTOMER ============
  const customerKeywords = ['khách hàng', 'khach hang', 'tiệm', 'tiem'];
  const isSearchCustomer = customerKeywords.some(kw => normalizedText.includes(normalizeText(kw)));
  
  if (isSearchCustomer) {
    const customer = findBestMatch(text, customers);
    return {
      action: 'search_customer',
      data: {
        customer_id: customer?.id || null,
        customer_name: customer?.name || null,
        search_term: text,
      },
      message: customer 
        ? `Tìm thấy: ${customer.name} - ${customer.phone}`
        : 'Không tìm thấy khách hàng',
    };
  }
  
  // ============ UNKNOWN ============
  return {
    action: 'unknown',
    data: null,
    message: 'Xin lỗi, tôi không hiểu. Hãy thử nói: "Tạo đơn cho tiệm ABC, 5kg bột mì" hoặc "Xem công nợ"',
  };
};

// Enhanced Voice recognition with AI improvements
export const createSpeechRecognition = (onTranscriptUpdate) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Enhanced configuration for better accuracy
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'vi-VN';
  recognition.maxAlternatives = 5; // Get multiple alternatives for better accuracy

  // Real-time transcript updates
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    let maxConfidence = 0;
    let bestAlternative = null;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];

      if (result.isFinal) {
        // Analyze all alternatives and pick the best one
        const alternatives = Array.from(result).map((alt, idx) => ({
          transcript: alt.transcript,
          confidence: alt.confidence,
          index: idx
        }));

        // Sort by confidence
        alternatives.sort((a, b) => b.confidence - a.confidence);
        bestAlternative = alternatives[0];

        finalTranscript += bestAlternative.transcript;
        maxConfidence = bestAlternative.confidence;

        // Send update with all alternatives for user review
        if (onTranscriptUpdate) {
          onTranscriptUpdate({
            transcript: finalTranscript,
            isFinal: true,
            confidence: maxConfidence,
            alternatives: alternatives.slice(0, 3), // Top 3 alternatives
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Interim results
        interimTranscript += result[0].transcript;
        if (onTranscriptUpdate) {
          onTranscriptUpdate({
            transcript: interimTranscript,
            isFinal: false,
            confidence: result[0].confidence,
            alternatives: [],
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onTranscriptUpdate) {
      onTranscriptUpdate({
        error: event.error,
        message: getErrorMessage(event.error),
        timestamp: new Date().toISOString()
      });
    }
  };

  recognition.onend = () => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate({
        ended: true,
        timestamp: new Date().toISOString()
      });
    }
  };

  return recognition;
};

// Get user-friendly error messages
const getErrorMessage = (error) => {
  const messages = {
    'no-speech': 'Không nghe thấy giọng nói. Vui lòng thử lại.',
    'audio-capture': 'Không thể truy cập microphone. Vui lòng kiểm tra quyền.',
    'not-allowed': 'Quyền truy cập microphone bị từ chối.',
    'network': 'Lỗi kết nối mạng.',
    'aborted': 'Đã hủy nhận diện giọng nói.',
    'service-not-allowed': 'Dịch vụ nhận diện giọng nói không khả dụng.',
  };
  return messages[error] || 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

// Enhanced command processor with confidence threshold
export const processVoiceCommandWithConfidence = (
  transcript,
  confidence,
  products,
  customers,
  minConfidence = 0.7
) => {
  // Check confidence threshold
  if (confidence < minConfidence) {
    return {
      action: 'low_confidence',
      data: { transcript, confidence },
      message: `Độ tin cậy thấp (${(confidence * 100).toFixed(0)}%). Vui lòng nói rõ hơn hoặc kiểm tra lại.`,
      requireConfirmation: true,
    };
  }

  // Process with existing logic
  return processVoiceCommand(transcript, products, customers);
};

// Smart transcript correction using context
export const suggestCorrections = (transcript, products, customers) => {
  const suggestions = [];
  const normalizedText = normalizeText(transcript);

  // Find similar product names
  products.forEach(product => {
    const productName = normalizeText(product.name);
    const similarity = calculateSimilarity(normalizedText, productName);
    if (similarity > 0.6) {
      suggestions.push({
        type: 'product',
        original: transcript,
        suggested: product.name,
        similarity,
        context: `Có phải bạn muốn nói "${product.name}"?`
      });
    }
  });

  // Find similar customer names
  customers.forEach(customer => {
    const customerName = normalizeText(customer.name);
    const similarity = calculateSimilarity(normalizedText, customerName);
    if (similarity > 0.6) {
      suggestions.push({
        type: 'customer',
        original: transcript,
        suggested: customer.name,
        similarity,
        context: `Có phải khách hàng "${customer.name}"?`
      });
    }
  });

  return suggestions.sort((a, b) => b.similarity - a.similarity);
};

// Calculate text similarity (Levenshtein distance based)
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};
