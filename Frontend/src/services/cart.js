const CART_KEY = "cart";

export function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product) {
    const cart = getCart();

    const existing = cart.find(
        item => item.productId === product.id   //  FIX HERE
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: product.id,              //  FIX HERE
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart(cart);
    alert(`"${product.name}" added to cart`);
}

export function updateQuantity(productId, quantity) {
    const cart = getCart().map(item =>
        item.productId === productId
            ? { ...item, quantity }
            : item
    );

    saveCart(cart);
}

export function removeFromCart(productId) {
    const cart = getCart().filter(
        item => item.productId !== productId
    );

    saveCart(cart);
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}
