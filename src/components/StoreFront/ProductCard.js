import React, { useMemo } from "react";
import ProductImageSingle from "./ProductImageSingle";
import "./ProductCard.css";

function money0(v) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(0) : "0";
}

const ProductCard = ({ p, onClick }) => {
  const qtyLeft = Number(p?.available_qty || 0);
  const inStock =
    !!p?.active && !!p?.in_stock && Number.isFinite(qtyLeft) && qtyLeft > 0;

  const salePercent = useMemo(() => {
    const sp = Number(p?.offer?.sale_percent || 0);
    return Number.isFinite(sp) ? sp : 0;
  }, [p]);

  const hasOffer = !!p?.offer && salePercent > 0;

  const offerText = useMemo(() => {
    if (!hasOffer) return "";
    const name = String(p?.offer?.name || "").trim();
    const badge = String(p?.offer?.badge_text || "").trim();
    const title = name || badge || "Offer";
    return `${title} · ${money0(salePercent)}%`;
  }, [hasOffer, p, salePercent]);

  const showStrike = useMemo(() => {
    const strike = Number(p?.strike_price);
    const sell = Number(p?.selling_price);
    return (
      Number.isFinite(strike) &&
      strike > 0 &&
      Number.isFinite(sell) &&
      sell > 0 &&
      strike > sell
    );
  }, [p]);

  return (
    <div className="pcCard" onClick={onClick} role="button" tabIndex={0}>
      <div className="pcMedia">
        <ProductImageSingle image={p?.image} alt={p?.label} />

        {/* Like Shopify: "Sale" left, "Sold out" right */}
        {hasOffer && inStock && <div className="pcTag pcTagSale">Sale</div>}
        {!inStock && <div className="pcTag pcTagSold">Sold out</div>}
      </div>

      <div className="pcBody">
        {/* Product Name */}
        <div className="pcName" title={p?.label}>
          {p?.label || "Product"}
        </div>

        {/* Offer line (name + %) */}
        {hasOffer ? <div className="pcOffer">{offerText}</div> : null}

        {/* Price line: strike first then selling */}
        <div className="pcPriceRow">
          {showStrike ? (
            <span className="pcStrike">₹{money0(p?.strike_price)}</span>
          ) : null}
          <span className="pcPrice">₹{money0(p?.selling_price)}</span>
        </div>

        {/* Qty left */}
        <div className="pcQty">
          {inStock ? (
            <>
              <strong>{qtyLeft}</strong> left
            </>
          ) : (
            "Out of stock"
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
