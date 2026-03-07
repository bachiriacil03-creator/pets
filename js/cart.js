/**
 * Pet's Corner - Cart Management
 * Handles all shopping cart operations using localStorage
 */

const Cart = (() => {
  const CART_KEY = 'petscorner_cart';

  /** Get cart from localStorage */
  const get = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  };

  /** Save cart to localStorage */
  const save = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  };

  /** Add item to cart or increase quantity */
  const add = (product) => {
    const cart = get();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx > -1) {
      cart[idx].qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.promotion_price || product.price,
        qty: 1
      });
    }
    save(cart);
    return true;
  };

  /** Remove item from cart */
  const remove = (productId) => {
    const cart = get().filter(i => i.id !== productId);
    save(cart);
  };

  /** Update item quantity */
  const updateQty = (productId, qty) => {
    const cart = get();
    const idx = cart.findIndex(i => i.id === productId);
    if (idx > -1) {
      if (qty <= 0) {
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = qty;
      }
    }
    save(cart);
  };

  /** Clear entire cart */
  const clear = () => {
    localStorage.removeItem(CART_KEY);
    updateCartUI();
  };

  /** Get total item count */
  const count = () => {
    return get().reduce((sum, i) => sum + i.qty, 0);
  };

  /** Get subtotal */
  const subtotal = () => {
    return get().reduce((sum, i) => sum + (i.price * i.qty), 0);
  };

  /** Check if product is in cart */
  const has = (productId) => {
    return get().some(i => i.id === productId);
  };

  /** Update cart count badge in navbar */
  const updateCartUI = () => {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const total = count();
    badge.textContent = total;
    if (total > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  };

  return { get, add, remove, updateQty, clear, count, subtotal, has, updateCartUI };
})();

window.Cart = Cart;
