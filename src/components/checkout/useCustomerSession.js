// src/pages/store/checkout/hooks/useCustomerSession.js
import { useEffect, useState } from "react";
import { getCustomerSession } from "./checkoutUtils";

export default function useCustomerSession({ slug, setBuyer, setAddress }) {
  const [customerToken, setCustomerToken] = useState(null);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const sess = getCustomerSession(slug);
    setCustomerToken(sess.token);
    setCustomer(sess.customer || null);

    if (sess.customer) {
      const cst = sess.customer;
      setBuyer((p) => ({
        name: p.name || cst.name || "",
        phone: p.phone || cst.phone || "",
        email: p.email || cst.email || "",
      }));
      setAddress((p) => ({
        ...p,
        receiver_name: p.receiver_name || cst.name || "",
        receiver_phone: p.receiver_phone || cst.phone || "",
        receiver_email: p.receiver_email || cst.email || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return { customerToken, customer };
}
