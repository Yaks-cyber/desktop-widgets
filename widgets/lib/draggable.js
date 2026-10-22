// 让 Übersicht 组件能在桌面上拖动：按住拖，松手后位置存进 localStorage，重启后还在
// 用法：在组件 render 的根元素上加 ref={draggable("组件名")}
export const draggable = (id) => (el) => {
  if (!el) return;
  const box = el.parentElement; // Übersicht 包在外层、带 className 定位的容器
  if (!box || box.dataset.drag) return;
  box.dataset.drag = "1";

  try {
    const p = JSON.parse(localStorage.getItem("pos:" + id));
    if (p) { box.style.left = p.left + "px"; box.style.top = p.top + "px"; }
  } catch (e) {}

  box.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY, ox = box.offsetLeft, oy = box.offsetTop;
    let moved = false;

    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return; // 小于 4px 当作点击
      moved = true;
      box.style.left = ox + dx + "px";
      box.style.top = oy + dy + "px";
      box.style.cursor = "grabbing";
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      box.style.cursor = "";
      if (!moved) return;
      try {
        localStorage.setItem("pos:" + id, JSON.stringify({ left: box.offsetLeft, top: box.offsetTop }));
      } catch (e) {}
      // 拖完松手会触发一次 click，吞掉它，免得误开 app
      window.addEventListener("click", (ev) => { ev.stopPropagation(); ev.preventDefault(); },
        { capture: true, once: true });
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  });
};
