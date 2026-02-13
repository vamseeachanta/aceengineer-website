/**
 * @jest-environment jsdom
 */

describe('navbar-toggle', () => {
  let toggleBtn;
  let navTarget;

  function setupDOM() {
    document.body.innerHTML = `
      <button data-toggle="collapse" data-target="#navbar-collapse"
              aria-expanded="false">
        Toggle
      </button>
      <div id="navbar-collapse" class="collapse">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </div>
    `;
    toggleBtn = document.querySelector('[data-toggle="collapse"]');
    navTarget = document.querySelector('#navbar-collapse');
  }

  function loadScript() {
    // Clear module cache so each test gets a fresh execution
    const scriptPath = require.resolve('../../assets/js/navbar-toggle.js');
    delete require.cache[scriptPath];

    // The script listens for DOMContentLoaded; since jsdom has already
    // fired that event, we dispatch it manually after requiring the script.
    require('../../assets/js/navbar-toggle.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    loadScript();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('click on toggle button starts expand animation', () => {
    // Initial state: collapsed (no "in" class)
    expect(navTarget.classList.contains('in')).toBe(false);

    toggleBtn.click();

    // During animation: collapsing class is added
    expect(navTarget.classList.contains('collapsing')).toBe(true);
    expect(navTarget.classList.contains('collapse')).toBe(false);
  });

  test('expand completes after 350ms timeout', () => {
    toggleBtn.click();

    // Advance past the 350ms animation
    jest.advanceTimersByTime(350);

    expect(navTarget.classList.contains('collapsing')).toBe(false);
    expect(navTarget.classList.contains('collapse')).toBe(true);
    expect(navTarget.classList.contains('in')).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
  });

  test('second click collapses an open navbar', () => {
    // First click: expand
    toggleBtn.click();
    jest.advanceTimersByTime(350);

    // Verify expanded state
    expect(navTarget.classList.contains('in')).toBe(true);

    // Second click: collapse
    toggleBtn.click();

    // During collapse animation
    expect(navTarget.classList.contains('collapsing')).toBe(true);
    expect(navTarget.classList.contains('in')).toBe(false);

    // After animation completes
    jest.advanceTimersByTime(350);

    expect(navTarget.classList.contains('collapsing')).toBe(false);
    expect(navTarget.classList.contains('collapse')).toBe(true);
    expect(navTarget.classList.contains('in')).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
  });

  test('full expand-collapse cycle restores original state', () => {
    const originalClasses = navTarget.className;

    // Expand
    toggleBtn.click();
    jest.advanceTimersByTime(350);

    // Collapse
    toggleBtn.click();
    jest.advanceTimersByTime(350);

    expect(navTarget.className).toBe(originalClasses);
  });

  test('height is set during expand animation', () => {
    toggleBtn.click();

    // During expand, height should be set to scrollHeight
    expect(navTarget.style.height).toBeDefined();
  });

  test('height is cleared after expand completes', () => {
    toggleBtn.click();
    jest.advanceTimersByTime(350);

    expect(navTarget.style.height).toBe('');
  });

  test('height is cleared after collapse completes', () => {
    // Expand first
    toggleBtn.click();
    jest.advanceTimersByTime(350);

    // Collapse
    toggleBtn.click();
    jest.advanceTimersByTime(350);

    expect(navTarget.style.height).toBe('');
  });

  test('does not throw when toggle button is missing', () => {
    document.body.innerHTML = '<div id="content">No toggle here</div>';

    // Re-load script with no toggle button present
    expect(() => {
      const scriptPath = require.resolve('../../assets/js/navbar-toggle.js');
      delete require.cache[scriptPath];
      require('../../assets/js/navbar-toggle.js');
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();
  });

  test('does not throw when target element is missing', () => {
    document.body.innerHTML = `
      <button data-toggle="collapse" data-target="#nonexistent">Toggle</button>
    `;

    expect(() => {
      const scriptPath = require.resolve('../../assets/js/navbar-toggle.js');
      delete require.cache[scriptPath];
      require('../../assets/js/navbar-toggle.js');
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();
  });
});
