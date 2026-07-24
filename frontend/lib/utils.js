export function showToast(message) {
  if (typeof window === "undefined") return;

  // Find or create toast container
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.bottom = "24px";
    container.style.right = "24px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.zIndex = "99999";
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.innerText = message;
  
  // Style toast
  toast.style.background = "#0f1115";
  toast.style.color = "#ffffff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "20px";
  toast.style.fontSize = "0.85rem";
  toast.style.fontWeight = "700";
  toast.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(10px)";
  toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // Remove toast
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }, 2500);
}
