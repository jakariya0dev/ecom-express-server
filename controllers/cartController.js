import Cart from "../models/cartModel.js";
import Variant from "../models/variantModel.js";

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
    let cart = await Cart.findOne({ user });
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found, maybe it was deleted?",
        data: null,
      });
    }
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
      cart.items.push({
        product: productId,
        variant: variantId,
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
    const  variantId  = req.params.id;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res
        .status(404)
        .json({ 
            success: false, 
            message: "Cart not found", 
            data: null 
        });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.variant?.toString() === variantId,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to remove cart item",
      });
  }
};
