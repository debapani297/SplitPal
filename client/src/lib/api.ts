export const fetchUserOrders = async (email: string) => {
    const raw = sessionStorage.getItem("userOrderMap");
    const userOrderMap = raw ? JSON.parse(raw) : {};

    if (!userOrderMap || !userOrderMap[email]) {
      console.warn("No session data found for:", email);
      return { orders: [] }; // return empty orders array
    }

  
    const response = await fetch(`/api/orders/${email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userOrderMap),
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch user orders");
    }
  
    return await response.json();
  };
  