import React from 'react';

// =============================================
// 1. TOAST NOTIFICATION SYSTEM
// Lightweight, no-dependency toast notifications
// =============================================

const TOAST_CONTAINER_ID = 'gcas-toast-container';

const ensureContainer = () => {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 10000;
      display: flex;
      flex-direction: column-reverse;
      gap: 0.6rem;
      pointer-events: none;
      max-width: 360px;
    `;
    document.body.appendChild(container);
  }
  return container;
};

const createToastElement = (message, type = 'success') => {
  const colors = {
    success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: '✓' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#dc2626', icon: '✕' },
    warning: { bg: '#fef9c3', border: '#eab308', text: '#a16207', icon: '⚠' },
    loading: { bg: '#f0f9ff', border: '#3b82f6', text: '#1d4ed8', icon: '⟳' },
  };
  const c = colors[type] || colors.success;

  const el = document.createElement('div');
  el.style.cssText = `
    background: ${c.bg};
    border: 1.5px solid ${c.border};
    color: ${c.text};
    padding: 0.8rem 1.2rem;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'Inter', 'Outfit', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    pointer-events: auto;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transform: translateX(120%);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
    opacity: 0;
  `;

  const iconSpan = document.createElement('span');
  iconSpan.textContent = c.icon;
  iconSpan.style.cssText = `font-size: 1.1rem; flex-shrink: 0;${type === 'loading' ? ' animation: toast-spin 1s linear infinite;' : ''}`;
  el.appendChild(iconSpan);

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  el.appendChild(textSpan);

  return el;
};

const injectToastStyles = (() => {
  let injected = false;
  return () => {
    if (injected) return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toast-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes toast-slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes toast-slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

const showToast = (message, type, durationMs) => {
  injectToastStyles();
  const container = ensureContainer();
  const el = createToastElement(message, type);
  container.appendChild(el);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    el.style.transform = 'translateX(0)';
    el.style.opacity = '1';
  });

  const dismiss = () => {
    el.style.transform = 'translateX(120%)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  };

  if (durationMs > 0) {
    setTimeout(dismiss, durationMs);
  }

  return dismiss;
};

export const toast = {
  success: (msg) => showToast(msg, 'success', 3000),
  error: (msg) => showToast(msg, 'error', 5000),
  warning: (msg) => showToast(msg, 'warning', 4000),
  loading: (msg) => showToast(msg, 'loading', 0), // returns dismiss fn
};


// =============================================
// 2. OPTIMISTIC UI HELPER
// Instant UI update with rollback on failure
// =============================================

/**
 * Optimistically updates state, performs server call, rolls back on failure.
 * @param {Function} setState - React setState function
 * @param {*} currentState - Current state value (for rollback snapshot)
 * @param {*} optimisticState - New state to show immediately
 * @param {Function} serverCall - Async function that performs the actual API call
 * @param {Object} messages - { success, error } toast messages
 * @returns {Promise<boolean>} - true if succeeded, false if rolled back
 */
export const optimistic = async (setState, currentState, optimisticState, serverCall, messages = {}) => {
  const snapshot = Array.isArray(currentState) ? [...currentState] : { ...currentState };
  setState(optimisticState);

  try {
    const result = await serverCall();
    if (result === null || result === false) {
      throw new Error('Server returned failure');
    }
    if (messages.success) toast.success(messages.success);
    return true;
  } catch (err) {
    setState(snapshot);
    toast.error(messages.error || 'Something went wrong. Reverted.');
    console.error('Optimistic update failed:', err);
    return false;
  }
};


// =============================================
// 3. SKELETON LOADING COMPONENTS
// Animated shimmer placeholders
// =============================================

const skeletonCSS = `
.gcas-skeleton {
  background: linear-gradient(90deg, var(--bg-primary, #f5f5f5) 25%, var(--border-color, #e5e5e5) 50%, var(--bg-primary, #f5f5f5) 75%);
  background-size: 200% 100%;
  animation: gcas-shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}
.gcas-skeleton-circle {
  background: linear-gradient(90deg, var(--bg-primary, #f5f5f5) 25%, var(--border-color, #e5e5e5) 50%, var(--bg-primary, #f5f5f5) 75%);
  background-size: 200% 100%;
  animation: gcas-shimmer 1.5s ease-in-out infinite;
  border-radius: 50%;
}
@keyframes gcas-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// Inject skeleton CSS once
const injectSkeletonCSS = (() => {
  let injected = false;
  return () => {
    if (injected) return;
    const style = document.createElement('style');
    style.textContent = skeletonCSS;
    document.head.appendChild(style);
    injected = true;
  };
})();

const Bone = ({ width = '100%', height = '16px', style = {}, circle = false }) => {
  injectSkeletonCSS();
  return React.createElement('div', {
    className: circle ? 'gcas-skeleton-circle' : 'gcas-skeleton',
    style: { width, height, ...style }
  });
};

export const ScheduleCardSkeleton = ({ count = 4 }) => {
  return React.createElement('div', { className: 'schedule-grid' },
    Array.from({ length: count }).map((_, i) =>
      React.createElement('div', {
        key: i,
        className: 'schedule-card',
        style: { padding: '1.5rem' }
      },
        React.createElement(Bone, { width: '50%', height: '20px', style: { marginBottom: '0.5rem' } }),
        React.createElement(Bone, { width: '70%', height: '14px', style: { marginBottom: '1.5rem' } }),
        React.createElement(Bone, { width: '100%', height: '8px', style: { marginTop: '2rem' } })
      )
    )
  );
};

export const RequestCardSkeleton = ({ count = 3 }) => {
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
    Array.from({ length: count }).map((_, i) =>
      React.createElement('div', {
        key: i,
        className: 'request-card',
        style: { display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.2rem 1.5rem' }
      },
        React.createElement(Bone, { width: '50px', height: '50px', circle: true }),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement(Bone, { width: '60%', height: '16px', style: { marginBottom: '0.5rem' } }),
          React.createElement(Bone, { width: '40%', height: '12px' })
        ),
        React.createElement(Bone, { width: '80px', height: '32px' })
      )
    )
  );
};

export const MetricCardSkeleton = ({ count = 4 }) => {
  return React.createElement('div', { className: 'metric-row', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' } },
    Array.from({ length: count }).map((_, i) =>
      React.createElement('div', {
        key: i,
        className: 'faculty-metric-card',
        style: { padding: '1rem 1.2rem' }
      },
        React.createElement(Bone, { width: '60%', height: '14px', style: { marginBottom: '0.5rem' } }),
        React.createElement(Bone, { width: '40%', height: '32px', style: { marginBottom: '0.3rem' } }),
        React.createElement(Bone, { width: '80%', height: '10px' })
      )
    )
  );
};

export const FacultyCardSkeleton = ({ count = 3 }) => {
  return React.createElement(React.Fragment, null,
    Array.from({ length: count }).map((_, i) =>
      React.createElement('div', {
        key: i,
        className: 'faculty-card',
      },
        React.createElement('div', {
          className: 'faculty-card-top',
          style: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.2rem' }
        },
          React.createElement(Bone, { width: '50px', height: '50px', circle: true }),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement(Bone, { width: '70%', height: '16px', style: { marginBottom: '0.4rem' } }),
            React.createElement(Bone, { width: '40%', height: '12px' })
          )
        ),
        React.createElement('div', { className: 'faculty-card-bottom', style: { padding: '1.2rem' } },
          React.createElement(Bone, { width: '100%', height: '36px', style: { borderRadius: '25px' } })
        )
      )
    )
  );
};

export const AppointmentRowSkeleton = ({ count = 4 }) => {
  return React.createElement(React.Fragment, null,
    Array.from({ length: count }).map((_, i) =>
      React.createElement('tr', { key: i },
        React.createElement('td', { style: { padding: '1.2rem' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1.2rem' } },
            React.createElement(Bone, { width: '50px', height: '50px', circle: true }),
            React.createElement(Bone, { width: '120px', height: '16px' })
          )
        ),
        React.createElement('td', { style: { padding: '1.2rem', textAlign: 'center' } },
          React.createElement(Bone, { width: '80px', height: '14px', style: { margin: '0 auto' } })
        ),
        React.createElement('td', { style: { padding: '1.2rem', textAlign: 'center' } },
          React.createElement(Bone, { width: '100px', height: '14px', style: { margin: '0 auto' } })
        ),
        React.createElement('td', { style: { padding: '1.2rem', textAlign: 'center' } },
          React.createElement(Bone, { width: '70px', height: '24px', style: { margin: '0 auto', borderRadius: '20px' } })
        )
      )
    )
  );
};

export const DashboardAppointmentSkeleton = ({ count = 3 }) => {
  return React.createElement('div', null,
    Array.from({ length: count }).map((_, i) =>
      React.createElement('div', {
        key: i,
        className: 'appointment-card',
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1rem', borderBottom: '1px solid var(--border-color)' }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1.2rem' } },
          React.createElement(Bone, { width: '52px', height: '52px', circle: true }),
          React.createElement('div', null,
            React.createElement(Bone, { width: '130px', height: '16px', style: { marginBottom: '0.4rem' } }),
            React.createElement(Bone, { width: '90px', height: '12px' })
          )
        ),
        React.createElement(Bone, { width: '80px', height: '28px', style: { borderRadius: '20px' } })
      )
    )
  );
};


// =============================================
// 4. LATENCY MASKING UTILITIES
// =============================================

/**
 * Ensures a minimum display time for loading states to prevent flicker.
 * @param {Promise} promise - The actual async work
 * @param {number} minMs - Minimum time to wait (default 300ms)
 * @returns {Promise} - Resolves with the original result after at least minMs
 */
export const withMinDelay = (promise, minMs = 300) => {
  const start = Date.now();
  return promise.then(result => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minMs - elapsed);
    return new Promise(resolve => setTimeout(() => resolve(result), remaining));
  });
};

/**
 * Creates a debounced version of a function.
 * Useful for rapid-fire actions like status toggling.
 */
export const debouncedSave = (fn, delayMs = 500) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delayMs);
    });
  };
};

/**
 * Simple in-memory cache for prefetched data.
 * Used to make tab switches feel instant.
 */
const prefetchCache = new Map();

export const prefetch = (key, fetchFn) => {
  if (!prefetchCache.has(key)) {
    prefetchCache.set(key, fetchFn());
  }
  return prefetchCache.get(key);
};

export const getCached = (key) => {
  return prefetchCache.get(key) || null;
};

export const clearCache = (key) => {
  if (key) {
    prefetchCache.delete(key);
  } else {
    prefetchCache.clear();
  }
};
