const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
    
    // Check if on login page
    if (await page.$('input[type="email"]')) {
      await page.type('input[type="email"]', 'admin@qnu.edu');
      await page.type('input[type="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }

    // wait for sidebar to appear
    await page.waitForSelector('aside');

    // Click collapse button if not collapsed
    let toggleBtn = await page.$('button[aria-label="تصغير القائمة"], button[aria-label="Collapse menu"]');
    if (toggleBtn) {
      await toggleBtn.click();
      await new Promise(r => setTimeout(r, 600)); // wait for transition
    }

    const rects = await page.evaluate(() => {
      const getRect = (el, name) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return { 
          name,
          tag: el.tagName, 
          class: el.className, 
          x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, left: r.left,
          display: style.display,
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          parentWidth: el.parentElement ? el.parentElement.getBoundingClientRect().width : null
        };
      };

      const sidebar = document.querySelector('aside');
      const logoWrapperOuter = document.querySelector('aside > div:nth-child(2)');
      const logoWrapperInner = document.querySelector('aside > div:nth-child(2) > div');
      const logo = logoWrapperInner ? logoWrapperInner.children[0] : null;
      const nav = document.querySelector('aside nav');
      const navLink = nav ? nav.children[0] : null;
      const navItem = navLink ? navLink.children[0] : null;
      const footer = document.querySelector('aside > div:last-child');
      const logoutBtn = footer ? footer.children[0] : null;

      return [
        getRect(sidebar, 'sidebar'),
        getRect(logoWrapperOuter, 'logoWrapperOuter'),
        getRect(logoWrapperInner, 'logoWrapperInner'),
        getRect(logo, 'logo'),
        getRect(nav, 'nav'),
        getRect(navLink, 'navLink'),
        getRect(navItem, 'navItem'),
        getRect(footer, 'footer'),
        getRect(logoutBtn, 'logoutBtn')
      ].filter(Boolean);
    });

    console.log(JSON.stringify(rects, null, 2));
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
