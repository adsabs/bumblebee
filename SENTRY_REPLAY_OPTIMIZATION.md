# Sentry Replay Optimization Summary

## Problem Identified
Your project was burning through 100k replay allowance in 8-10 hours due to high-volume, low-value errors triggering replays unnecessarily.

## Key Issues Consuming Replay Budget

Based on analysis of your actual Sentry data, these error patterns were consuming most replays:

1. **BUMBLEBEE-1TC** - 172,785 events - `SyntaxError: Invalid or unexpected token`
2. **BUMBLEBEE-D** - 13,235 events - RequireJS script loading errors  
3. **BUMBLEBEE-7QW/7QV** - 6,787 events - Google Tag Manager `__tcfapi` errors
4. **BUMBLEBEE-1R2** - 7,459 events - Uncompressed asset performance issues
5. **BUMBLEBEE-75Y** - 3,271 events - Search cycle failures (HTTP 429 rate limiting)
6. **BUMBLEBEE-5KN** - 2,584 events - Google Analytics loading issues
7. **Multiple jQuery/Bootstrap issues** - ~5,000 events combined

## Optimizations Implemented

### 1. Smart Error Filtering
- **High-volume error patterns**: Added specific regex patterns for your top error types
- **Third-party script filtering**: Filters errors from GTM, GA, Pinterest, etc.
- **RequireJS/Script loading errors**: Filters common module loading failures
- **Network/fetch failures**: Filters transient network issues
- **Performance issues**: Filters asset compression warnings

### 2. Aggressive Replay Sampling
- **No random session recording**: `replaysSessionSampleRate: 0`
- **Daily quota limits**: 100 replays/day in production, 1000 in development
- **Ultra-low sampling rates**: 5% for critical app errors, 0.1% for others
- **Smart quota management**: Uses localStorage to track daily usage

### 3. Payload Size Reduction
- **Block all media**: Images/videos not recorded
- **Minimal network capture**: Only critical API endpoints
- **No request/response bodies**: Reduces network payload size
- **Limited DOM mutations**: Caps mutation tracking at 10,000 events
- **Canvas/font optimization**: Disabled canvas recording and font collection
- **5-minute replay limit**: Prevents excessively long recordings

### 4. Targeted Network Monitoring
Only captures network requests for:
- `/api/v1/` - Core API calls
- `/search/query` - Search queries  
- `/resolver/` - Citation resolver
- `/export/` - Export functionality
- `/user/` - User management
- `/myads/` - User libraries

## Expected Impact
- **~99.9% reduction in replay usage**
- **Elimination of noise from third-party scripts**
- **Focus on genuine application errors**
- **Smaller replay file sizes**
- **Better signal-to-noise ratio for debugging**

## Optional: Additional CSS Optimizations

Add these CSS classes to further reduce replay payload:

```css
/* Block these elements from Sentry replays */
.sentry-block {
  /* Applied to: ads, tracking pixels, large images, videos */
}

/* Ignore these elements completely in replays */
.sentry-ignore {
  /* Applied to: analytics widgets, social media embeds */
}
```

Add classes to HTML elements like:
```html
<!-- Block large images/videos -->
<img class="sentry-block" src="large-image.jpg">

<!-- Ignore third-party widgets -->
<div class="sentry-ignore" id="social-widget"></div>
```

## Monitoring

1. **Check daily usage**: Monitor localStorage key `sentry_replay_quota`
2. **Review filtered errors**: Check if important errors are being filtered
3. **Adjust sampling rates**: Fine-tune based on actual usage patterns
4. **Monitor payload sizes**: Ensure replays stay under size limits

## Next Steps

1. Deploy these changes and monitor replay usage over 24-48 hours
2. Review which errors are still generating replays in Sentry dashboard
3. Adjust filtering patterns if needed based on new data
4. Consider adding CSS classes to further optimize payload sizes

This should bring your replay usage down to a sustainable level while maintaining visibility into genuine application issues.