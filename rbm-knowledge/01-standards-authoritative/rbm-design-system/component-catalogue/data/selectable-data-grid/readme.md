# SelectableDataGrid — RBM Reference Component (Self-contained folder)

## Includes
- Component source under `src/`
- Token + density + base CSS under `tokens/` and `styles/`
- All direct dependencies (RBM reference implementations) required by `SelectableDataGrid`

## How to integrate
1. Copy this folder into your repo (or extract just `src/` into your UI library).
2. Ensure your app imports tokens/base once:
   - `tokens/rbm.tokens.css`
   - `tokens/rbm.density.css`
   - `styles/rbm.base.css`
3. Import the component from `index.ts` or from the file path under `src/`.

## Notes
- All styling is tokenised. No inline styles.
- Components assume `:root` has `data-density` set to compact/cozy/comfortable.
