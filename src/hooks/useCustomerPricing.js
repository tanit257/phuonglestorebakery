import { useState, useEffect } from 'react';
import { orderApi } from '../services/api';

/**
 * Hook to fetch and cache customer-specific pricing
 * @param {string|number} customerId - Customer ID
 * @param {number} monthsBack - Number of months to look back (default: 6)
 * @returns {Object} { priceCache, isLoading, error }
 */
export function useCustomerPricing(customerId, monthsBack = 6) {
  const [priceCache, setPriceCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setPriceCache({});
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const prices = await orderApi.getCustomerLastPrices(customerId, monthsBack);

        // Convert to map: { product_id: { price, date } }
        const cache = prices.reduce((acc, item) => {
          acc[item.product_id] = {
            lastPrice: item.last_price,
            lastSoldAt: item.last_sold_at,
          };
          return acc;
        }, {});

        setPriceCache(cache);
      } catch (err) {
        setError(err.message);
        setPriceCache({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [customerId, monthsBack]);

  return { priceCache, isLoading, error };
}
