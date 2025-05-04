def assign_punchlist_item_numbers(report):
    items = list(report.punchlist_items_new.all())
    # Sort by start_station (convert to float for numeric sorting, fallback to string)
    def parse_station(val):
        try:
            return float(val)
        except Exception:
            return val or ''
    items.sort(key=lambda x: parse_station(x.start_station))
    for idx, item in enumerate(items, start=1):
        item.item_number = idx
        item.save() 