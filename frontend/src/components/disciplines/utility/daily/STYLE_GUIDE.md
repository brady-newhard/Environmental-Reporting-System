# Style Guide: Header/Form Field Layout Standard

## Flexbox-Based Form Layout

- **Use a flexbox-based layout (not Material-UI Grid) for all header and form field groupings.**
- For rows of fields:
  - Use a container with `display: flex` and `gap` for spacing.
  - For 3 fields: each should be `max-width: 33.33%` and `flex: 1`.
  - For 2 fields: each should be `max-width: 50%` and `flex: 1`.
  - Use responsive media queries to stack fields vertically on mobile.
- The container should have:
  - `width: 100%`
  - A light background, subtle border, and border-radius
  - Padding for breathing room, but no excessive horizontal padding that shrinks the fields
- Use a CSS module for all such layouts to avoid global style conflicts.
- This approach should be used for all similar form sections throughout the app for a consistent, professional look.

## Example CSS
```css
.header-fields-container {
  width: 100%;
  background: #fafbfc;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 16px 12px;
  margin-bottom: 24px;
  box-sizing: border-box;
}
.header-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.header-row:last-child {
  margin-bottom: 0;
}
.header-field {
  flex: 1 1 0;
  max-width: 100%;
}
.header-row.top > .header-field {
  max-width: 33.33%;
}
.header-row.bottom > .header-field {
  max-width: 50%;
}
@media (max-width: 900px) {
  .header-row {
    flex-direction: column;
    gap: 12px;
  }
  .header-row.top > .header-field,
  .header-row.bottom > .header-field {
    max-width: 100%;
  }
}
```

## Example JSX
```jsx
<div className={styles['header-fields-container']}>
  <div className={`${styles['header-row']} ${styles['top']}`}>
    <TextField ... className={styles['header-field']} />
    <TextField ... className={styles['header-field']} />
    <LocalizationProvider ...>
      <DatePicker ... slotProps={{ textField: { className: styles['header-field'], fullWidth: true, ... } }} />
    </LocalizationProvider>
  </div>
  <div className={`${styles['header-row']} ${styles['bottom']}`}>
    <TextField ... className={styles['header-field']} />
    <TextField ... className={styles['header-field']} />
  </div>
</div>
```

# Dynamic Section Row Layout (Flexbox Standard)

- **Use a flexbox-based layout for all dynamic (addable/removable) row sections in reports.**
- Do NOT use MUI Grid for these rows; use `<Box sx={{ display: 'flex', ... }}>` or a CSS class with `display: flex`.
- Each field in the row should be in a flex child with `flex: 1` and `min-width: 0`.
- The delete/trashcan icon should be in its own flex child at the end, with minimal width.
- Use `gap` for spacing between fields.
- This ensures all fields fill the row, are responsive, and the layout is consistent regardless of MUI version.

## Example JSX
```jsx
<Paper>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
    {fields.map((field, idx) => (
      <Box key={field.name} sx={{ flex: 1, minWidth: 0 }}>
        {/* TextField or Select here */}
      </Box>
    ))}
    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </Box>
  </Box>
</Paper>
```

## Example CSS (if using CSS modules)
```css
.dynamic-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}
.dynamic-row-field {
  flex: 1 1 0;
  min-width: 0;
}
.dynamic-row-trash {
  min-width: 0;
  display: flex;
  align-items: center;
}
```

- **Use this pattern for all dynamic/addable row layouts in all reports for consistency.** 