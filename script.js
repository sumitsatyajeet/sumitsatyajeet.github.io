      const menuButton = document.querySelector(".menu-toggle");
      const navigation = document.querySelector("#primary-navigation");
      const themeButton = document.querySelector(".theme-toggle");
      const backToTopButton = document.querySelector(".back-to-top");
      const progressBar = document.querySelector(".scroll-progress span");
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
      const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter((section) => section instanceof HTMLElement);

      function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        const nextTheme = theme === "light" ? "dark" : "light";
        themeButton.setAttribute("aria-pressed", String(theme === "light"));
        themeButton.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
        themeButton.title = `Switch to ${nextTheme} mode`;
        themeColorMeta.content = theme === "light" ? "#f4f8f9" : "#0b1420";
      }

      try {
        if (localStorage.getItem("portfolio-theme") === "light") {
          applyTheme("light");
        }
      } catch (error) {
        console.warn("The saved theme preference could not be loaded.", error);
      }

      themeButton.addEventListener("click", () => {
        const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
        applyTheme(theme);
        try {
          localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
          console.warn("The theme preference could not be saved.", error);
        }
      });

      menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
        navigation.classList.toggle("is-open", !isOpen);
      });

      navigation.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
          menuButton.setAttribute("aria-expanded", "false");
          menuButton.setAttribute("aria-label", "Open navigation menu");
          navigation.classList.remove("is-open");
        }
      });

      document.querySelector("#year").textContent = String(new Date().getFullYear());

      backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      let scrollUpdatePending = false;

      function updateScrollEffects() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
        backToTopButton.classList.toggle("is-visible", window.scrollY > 500);

        const activeSection = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 140);
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${activeSection?.id}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });

        scrollUpdatePending = false;
      }

      function requestScrollUpdate() {
        if (!scrollUpdatePending) {
          scrollUpdatePending = true;
          window.requestAnimationFrame(updateScrollEffects);
        }
      }

      window.addEventListener("scroll", requestScrollUpdate, { passive: true });
      window.addEventListener("resize", requestScrollUpdate);
      updateScrollEffects();

      const revealElements = document.querySelectorAll(
        ".section-heading, .about-card, .contact-tile, .detail-card, .project-card, .timeline-card, .education-card, .certificate-card, .contact-card"
      );

      if ("IntersectionObserver" in window) {
        document.body.classList.add("interactive-ready");
        const revealObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });

        revealElements.forEach((element, index) => {
          element.dataset.reveal = "";
          element.style.transitionDelay = `${(index % 3) * 70}ms`;
          revealObserver.observe(element);
        });
      }
