/** Plugin-owned styles embedded in the anonymous script, with the same lifetime as its element. */
export const pairingStyles = `
snh-device-pairing {
  display: block;
  min-width: 0;
}

.snh-device-pairing-pairing {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.5;
}

.snh-device-pairing-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.snh-device-pairing-panel[hidden] {
  display: none;
}

.snh-device-pairing-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.snh-device-pairing-hint,
.snh-device-pairing-message,
.snh-device-pairing-countdown {
  margin: 0;
  color: var(--dsw-alias-label-secondary, color-mix(in srgb, currentColor 72%, transparent));
}

.snh-device-pairing-countdown {
  flex: none;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.snh-device-pairing-message {
  min-width: 0;
  overflow-wrap: anywhere;
}

.snh-device-pairing-message[role='alert'],
.snh-device-pairing-panel[data-state='denied'] .snh-device-pairing-message,
.snh-device-pairing-panel[data-state='expired'] .snh-device-pairing-message {
  grid-column: 1 / -1;
  padding: 12px;
  border: 0.5px solid color-mix(in srgb, var(--snh-pairing-banner-color) 40%, transparent);
  border-radius: var(--dsw-radius-lg, 12px);
  color: var(--dsw-alias-label-primary, light-dark(#222, #eee));
  line-height: 20px;
}

.snh-device-pairing-message[role='alert'] {
  --snh-pairing-banner-color: var(--dsw-alias-state-error-primary, light-dark(#ec1313, #f25a5a));
  background: color-mix(in srgb, var(--snh-pairing-banner-color) 10%, transparent);
}

.snh-device-pairing-panel[data-state='denied'] .snh-device-pairing-message,
.snh-device-pairing-panel[data-state='expired'] .snh-device-pairing-message {
  --snh-pairing-banner-color: var(--dsw-alias-state-warn-primary, light-dark(#bd720b, #e7a53c));
  background: var(--dsw-alias-state-warn-tertiary, color-mix(in srgb, var(--snh-pairing-banner-color) 10%, transparent));
}

.snh-device-pairing-code {
  padding: 8px 0;
  text-align: center;
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, monospace);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 3px;
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-primary, light-dark(#222, #eee));
}

.snh-device-pairing-feedback {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.snh-device-pairing-countdown {
  grid-column: 2;
}

.snh-device-pairing-button {
  box-sizing: border-box;
  min-height: 44px;
  padding: 8px 12px;
  font: inherit;
  font-weight: 500;
  border: 0.5px solid var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 16%, transparent));
  border-radius: var(--dsw-radius-sm, 8px);
  color: var(--dsw-alias-label-primary, light-dark(#222, #eee));
  background: var(--dsw-alias-bg-layer-1, light-dark(#fff, #232324));
  cursor: pointer;
}

.snh-device-pairing-button:disabled {
  cursor: default;
}

.snh-device-pairing-button:disabled:not(.snh-device-pairing-primary) {
  color: var(--dsw-alias-label-tertiary, color-mix(in srgb, currentColor 48%, transparent));
}

.snh-device-pairing-button:focus-visible {
  outline-style: solid;
  outline-offset: 2px;
}

.snh-device-pairing-primary {
  font-size: 14px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary-foreground, light-dark(#fff, #222));
  background: var(--dsw-alias-button-primary-fill, light-dark(#222, #eee));
  border: 0;
}

@media (hover: hover) {
  .snh-device-pairing-button:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover, light-dark(#f5f5f5, #303031));
  }

  .snh-device-pairing-primary:hover:not(:disabled) {
    background: var(--dsw-alias-button-primary-hover, light-dark(#3c3c3d, #d4d4d4));
  }
}
`
