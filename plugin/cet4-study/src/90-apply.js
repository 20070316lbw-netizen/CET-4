/**
 * CET-4 Practice — plugin wiring.
 *
 * Registers one right-sidebar tab type (with a guide entry, so expanding the
 * column opens the paper) and a compact control beside the composer.
 */
const inject = ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight']

/** Small open control in the composer tool row. */
function OpenButton() {
  return h(
    'button',
    {
      type: 'button',
      title: '四级精练',
      'aria-label': '四级精练',
      onClick: () => {
        try {
          openPanel()
        } catch (error) {
          console.error('[cet4-study] open failed', error)
        }
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        height: 28,
        padding: '0 8px',
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        font: 'inherit',
        fontSize: 12,
        cursor: 'pointer',
      },
    },
    '四级',
  )
}

/** Opens the panel; replaced with the controller call during apply. */
let openPanel = () => {}

/** Client plugin body. */
function apply(ctx) {
  const t = ctx.locale.bind(NS)

  ctx.effect(() => installStyles(), 'cet4-study: panel styles')
  ctx.effect(() => ctx.locale.register(NS, COPY), 'cet4-study: dictionaries')

  if (ctx.sidebarRight && typeof ctx.sidebarRight.openTab === 'function') {
    openPanel = () => ctx.sidebarRight.openTab(TAB_KIND)
  }

  ctx.effect(
    () =>
      ctx.sidebarRightTabs.register({
        id: TAB_ID,
        kind: TAB_KIND,
        priority: 'extension',
        title: () => t('tab.title'),
        guide: [
          {
            id: 'cet4-practice',
            order: 10,
            title: () => t('tab.title'),
            description: () => t('openHint'),
          },
        ],
      }),
    'cet4-study: tab type',
  )

  ctx.effect(
    () =>
      ctx.slots.inject('sidebar.right.pane.tab', () =>
        ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS }, PanelEntry),
      ),
    'cet4-study: panel body',
  )

  ctx.effect(
    () =>
      ctx.slots.inject('conversation.input.right', () =>
        ctx.slots.register({ name: 'conversation.input.right', id: 'cet4-open', order: 20 }, OpenButton),
      ),
    'cet4-study: open control',
  )

  // Diagnostic trail for the Host half; harmless when it cannot be sent.
  api('/client', {
    method: 'POST',
    body: { event: 'client-applied', info: { tabId: TAB_ID, kind: TAB_KIND } },
  }).catch((error) => console.error('[cet4-study] beacon failed', error))
}

exports.inject = inject
exports.apply = apply
