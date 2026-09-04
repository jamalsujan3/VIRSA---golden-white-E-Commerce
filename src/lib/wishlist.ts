import { useEffect, useState } from 'react';

const WISHLIST_KEY = 'virsa_wishlist';

export function getWishlist(): string[] {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load wishlist:', e);
    return [];
  }
}

export function saveWishlist(ids: string[]): void {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    // Dispatch event to update other components dynamically
    window.dispatchEvent(new Event('virsa_wishlist_updated'));
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
}

export function toggleWishlistItem(id: string): boolean {
  const current = getWishlist();
  const exists = current.includes(id);
  let updated: string[];
  if (exists) {
    updated = current.filter((item) => item !== id);
  } else {
    updated = [...current, id];
  }
  saveWishlist(updated);
  return !exists; // Returns whether it is now added (true) or removed (false)
}

export function isProductWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}

// Custom React hook to synchronize wishlist state across any component
export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());

    const handleUpdate = () => {
      setWishlist(getWishlist());
    };

    window.addEventListener('virsa_wishlist_updated', handleUpdate);
    return () => {
      window.removeEventListener('virsa_wishlist_updated', handleUpdate);
    };
  }, []);

  const toggle = (id: string) => {
    return toggleWishlistItem(id);
  };

  const has = (id: string) => {
    return wishlist.includes(id);
  };

  return { wishlist, toggle, has };
}
