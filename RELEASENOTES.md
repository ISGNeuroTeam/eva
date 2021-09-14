# [1.65.0] - Filter UI changes, filter parts order and bugfixes

### New
- Minor changes of filter row UI in filter panel.
- 'token' type filter parts are sorting by the count of values by clicking "accept changes" now.

### Bugfix
- Log icon in header of page highlights after error in search.
- Heatmap updates properly  when the value in the select (token) is changed.
- Graph doesn't disappear anymore while zooming.

# [1.64.0] - Introducing filters on dashboards, units on multiline, styles for SingleValue and other changes/fixes

### New
- Added global filters for searches on dashboards all over tabs.
- Added units for each line on MultiLine component (only for separate mode).
- Submit button while editing tab name.
- Values styles for SingleValue component.
- Theme support for user settings in map component.
- You can not switch/delete other tabs while editing name of one anymore.
- The log button is returned to the page header.

### Bugfix
- Hover on first row in table doesn't hide it anymore.
- Time format doesn't change while zooming on MultiLine component.
- Header height is equal on all pages.
- Second header doesn't appear after incorrect search anymore.

# [1.63.0] - Tabs on dashboards, new SingleValue component, GIS monitoring mode and minor bug fix

### New
- Added tabs on dashboards.
- Added ability to pin certain visual component to all tabs.
- Added upgraded SingleValue component with new layouts.
- Added data source for pipeline monitoring mode.

### Bugfix
- Fixed bug with captions not moving while zooming on MultiLine.

# [1.62.0] - GIS map tokens and few bugfixes

### New
New functionality to receive zoom level and map borders with GIS plugin.

### Bugfix
We have fixed a couple of bugs: the main header looks good, and the table header do not overlap anything.