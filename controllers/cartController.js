import Cart from "../models/cartModel.js";
import Variant from "../models/variantModel.js";
import Product from "../models/productModel.js";

// get cart for user
export const getCart = async (req, res) => {
  const { user } = req.query; // TODO: later get user from auth middleware
  try {
    const cart = await Cart.findOne({ user });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found", data: null });
    }
    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// add to cart with variant and price tracking
export const addToCart = async (req, res) => {
  //   return res.json(req.body);
  const user = req.query.user; // TODO: later get user from auth middleware

  try {
    const { productId, variantId, quantity } = req.body;

    if (!productId || !variantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product, variant, and quantity are required",
        data: null,
      });
    }

    const variant = await Variant.findById(variantId);
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found, maybe it was deleted?",
        data: null,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    let cart = await Cart.findOne({ user });
    if (!cart) {
      cart = new Cart({ user, items: [] });
    }

    // Check if the VARIANT already exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.variant?.toString() === variantId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // return res.json(variant);

      // return res.json({
      //   product: productId,
      //   productName: product.name,
      //   variant: variantId,
      //   variantName: variant.sku,
      //   quantity,
      //   priceAtAdd: variant.price,
      // });
      cart.items.push({
        product: productId,
        productName: product.name,
        variant: variantId,
        variantName: variant.sku,
        quantity,
        priceAtAdd: variant.price,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

// remove cart item
export const removeCartItem = async (req, res) => {
  const user = req.query.user; // TODO: later get user from auth middleware

  try {
    const variantId = req.params.id;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.variant?.toString() === variantId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null,
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
    });
  }
};

// clear cart

export const clearCart = async (req, res) => {
  const user = req.query.user; // TODO: later get user from auth middleware

  try {
    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

// increment cart item quantity
export const incrementCartItem = async (req, res) => {
  const user = req.query.user; // TODO: later get user from auth middleware

  try {
    const variantId = req.params.id;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.variant?.toString() === variantId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null,
      });
    }

    // check stock availability before incrementing
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,    
        message: "Variant not found, maybe it was deleted?",
        data: null,
      });
    }
    if (cart.items[itemIndex].quantity >= variant.stock) {
      return res.status(400).json({
        success: false,
        message: "Out of stock",
        data: null,
      });
    }

    cart.items[itemIndex].quantity += 1;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart item quantity incremented successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to increment cart item quantity",
      error: error.message,
    });
  }
};

// decrement cart item quantity
export const decrementCartItem = async (req, res) => {
  const user = req.query.user; // TODO: later get user from auth middleware

  try {
    const variantId = req.params.id;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.variant?.toString() === variantId,
    );

    // If item not found in cart
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null,
      });
    }

    // Prevent quantity from going below 1
    if (cart.items[itemIndex].quantity === 1) {
      res.status(400).json({
        success: false,
        message: "Item quantity cannot be less than 1",
        data: null,
      });
    }

    // Decrement quantity and save
    cart.items[itemIndex].quantity -= 1;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart item quantity decremented successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to decrement cart item quantity",
      error: error.message,
    });
  }
};
