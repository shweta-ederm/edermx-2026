/*
 * Profile photo edit (add / change / remove / view).
 * Works on any `.photo-edit` component: click the avatar to open a small
 * menu with View / Upload / Remove. Selected photos are read locally
 * (FileReader) and kept only in this browser's localStorage, keyed per
 * component - never uploaded anywhere.
 */
(function () {
  "use strict";

  function storageKey(el) {
    return "ederm.photo." + (el.getAttribute("data-photo-key") || "default");
  }

  function applyPhoto(el, dataUrl) {
    var trigger = el.querySelector(".photo-edit__trigger");
    var avatar = el.querySelector(".avatar");
    if (!trigger || !avatar) return;
    var viewItem = el.querySelector('[data-action="view"]');
    var removeItem = el.querySelector('[data-action="remove"]');
    if (dataUrl) {
      avatar.classList.add("avatar-photo");
      avatar.style.backgroundImage = "url(" + dataUrl + ")";
      avatar.textContent = "";
      if (viewItem) viewItem.hidden = false;
      if (removeItem) removeItem.hidden = false;
    } else {
      avatar.classList.remove("avatar-photo");
      avatar.style.backgroundImage = "";
      avatar.textContent = el.getAttribute("data-initials") || "";
      if (viewItem) viewItem.hidden = true;
      if (removeItem) removeItem.hidden = true;
    }
    var previewImg = el.querySelector(".photo-preview__img");
    if (previewImg) previewImg.src = dataUrl || "";
  }

  function closeMenu(el) {
    var toggle = el.querySelector(".photo-edit__toggle");
    if (toggle) toggle.checked = false;
  }

  function openPreview(el) {
    var toggle = el.querySelector(".photo-preview-toggle");
    if (toggle) toggle.checked = true;
  }

  function closePreview(el) {
    var toggle = el.querySelector(".photo-preview-toggle");
    if (toggle) toggle.checked = false;
  }

  function initOne(el) {
    var key = storageKey(el);
    var saved = null;
    try { saved = localStorage.getItem(key); } catch (e) { /* storage unavailable */ }
    applyPhoto(el, saved);

    var input = el.querySelector(".photo-edit__input");
    var viewItem = el.querySelector('[data-action="view"]');
    var uploadItem = el.querySelector('[data-action="upload"]');
    var removeItem = el.querySelector('[data-action="remove"]');

    // Clicking the avatar always opens the menu (Upload / Remove / View).
    // Only the "View photo" menu item opens the full preview.
    if (viewItem) {
      viewItem.addEventListener("click", function () {
        closeMenu(el);
        openPreview(el);
      });
    }

    if (uploadItem && input) {
      uploadItem.addEventListener("click", function () {
        input.click();
      });
    }

    if (input) {
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        closeMenu(el);
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var dataUrl = reader.result;
          applyPhoto(el, dataUrl);
          try { localStorage.setItem(key, dataUrl); } catch (e) { /* storage full/unavailable */ }
        };
        reader.readAsDataURL(file);
        input.value = "";
      });
    }

    if (removeItem) {
      removeItem.addEventListener("click", function () {
        applyPhoto(el, null);
        try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
        closeMenu(el);
      });
    }

    // Close the menu / preview on outside click / Escape.
    var scrim = el.querySelector(".photo-edit__scrim");
    if (scrim) scrim.addEventListener("click", function () { closeMenu(el); });
    var previewScrim = el.querySelector(".photo-preview__scrim");
    if (previewScrim) previewScrim.addEventListener("click", function () { closePreview(el); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { closeMenu(el); closePreview(el); }
    });
  }

  function init() {
    var nodes = document.querySelectorAll(".photo-edit");
    for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
