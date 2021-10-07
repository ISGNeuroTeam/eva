# [1.68.2] - Hotfix of critical dashboard bug

### Bugfix
- Bug with visual components get stuck at the top of dashboard.

# [1.68.1] - RELEASENOTES and CHANGELOG fix

### Bugfix
- Removed multiline changes from [CHANGELOG](CHANGELOG.md) and [RELEASENOTES](RELEASENOTES.md).

# [1.68.0] - GIS value mask and monitoring mode changes. Visualization fixes and full screen adaptation. Minor bugfixes.

### New
- GIS. Added value mask for coordinates in map component.
- GIS. All pipes are showing in monitoring mode.
- Removed scroll ability with shift+wheel on tab panel.
- Token and operation selectors in filter part modal are disabled out of edit mode.
- Values in token type filter part are cleared only after switching tokens.
- Full screen mode for all visualizations has a persist height.

### Bugfix
- Infinite scroll on tab panel.
- Displaying all existing dashboard tokens in filter part modal.
- Problem with render gantt and opening in full screen mode.
- Correct render of several gantt diagrams in dashboard.
- GIS. Fix width of modes in map component.

# [1.67.0] - New events, UI visual and interaction changes/fixes

### New
- Heatmap progress-bar are now displayed in full cell width and minor styling changes.
- Reversed filter parts are now indicated with reverse logo.
- 'Go to dashboard' event.
- Compare event to color rows, columns and cells for table visualization component.
- Certain controls on filter panel are available only in dashboard edit mode.
- Max width of filter part title is restricted to 250px.

### Bugfix
- When logged as regular user 'log out' options in dropdown menu was hidden on dashboard page.
- Clicking reset filter part item doesn't give any visual feedback.
- 'Add new filter' button are now displaying correctly.
- Pie chart redraws correctly after token change.
- Tabs in filter modal are shown only when both modes are available.

# [1.66.0] - UI controls for graph component, tabs UI changes and bugfixes

### New
- New controls in graph component: zoom in/out and fitContent control buttons
- Overflow dots in tab panel from right and left sides of panel
- Scroll without shift of tab panel
- Can take token from fullscreen table
- Max width of tab is 200px

### Bugfix
- Custom themes now not crushing application
- Data source not reloading when switching tab on dashboard
- Correct colors and tooltips in gant diagram

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