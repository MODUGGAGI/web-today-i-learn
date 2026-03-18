const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");
const tilEmpty = document.querySelector("#til-empty");
const tilDateInput = document.querySelector("#til-date");
const tilTitleInput = document.querySelector("#til-title-input");
const tilContentInput = document.querySelector("#til-content");
const floatingCards = document.querySelectorAll(".floating-card");
const revealItems = document.querySelectorAll(".reveal-item");
const galleryTriggers = document.querySelectorAll(".gallery-trigger");
const galleryLightbox = document.querySelector("#gallery-lightbox");
const galleryLightboxDialog = document.querySelector("#gallery-lightbox-dialog");
const galleryLightboxImage = document.querySelector("#gallery-lightbox-image");
const galleryLightboxCaption = document.querySelector("#gallery-lightbox-caption");
const galleryCloseButtons = document.querySelectorAll("[data-gallery-close]");
let lastGalleryTrigger = null;

function getTodayString() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  return localTime.toISOString().slice(0, 10);
}

function createTilItem(date, title, content) {
  const tilItem = document.createElement("article");
  tilItem.className = "til-item reveal-item";

  const time = document.createElement("time");
  time.dateTime = date;
  time.textContent = date;

  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  tilItem.append(time, heading, paragraph);
  return tilItem;
}

function setRevealDelays() {
  floatingCards.forEach(function (card) {
    const cardItems = card.querySelectorAll(".reveal-item");

    cardItems.forEach(function (item, index) {
      item.style.setProperty("--reveal-delay", `${Math.min(index * 90, 540)}ms`);
    });
  });
}

function toggleVisibleByRatio(entry, showThreshold, hideThreshold) {
  if (entry.intersectionRatio >= showThreshold) {
    entry.target.classList.add("is-visible");
    return;
  }

  if (entry.intersectionRatio <= hideThreshold) {
    entry.target.classList.remove("is-visible");
  }
}

function initScrollStory() {
  if (!("IntersectionObserver" in window)) {
    floatingCards.forEach(function (card) {
      card.classList.add("is-visible");
    });

    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });

    return;
  }

  const cardObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        toggleVisibleByRatio(entry, 0.2, 0.04);
      });
    },
    {
      threshold: [0, 0.04, 0.2, 1],
      rootMargin: "0px 0px -6% 0px",
    }
  );

  const itemObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  floatingCards.forEach(function (card) {
    cardObserver.observe(card);
  });

  revealItems.forEach(function (item) {
    itemObserver.observe(item);
  });
}

function openGalleryLightbox(trigger) {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) {
    return;
  }

  lastGalleryTrigger = trigger;
  galleryLightboxImage.src = trigger.dataset.gallerySrc || "";
  galleryLightboxImage.alt = trigger.dataset.galleryAlt || "";
  galleryLightboxCaption.textContent = trigger.dataset.galleryCaption || "";
  galleryLightbox.hidden = false;
  document.body.classList.add("gallery-open");

  window.requestAnimationFrame(function () {
    galleryLightbox.classList.add("is-open");

    if (galleryLightboxDialog) {
      galleryLightboxDialog.focus();
    }
  });
}

function closeGalleryLightbox() {
  if (!galleryLightbox || galleryLightbox.hidden) {
    return;
  }

  galleryLightbox.classList.remove("is-open");
  document.body.classList.remove("gallery-open");

  window.setTimeout(function () {
    galleryLightbox.hidden = true;

    if (galleryLightboxImage) {
      galleryLightboxImage.removeAttribute("src");
      galleryLightboxImage.alt = "";
    }

    if (galleryLightboxCaption) {
      galleryLightboxCaption.textContent = "";
    }

    if (lastGalleryTrigger) {
      lastGalleryTrigger.focus();
    }
  }, 180);
}

if (tilDateInput) {
  tilDateInput.value = getTodayString();
}

setRevealDelays();
initScrollStory();

if (galleryTriggers.length && galleryLightbox && galleryLightboxDialog && galleryLightboxImage && galleryLightboxCaption) {
  galleryLightboxDialog.tabIndex = -1;

  galleryTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openGalleryLightbox(trigger);
    });
  });

  galleryCloseButtons.forEach(function (button) {
    button.addEventListener("click", closeGalleryLightbox);
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeGalleryLightbox();
    }
  });
}

if (tilForm && tilList && tilDateInput && tilTitleInput && tilContentInput) {
  tilForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const date = tilDateInput.value.trim();
    const title = tilTitleInput.value.trim();
    const content = tilContentInput.value.trim();

    if (!date || !title || !content) {
      return;
    }

    if (tilEmpty) {
      tilEmpty.remove();
    }

    const newItem = createTilItem(date, title, content);
    tilList.prepend(newItem);
    newItem.style.setProperty("--reveal-delay", "0ms");

    window.requestAnimationFrame(function () {
      newItem.classList.add("is-visible");
    });

    tilForm.reset();
    tilDateInput.value = getTodayString();
    tilTitleInput.focus();
  });

  tilForm.addEventListener("reset", function () {
    window.setTimeout(function () {
      tilDateInput.value = getTodayString();
    }, 0);
  });
}
