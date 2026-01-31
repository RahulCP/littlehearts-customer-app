class StoredCartsUpdate {
    static updateCartByQuantityLeftCheck(allItems) {
      const storedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
  
      for (const id of Object.keys(storedCart)) {
        try {
          const matchedItem = allItems.find((item) => item.inventoryid === id);
  
          if (!matchedItem) {
            console.warn(`Item with ID ${id} not found in allItems`);
            delete storedCart[id];
            continue;
          }
  
          const difference = Number(matchedItem.difference) || 0;
  
          if (difference < 1) {
            delete storedCart[id];
          } else {
            storedCart[id].left = difference;
            if (storedCart[id].quantity > difference) {
              storedCart[id].quantity = difference;
            }
          }
        } catch (error) {
          console.error(`Error processing item ID ${id}:`, error.message);
        }
      }
  
      localStorage.setItem("cartItems", JSON.stringify(storedCart));
      return storedCart;
    }
  }
  
  export default StoredCartsUpdate;
  