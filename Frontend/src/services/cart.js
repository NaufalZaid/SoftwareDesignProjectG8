const CART_KEY = "cart";

export function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(p => p.productId === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function updateQuantity(productId, qty) {
    const cart = getCart().map(item =>
        item.productId === productId
            ? { ...item, quantity: qty }
            : item
    );
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromCart(productId) {
    const cart = getCart().filter(item => item.productId !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}
