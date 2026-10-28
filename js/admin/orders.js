/* ============================================================
   js/admin/orders.js — Kelola pesanan dari form website & WA
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#order-list");
  if (!list) return;
  const filter = document.querySelector("#order-filter");
  const search = document.querySelector("#order-search");

  filter.innerHTML =
    `<option value="">Semua status</option>` +
    FAWNIA_ORDER_STATUS.map((s) => `<option value="${s}">${s}</option>`).join(
      "",
    );

  const renderStats = () => {
    const orders = FawniaStore.getOrders();
    const box = document.querySelector("#order-stats");
    if (!box) return;
    const baru = orders.filter((o) => o.status === "Baru").length;
    const omzet = orders
      .filter((o) => o.status !== "Dibatalkan")
      .reduce((sum, o) => sum + FawniaStore.orderTotal(o), 0);
    box.innerHTML = `
      <div><span>Total Pesanan</span><strong>${orders.length}</strong></div>
      <div><span>Pesanan Baru</span><strong>${baru}</strong></div>
      <div><span>Estimasi Omzet</span><strong>${FawniaUtils.rupiah(omzet)}</strong></div>`;
  };

  const render = () => {
    const status = filter.value;
    const q = (search?.value || "").toLowerCase();
    const orders = FawniaStore.getOrders().filter((o) => {
      const matchStatus = !status || o.status === status;
      const matchSearch =
        !q ||
        `${o.id} ${o.name} ${o.phone} ${o.productName}`
          .toLowerCase()
          .includes(q);
      return matchStatus && matchSearch;
    });

    renderStats();

    if (!orders.length) {
      list.innerHTML = `<div class="empty-state">Belum ada pesanan. Pesanan dari form website akan muncul di sini.</div>`;
      return;
    }

    list.innerHTML = orders
      .map(
        (o) => `
      <article class="order-card">
        <header>
          <div>
            <b>${FawniaUtils.esc(o.id)}</b>
            <small>${FawniaUtils.tanggal(o.createdAt)}</small>
          </div>
          ${FawniaAdmin.badge(o.status)}
        </header>
        <div class="order-body">
          <div class="order-items">
            ${o.productImage ? FawniaAdmin.thumb(o.productImage, o.productName) : ""}
            <div>
              <b>${FawniaUtils.esc(o.productName)}</b>
              <small>${Number(o.qty) || 1}x · ${FawniaUtils.rupiah(o.subtotal)}</small>
            </div>
          </div>
          <dl class="order-detail">
            <div><dt>Pemesan</dt><dd>${FawniaUtils.esc(o.name || "-")}</dd></div>
            <div><dt>WhatsApp</dt><dd>${FawniaUtils.esc(o.phone || "-")}</dd></div>
            <div><dt>Pengiriman</dt><dd>${FawniaUtils.esc(FawniaStore.shippingLabel(o.shipping))}</dd></div>
            <div><dt>Pembayaran</dt><dd>${FawniaUtils.esc(FawniaStore.paymentLabel(o.payment))}</dd></div>
            <div><dt>Alamat</dt><dd>${FawniaUtils.esc(o.address || "-")}</dd></div>
            <div><dt>Catatan</dt><dd>${FawniaUtils.esc(o.note || "-")}</dd></div>
          </dl>
        </div>
        <footer class="order-foot">
          <strong>Total: ${FawniaUtils.rupiah(FawniaStore.orderTotal(o))}</strong>
          <div class="row-actions">
            <select data-status="${FawniaUtils.esc(o.id)}">
              ${FAWNIA_ORDER_STATUS.map(
                (s) =>
                  `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`,
              ).join("")}
            </select>
            <a class="mini-btn" target="_blank" rel="noopener"
               href="${FawniaUtils.waLink(o.phone, `Halo ${o.name}, terima kasih sudah memesan ${o.productName} di Fawnia. Pesanan ${o.id} sedang kami proses.`)}">Chat</a>
            <button type="button" class="danger" data-delete="${FawniaUtils.esc(o.id)}">Hapus</button>
          </div>
        </footer>
      </article>`,
      )
      .join("");
  };

  list.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-status]");
    if (!sel) return;
    FawniaStore.updateOrder(sel.dataset.status, { status: sel.value });
    FawniaUtils.toast("Status pesanan diperbarui");
    render();
  });

  list.addEventListener("click", (e) => {
    const del = e.target.closest("[data-delete]");
    if (del && FawniaAdmin.confirm("Hapus pesanan ini?")) {
      FawniaStore.deleteOrder(del.dataset.delete);
      render();
      FawniaUtils.toast("Pesanan dihapus");
    }
  });

  filter.addEventListener("change", render);
  search?.addEventListener("input", render);
  render();
});
