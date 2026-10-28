/* ============================================================
   js/admin/messages.js — Pesan/pertanyaan dari form kontak
   Pesan disimpan di localStorage (fawnia_messages).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#message-list");
  if (!list) return;

  const KEY = "fawnia_messages";
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  };
  const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));

  const render = () => {
    const items = read();
    if (!items.length) {
      list.innerHTML = `<div class="empty-state">Belum ada pesan dari pengunjung.</div>`;
      return;
    }
    list.innerHTML = items
      .map(
        (m) => `
      <div class="table-row message-row">
        <div class="cell-main">
          <b>${FawniaUtils.esc(m.name)}</b>
          <small>${FawniaUtils.esc(m.phone)} · ${FawniaUtils.tanggal(m.createdAt)}</small>
          <p class="quote">${FawniaUtils.esc(m.message)}</p>
        </div>
        <div class="row-actions">
          <a class="mini-btn" target="_blank" rel="noopener"
             href="${FawniaUtils.waLink(m.phone, `Halo ${m.name}, terima kasih sudah menghubungi Fawnia.`)}">Balas</a>
          <button type="button" class="danger" data-delete="${FawniaUtils.esc(m.id)}">Hapus</button>
        </div>
      </div>`,
      )
      .join("");
  };

  list.addEventListener("click", (e) => {
    const del = e.target.closest("[data-delete]");
    if (del && FawniaAdmin.confirm("Hapus pesan ini?")) {
      write(read().filter((m) => String(m.id) !== del.dataset.delete));
      render();
    }
  });

  render();
});
