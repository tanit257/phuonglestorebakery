# Implementation Plan: Multi-Customer Cart Management

## Problem Analysis

**Current Limitation:**
- Order creation screen only supports ONE customer at a time
- When customer #2 arrives, cannot switch customers without losing current cart
- No ability to handle multiple pending orders simultaneously
- Copy order functionality would fail if original cart is cleared

**User Request (Vietnamese):**
> "Ở màn hình tạo đơn hàng, có 1 nhược điểm là chỉ có 1 khách hàng trên tạo đơn, nếu có khách thứ 2 vào tôi không thể linh hoạt chuyển đổi, hãy đề xuất giải pháp giúp tôi, hãy suy nghĩ kĩ các case như copy đơn hàng nữa, nit sẽ không mất đơn hàng hiện tại."

**Translation:**
"On the order creation screen, there's a limitation - only 1 customer per order. If a 2nd customer arrives, I can't flexibly switch between them. Please suggest a solution, think carefully about cases like copying orders too - it shouldn't lose the current order."

## Requirements Restatement

### Functional Requirements
1. **Multiple Pending Carts**: Support multiple draft orders for different customers simultaneously
2. **Quick Customer Switching**: Easily switch between pending carts without losing data
3. **Cart Preservation**: When switching customers, current cart should be saved (not cleared)
4. **Visual Cart List**: Show all pending carts with customer info and item count
5. **Copy Order Support**: Copying an order should not interfere with active carts
6. **Session Persistence**: Pending carts should survive page refresh (localStorage)
7. **Dual Mode Support**: Work in both Real mode AND Invoice mode

### Non-Functional Requirements
- Maintain existing UI/UX patterns
- Fast switching (< 100ms)
- Clean state management (immutable patterns)
- No data loss on page refresh
- Mobile-friendly interface

## Proposed Solution: Draft Order System

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  CreateOrderPage                                    │
│  ┌───────────────────────────────────────────────┐  │
│  │  Draft Carts Panel (Collapsible)              │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │  │
│  │  │Cart1│ │Cart2│ │Cart3│ │ + │              │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘            │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Active Customer (selected from draft cart)   │  │
│  └───────────────────────────────────────────────┘  │
│  ┌─────────────────┬─────────────────────────────┐  │
│  │  Cart Items     │  Product Selector           │  │
│  │  (Active Cart)  │  (Search & Add)             │  │
│  └─────────────────┴─────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### State Structure

```javascript
// Store state (useStore.js)
{
  // Existing single cart (keep for backward compatibility)
  cart: [],
  selectedCustomer: null,

  // NEW: Multi-cart management
  draftCarts: [
    {
      id: 'draft_uuid_1',
      customerId: 'customer_123',
      customer: { /* customer object */ },
      items: [ /* cart items */ ],
      total: 150000,
      createdAt: '2024-01-31T10:00:00Z',
      updatedAt: '2024-01-31T10:15:00Z',
    }
  ],
  activeDraftId: 'draft_uuid_1', // Currently active draft

  // Invoice mode equivalents
  invoiceDraftCarts: [],
  activeInvoiceDraftId: null,
}
```

### Key Features

1. **Draft Cart Panel** (Top of CreateOrderPage)
   - Horizontal scrollable list of draft carts
   - Each draft shows: Customer name, item count, total
   - Click to switch between drafts
   - "+" button to create new draft (select new customer)
   - Delete button (X) for each draft
   - Badge showing active draft

2. **Auto-Save Behavior**
   - When switching customers: Current cart auto-saved as draft
   - When adding items: Draft auto-updated (debounced)
   - On page refresh: Drafts loaded from localStorage
   - On order creation: Draft deleted from list

3. **Customer Selection Flow**
   - **With Drafts**: Show draft panel → Click draft to switch
   - **No Drafts**: Show customer selector (existing flow)
   - **New Draft**: Click "+" → Show customer selector → Create new draft

4. **State Synchronization**
   - Active draft syncs with `cart` and `selectedCustomer` (backward compatibility)
   - Changes to `cart` auto-update active draft
   - Switching draft replaces `cart` and `selectedCustomer`

## Implementation Phases

### Phase 1: Store Enhancement (useStore.js)
**Complexity: MEDIUM** | **Time: 2-3 hours**

#### 1.1 Add Draft Cart State & Actions
- Add state: `draftCarts`, `activeDraftId`, `invoiceDraftCarts`, `activeInvoiceDraftId`
- Create actions:
  - `createDraftCart(customer)` - Create new draft
  - `switchDraftCart(draftId)` - Switch active draft
  - `updateDraftCart(draftId, updates)` - Update draft items/total
  - `deleteDraftCart(draftId)` - Remove draft
  - `syncActiveDraft()` - Sync cart → active draft
  - `loadDraftsFromStorage()` - Load on init
  - `saveDraftsToStorage()` - Persist to localStorage

#### 1.2 Modify Existing Actions
- `setSelectedCustomer()` - Create draft if not exists, sync to draft
- `addToCart()` - Sync to active draft after update
- `updateCartQuantity()` - Sync to active draft
- `updateCartItemDiscount()` - Sync to active draft
- `updateCartItemPrice()` - Sync to active draft
- `removeFromCart()` - Sync to active draft
- `clearCart()` - Delete active draft
- `createOrder()` - Delete active draft after success

#### 1.3 Invoice Mode Duplication
- Duplicate all draft actions for invoice mode
- Use `invoiceDraftCarts` and `activeInvoiceDraftId`

**Files Changed:**
- [src/hooks/useStore.js](src/hooks/useStore.js)

---

### Phase 2: Draft Cart Panel Component
**Complexity: MEDIUM** | **Time: 2-3 hours**

#### 2.1 Create DraftCartPanel Component
- Location: `src/components/cart/DraftCartPanel.jsx`
- Props:
  - `draftCarts` - Array of drafts
  - `activeDraftId` - Currently active draft
  - `onSwitchDraft(draftId)` - Switch callback
  - `onDeleteDraft(draftId)` - Delete callback
  - `onCreateDraft()` - Create new draft callback
  - `bgColor` - Theme color (violet/rose for modes)
  - `isInvoiceMode` - Mode flag

#### 2.2 UI Features
- Horizontal scroll container for drafts
- Each draft card shows:
  - Customer short_name (truncated)
  - Item count badge
  - Total amount
  - Active indicator (border highlight)
  - Delete button (X)
- "+" button to create new draft
- Empty state: "Chưa có đơn nháp. Chọn khách hàng để bắt đầu."
- Mobile responsive (touch scrolling)

#### 2.3 Visual Design
- Compact cards (80px width)
- Smooth scroll behavior
- Active draft: Thicker border, stronger color
- Inactive drafts: Subtle border, gray
- Delete button: Hover to show (X)

**Files Created:**
- `src/components/cart/DraftCartPanel.jsx`

---

### Phase 3: Integrate into CreateOrderPage
**Complexity: LOW** | **Time: 1-2 hours**

#### 3.1 Import and Wire DraftCartPanel
- Import `DraftCartPanel` component
- Get draft state from `useStore`:
  - `draftCarts`, `activeDraftId` (real mode)
  - `invoiceDraftCarts`, `activeInvoiceDraftId` (invoice mode)
- Get draft actions:
  - `createDraftCart`, `switchDraftCart`, `deleteDraftCart`

#### 3.2 Update Page Layout
- Add DraftCartPanel above customer selector
- Show DraftCartPanel when `draftCarts.length > 0`
- Hide CustomerSelector when draft is active
- Update sticky customer bar to show draft info

#### 3.3 Handle Customer Selection
- When no drafts: Show CustomerSelector (existing flow)
- When customer selected: Create new draft OR switch to existing
- When "Đổi khách" clicked: Delete current draft OR show draft panel

**Files Changed:**
- [src/pages/CreateOrderPage.jsx](src/pages/CreateOrderPage.jsx)

---

### Phase 4: LocalStorage Persistence
**Complexity: LOW** | **Time: 1 hour**

#### 4.1 Storage Schema
```javascript
// localStorage keys
'draftCarts' // Real mode drafts
'invoiceDraftCarts' // Invoice mode drafts
'activeDraftId'
'activeInvoiceDraftId'
```

#### 4.2 Implement Persistence
- Save drafts on every update (debounced 500ms)
- Load drafts on store initialization
- Clear stale drafts (> 7 days old)
- Handle storage quota errors gracefully

#### 4.3 Migration Strategy
- Check for existing `cart` + `selectedCustomer` on init
- If exists, migrate to first draft cart
- Clear old single cart state after migration

**Files Changed:**
- [src/hooks/useStore.js](src/hooks/useStore.js)

---

### Phase 5: Edge Cases & Polish
**Complexity: LOW** | **Time: 1-2 hours**

#### 5.1 Copy Order Scenario
- When copying order from OrdersPage:
  - Create NEW draft cart with copied items
  - Set as active draft
  - Navigate to CreateOrderPage
  - Original drafts preserved

#### 5.2 Validation & Error Handling
- Prevent creating duplicate drafts for same customer
- Show warning when deleting draft with items
- Handle localStorage quota exceeded
- Validate draft data on load (schema check)

#### 5.3 UX Enhancements
- Keyboard shortcuts:
  - `Ctrl/Cmd + N` - New draft
  - `Ctrl/Cmd + 1-9` - Switch to draft N
  - `Ctrl/Cmd + W` - Delete active draft
- Toast notifications:
  - "Đơn nháp đã được lưu"
  - "Đã chuyển sang khách hàng X"
  - "Đơn nháp đã bị xóa"
- Loading states for draft operations
- Optimistic UI updates

**Files Changed:**
- [src/components/cart/DraftCartPanel.jsx](src/components/cart/DraftCartPanel.jsx)
- [src/pages/CreateOrderPage.jsx](src/pages/CreateOrderPage.jsx)
- [src/hooks/useStore.js](src/hooks/useStore.js)

---

### Phase 6: Testing & Documentation
**Complexity: LOW** | **Time: 1-2 hours**

#### 6.1 Manual Testing Scenarios
1. Create 3 draft carts for different customers
2. Switch between drafts, verify items preserved
3. Add/remove items, verify draft auto-saves
4. Refresh page, verify drafts loaded
5. Create order, verify draft deleted
6. Copy order, verify new draft created
7. Test in both Real and Invoice modes
8. Test on mobile (touch scrolling)

#### 6.2 Unit Tests (if applicable)
- Draft cart actions (create, switch, delete)
- LocalStorage persistence
- State synchronization

#### 6.3 Update Documentation
- Add to FEATURES_OVERVIEW.md
- Update README if necessary
- Add inline code comments

**Files Changed:**
- `FEATURES_OVERVIEW.md`

---

## Risk Assessment

### HIGH RISKS
1. **State Synchronization Complexity**
   - Risk: Draft state out of sync with cart state
   - Mitigation: Single source of truth (drafts), cart is derived
   - Alternative: Make cart read from active draft (computed)

2. **LocalStorage Quota**
   - Risk: Storage full with many drafts
   - Mitigation: Limit to 10 drafts max, auto-delete oldest
   - Alternative: Use IndexedDB for larger storage

### MEDIUM RISKS
1. **Backward Compatibility**
   - Risk: Breaking existing order creation flow
   - Mitigation: Keep single cart state for backward compat
   - Test: Verify existing flows work without drafts

2. **Performance with Many Drafts**
   - Risk: Slow rendering with 20+ drafts
   - Mitigation: Virtualized scroll list, limit to 10 drafts
   - Test: Stress test with 50 drafts

3. **Mobile UX**
   - Risk: Draft panel too small on mobile
   - Mitigation: Responsive design, minimum touch target 44px
   - Test: Test on iPhone SE, Android small screen

### LOW RISKS
1. **Mode Switching**
   - Risk: Confusion when switching Real ↔ Invoice mode
   - Mitigation: Separate draft lists per mode, clear visual indicator
   - Test: Switch modes with active drafts

2. **Copy Order Edge Case**
   - Risk: Copying order to existing draft customer
   - Mitigation: Create new draft even if customer exists
   - Test: Copy order for same customer twice

---

## Alternative Solutions (Considered & Rejected)

### Alternative 1: Tab-Based Interface
- **Pros**: Familiar UI pattern, easy navigation
- **Cons**: Takes more vertical space, less visual overview
- **Rejected**: Draft panel is more compact

### Alternative 2: Modal-Based Switching
- **Pros**: Simple to implement, no layout changes
- **Cons**: Extra click to switch, no quick overview
- **Rejected**: Less convenient than always-visible panel

### Alternative 3: Session Storage (No Persistence)
- **Pros**: Simpler implementation, no storage management
- **Cons**: Lose drafts on page refresh (poor UX)
- **Rejected**: Users expect drafts to persist

---

## Success Criteria

### Must Have (P0)
- [ ] Can create multiple draft carts for different customers
- [ ] Can switch between drafts without losing data
- [ ] Drafts persist on page refresh (localStorage)
- [ ] Creating order deletes active draft
- [ ] Works in both Real and Invoice modes
- [ ] Mobile-friendly UI

### Should Have (P1)
- [ ] Visual draft panel at top of page
- [ ] Delete draft button for each draft
- [ ] Toast notifications for draft actions
- [ ] Auto-save on cart changes
- [ ] Copy order creates new draft

### Nice to Have (P2)
- [ ] Keyboard shortcuts for draft management
- [ ] Draft age indicator (e.g., "5 phút trước")
- [ ] Drag-to-reorder drafts
- [ ] Export/import drafts

---

## Estimated Complexity & Time

| Phase | Complexity | Estimated Time |
|-------|-----------|---------------|
| Phase 1: Store Enhancement | MEDIUM | 2-3 hours |
| Phase 2: Draft Cart Panel | MEDIUM | 2-3 hours |
| Phase 3: Integration | LOW | 1-2 hours |
| Phase 4: Persistence | LOW | 1 hour |
| Phase 5: Edge Cases | LOW | 1-2 hours |
| Phase 6: Testing | LOW | 1-2 hours |
| **TOTAL** | **MEDIUM** | **8-13 hours** |

**Recommended Approach**: Implement phases 1-4 first (core functionality), then add phase 5-6 (polish) based on user feedback.

---

## Open Questions for User

1. **Draft Limit**: How many draft carts should we support? (Recommend: 10 max)
2. **Auto-Delete**: Should old drafts auto-delete after N days? (Recommend: 7 days)
3. **Keyboard Shortcuts**: Are keyboard shortcuts needed? (Can defer to P2)
4. **Draft Names**: Allow custom names for drafts? (e.g., "Đơn buổi sáng") or just customer names?
5. **Visual Position**: Draft panel at top (recommended) or side panel?

---

## Next Steps

**WAITING FOR USER CONFIRMATION:**

1. Review this plan and provide feedback
2. Answer open questions above
3. Approve to proceed with implementation
4. Choose which phases to implement (all or subset)

Once approved, I will proceed with **Phase 1: Store Enhancement** and work sequentially through the phases.
