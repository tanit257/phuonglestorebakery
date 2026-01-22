// Smart search utilities with fuzzy matching for Vietnamese text

/**
 * Normalize Vietnamese text for comparison
 * Removes diacritics and converts to lowercase
 */
export const normalizeVietnamese = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
};

/**
 * Calculate Levenshtein distance between two strings
 */
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

/**
 * Calculate similarity score between two strings (0-1)
 */
export const calculateSimilarity = (str1, str2) => {
  const s1 = normalizeVietnamese(str1);
  const s2 = normalizeVietnamese(str2);
  
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Smart search for products with fuzzy matching
 * Returns products sorted by relevance score
 */
export const smartSearch = (searchTerm, items, searchKey = 'name') => {
  if (!searchTerm || !searchTerm.trim()) return items;
  
  const normalizedSearch = normalizeVietnamese(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 0);
  
  const scoredItems = items.map(item => {
    const itemName = normalizeVietnamese(item[searchKey]);
    const itemWords = itemName.split(/\s+/);
    let score = 0;
    let matchedWords = 0;
    
    // Exact full match (highest priority)
    if (itemName === normalizedSearch) {
      score = 100;
    }
    // Full phrase contained
    else if (itemName.includes(normalizedSearch)) {
      score = 80 + (normalizedSearch.length / itemName.length) * 15;
    }
    // Search phrase contains full item name
    else if (normalizedSearch.includes(itemName)) {
      score = 70 + (itemName.length / normalizedSearch.length) * 15;
    }
    // Word-by-word matching with position bonus
    else {
      for (const searchWord of searchWords) {
        let bestWordScore = 0;
        let foundExact = false;
        
        for (let i = 0; i < itemWords.length; i++) {
          const itemWord = itemWords[i];
          
          // Exact word match
          if (itemWord === searchWord) {
            bestWordScore = Math.max(bestWordScore, 20);
            foundExact = true;
            break;
          }
          // Word starts with search
          else if (itemWord.startsWith(searchWord) && searchWord.length >= 2) {
            bestWordScore = Math.max(bestWordScore, 15);
          }
          // Word contains search
          else if (itemWord.includes(searchWord) && searchWord.length >= 2) {
            bestWordScore = Math.max(bestWordScore, 10);
          }
          // Fuzzy match for similar words
          else {
            const similarity = calculateSimilarity(searchWord, itemWord);
            if (similarity > 0.7) {
              bestWordScore = Math.max(bestWordScore, similarity * 12);
            }
          }
        }
        
        if (bestWordScore > 0) matchedWords++;
        score += bestWordScore;
      }
      
      // Bonus for matching all search words
      if (matchedWords === searchWords.length && searchWords.length > 0) {
        score += 25;
      }
    }
    
    return { ...item, _searchScore: score };
  });
  
  // Filter items with score > 0 and sort by score descending
  return scoredItems
    .filter(item => item._searchScore > 0)
    .sort((a, b) => b._searchScore - a._searchScore);
};

/**
 * Find the best matching product from voice input
 * Uses stricter matching to avoid confusion between similar names
 */
export const findBestProductMatch = (searchText, products) => {
  const normalizedSearch = normalizeVietnamese(searchText);
  
  // Score each product
  const scoredProducts = products.map(product => {
    const productName = normalizeVietnamese(product.name);
    const productWords = productName.split(/\s+/);
    const searchWords = normalizedSearch.split(/\s+/);
    
    let score = 0;
    
    // 1. Exact name match (highest priority)
    if (productName === normalizedSearch) {
      return { product, score: 1000 };
    }
    
    // 2. Product name is exactly contained in search
    if (normalizedSearch.includes(productName)) {
      score = 500 + productName.length * 5;
    }
    // 3. Search is exactly contained in product name
    else if (productName.includes(normalizedSearch)) {
      score = 400 + normalizedSearch.length * 5;
    }
    
    // 4. Word-by-word matching with emphasis on distinguishing words
    // This handles "đường đen" vs "đường trắng" by requiring more word matches
    let matchedProductWords = 0;
    let matchedSearchWords = 0;
    
    for (const searchWord of searchWords) {
      if (searchWord.length < 2) continue;
      
      for (const prodWord of productWords) {
        if (prodWord === searchWord) {
          matchedProductWords++;
          matchedSearchWords++;
          score += 30;
          break;
        } else if (prodWord.startsWith(searchWord) || searchWord.startsWith(prodWord)) {
          if (searchWord.length >= 3 || prodWord.length >= 3) {
            matchedSearchWords++;
            score += 15;
            break;
          }
        }
      }
    }
    
    // Bonus: More words matched = better match
    // This ensures "đường đen" matches "Đường đen" better than "Đường trắng"
    const productWordMatchRatio = matchedProductWords / productWords.length;
    const searchWordMatchRatio = matchedSearchWords / Math.max(1, searchWords.filter(w => w.length >= 2).length);
    
    score += productWordMatchRatio * 50;
    score += searchWordMatchRatio * 50;
    
    // Penalty for partial matches when there are distinguishing words
    // E.g., "đường đen" should strongly prefer products with "đen" 
    const hasDistinguishingWord = searchWords.some(sw => 
      sw.length >= 2 && !['kg', 'g', 'hop', 'goi', 'cai', 'lit', 'vi', 'lo', 'tui', 'chai'].includes(sw)
    );
    
    if (hasDistinguishingWord && matchedSearchWords < searchWords.filter(w => w.length >= 2).length) {
      score *= 0.5; // Penalize if not all distinguishing words match
    }
    
    return { product, score };
  });
  
  // Sort by score and return the best match
  scoredProducts.sort((a, b) => b.score - a.score);
  
  // Only return if score is reasonably high
  if (scoredProducts.length > 0 && scoredProducts[0].score > 20) {
    return scoredProducts[0].product;
  }
  
  return null;
};
