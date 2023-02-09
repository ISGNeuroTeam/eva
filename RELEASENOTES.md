# [1.121.0] - 2023-02-09

### Added
- Gauge component
- Waterfall component
- Constructor-schemes: build scheme from search

### Fixed
- Constructor-schemes: setting default elements didn't work
- Constructor-schemes: element "hoarder"(data-type-2) didn't work

# [1.120.0] - 2023-02-01

### Added
- Constructor-schemes: Entering values for the left column of the table-node manually.
- Constructor-schemes: added timeout for schema saving

### Changed
- Do not highlight dashboard when edit mode is disabled
- Constructor-schemes: change font family to "ProximaNova", sans-serif

### Fixed
- In some cases not working custom categories
- Single value: coloring text value
- Fixed transitions from the map
- Constructor-schemes: "transparent background" setting didn't work

# [1.119.0] - 2023-01-25

### Added
- Added gen_distr command description
- Added saving/loading of all elements in the "constructor-schemes" as an array of objects with parameters for creating an element
- Added rgba color for text element background in "constructor-schemes"
- Added click event in the "constructor-schemes"
- Added data-node value color from dataset in the "constructor-schemes"

### Changed
- Update yFiles to v25.0.1
- Update yFiles license to 2.4

# [1.118.0] - 2022-12-29

### Added
- Bush: added the ability to change the label color
- GIS: Added onctrlclick event for Ctrl+Click transition
- Constructor-schemes: added undo/redo (ctrl+z/ctrl+y)

### Fixed
- Component settings: Centering the filling of the library of primitives
- GIS: fixed display of tooltip above areas
- GIS: fixed click event
- Constructor-schemes: GraphViewerInputMode is not active default
- Constructor-schemes: Incorrect start search from component settings

# [1.117.0] - 2022-12-23

### Added
- Multiline: added the x axis value in tooltip
- Multiline: added setting to show ticks on x-axis by points
- Added load icons list from datasource in constructor-schemes

### Changed
- Changed the filtering logic in the navigation tree

### Fixed
- Fixed incorrect size select-items on settings-panel in constructor-schemes

# [1.116.0] - 2022-12-16

### Added
- Customizable sections in the navigation menu
- Added display of data object id under the object selection select on constructor schemes
- Added fitGraph button on constructor schemes
- Added change background size data-node on constructorSchemes
- Added copy\paste fn for ConstructorSchemes
- Added token interaction with filter

### Changed
- Home group selection now has a filter

### Fixed
- Bug when home group does not exist
- Background color for time selection in the searching reporting and tooltip text color in dark theme

# [1.115.0] - 2022-12-08

### Added
- The ability to create an arbitrary number of tokens per element for one event
- Added "Reset values if data source does not contain them" option in the select component

### Changed
- Schemes constructor: Changed icons list settings

### Fixed
- Fixed spontaneous change in the case of the first letters of words in the title of dashboards

# [1.114.0] - 2022-12-02

### Added
- dynamicForm: Added step to slider

### Fixed
- Run searches from admin username
- Multiselect. The selectable property from the list in the token is ignored

# [1.113.0] - 2022-11-25

### Added
- Added line wrap on textarea
- Button. Added the ability to reset tokens on click
- Navigation panel on dash page
- Redirect back after login
- Url for group page
- Section "Tree"

### Changed
- Visual button change

### Fixed
- Fixed events on visualisation "select"
- Fixed line wrap on textarea after update token
- Token refresh confirmation window appears in the wrong place

# [1.112.0] - 2022-11-18

### Fixed
- Calendar: the sixth row of the table with numbers is covered by another element, as a result of which the last days in some months are not visible
- The name of the visualization does not fit to display

# [1.111.0] - 2022-11-10

### Added
- Added alert for schema read error

### Fixed
- Fixed selection in visualization groups component
- Disabled logging when taking a screenshot
- fix labels in dynamicForm for radio and checkbox
- Incorrect parameter switching using the OnTokenCompare event

# [1.110.0] - 2022-10-28

### Added
- Added ability to hide the time selector in the datetime picker
- Added it is possible to change the color of the gantt visualization
- Added the group settings for the multiline
- Added the ability to draw vertical lines on a multiline chart

### Fixed
- Fixed a bug with the presence of a dot in the name of the data column
- Fixed issue with resetting options when saving settings

# [1.109.0] - 2022-10-26

### Added
- Added the Frequency graph visualization
- Added the Dash group visualization

### Changed
- The component menu has become more compact

### Fixed
- Fixed DS selection button on constructor-schemes

# [1.108.0] - 2022-10-13

### Added
- Added new dash Dynamic forms
- Data Picker: Added settings for displaying blocks of the entered date and time
- Data Picker: Added the ability to format the result
- Single Value: Added the ability to assign an icon via metadata
- Single Value: Added ability to correct color via metadata
- Constructor schemes: Added code editor for primitives library field
- Constructor schemes: Added loading svg icons from server
- Constructor schemes: Added data source support
- Added possibility save multiLine in png
- Text Area: added read only mode

### Changed
- Renaming the Single Value component to 'Показатели'

### Fixed
- fixed update of tokens on the map
- fixed position icons\buttons on dash panel
- fixed flickering map

# [1.107.0] - 2022-09-08

### Added
- Added default dashboard assignment for users

# [1.106.0] - 2022-09-02

### Added
- Schemes constructor: Added icons and tooltips on "toggle-order" buttons
- Schemes constructor: Added tooltip on "toggle-editor-mode" button
- Schemes constructor: Added tooltip on "options-panel" button
- Added redirect to the 404 page when switching to a non-existent dashboard

### Changed
- The animation of the transition of the visualization dialog box to full-screen mode has been changed

### Fixed
- The size of the text changed when it was selected in full-screen visualizations

# [1.105.0] - 2022-08-25

### Added
- Added the ability to get the value of the column selected in the settings when clicking on a table row
- Added the ability to follow various links from chamomile petals on the geo-dashboard
- Added the ability to put a bitmap image file under SVG
- Added regression line for scatter plot
- Saving/loading a theme as a file
- The ability to set a token by clicking through the drop-down list

### Fixed
- Multiline. Rounding stopped working for data signing
- Multiline. The first metric for the X-axis is not perceived

# [1.104.0] - 2022-08-18

### Added
- Ability to change the map layer using tokens
- Added token transfer to datepicker

### Fixed
- The signature of the edges of the graph does not work out after exiting the move mode
- Fixed transitions when clicking on html elements on the map
- Fixed resetting under the filter using the common button
- Fixed the go event when transferring tokens using spaces
- When using tokens, additional spaces appear
- Tabs scroll disappeared
- Fixed grammatical errors
- Several signatures are not visible in the gant component along the X axis on a light theme
- The bush diagram is drawn only after restarting the source data
- The Ctrl+ hotkey in the code editor does not work

# [1.103.0]

### Added
- Added the ability to edit the legend name in the GIS component
- Schemes constructor: added a panel of key maps
- Added the ability to reset the filter of the internal table

### Changed
- Changed the text of some "Edit" buttons on "Apply"

### Fixed
- The settings for map primitives are applied only after the page is reloaded
- Events: When using parameters with a space, events are not processed

# [1.102.0]

### Added
- Added a size limit when uploading svg of 1 MB
- Added font size settings for the text block in the constructor schemes

### Changed
- The old version of the yFiles library has been removed
- Changed the color of the table border in the table component
- Changed popup-menu position on heatmap
- The position of the pop-up menu on the heat map component has been changed

### Fixed
- Onclick event does not work in the SVG component
- It is not possible to hide the header in the dial component
- On the heat map, when you hover the mouse cursor over a line, a detail window appears, which closes the view
- in the date picker, some examples do not fit in the frame
- Background color of the heatmap tooltip in data research
- Fixed a problem with resetting the manual filter part

# [1.101.0]

### Added
- Added visualization of a scatter chart
- The button component now has the option to choose which tokens to update on click
- Ability to paint the area between the line and 0 on a multiline chart
- Ability to change the metric for the x axis on a multiline chart
- Ability to move tabs on the dashboard
- Ability to divide a number into digits in the SingleValue component
- Added settings for label in the Constructor-schemes component
- Added ability to remove ports in the Constructor-schemes component
- Added inability to add a label to the "port" in the Constructor-schemes component
- Added scrollbar for the event list on a dashboard

### Changed
- Changing the position of edge signatures in the Graph component

### Fixed
-- Changes in ports and standard elements in the Constructor-schemes component
- Component graph breaks after restart
- Problem with association tokens with Select visualisation
- When exporting dashboards without selected elements, the resulting page wasn't found
- Data source not loading when entering the dashboard
- The "visible" option does not work on the component
- Fixed display metric on yGraph edges
- Fixed incorrect arrows on yGraph edges

# [1.100.1]

### Fixed
- Missing token name after renaming

# [1.100.0]

### Added
- The ability to set the time format of numbers in the filter
- Constructor schemes: ability to edit edges
- Constructor schemes: The order of the elements display
- Added an error message about out-of-order elements in the "_order" field

### Changed
- Changed the method of requesting the status of the job from GET to POST ¹

### Fixed
- No additional tokens are passed in the Header component
- Settings do not open of SingleValue component
- Bug when the label can be moved outside node in schemes constructor
- The component is displayed incorrectly when editing the data source 
- Bug when changing the data source when the tune slider thumb is in the wrong position
- Fixed dashed border in a corner of text block in schemes constructor
- Fixed incorrect token updating of the textarea component
- Fixed readability and alignment of the Graph component
- The ability to select an edge when hovering the cursor in the Graph component
- In the header of the component infinite loading
- Bug when the labels of the graph vertices overlap each other
- Constructor schemes: Disabled focusing on elements

#### ¹⁾ Changed the method of requesting the status of the job from GET to POST
- Minimum required OT simple REST version: 1.13.0

# [1.99.0]

### Added
- Tooltips with a describing OTL commands in data exploration
- Notification if the field specified for the default data source isn't found

### Changed
- Appearance of the "Not found" page
- Notifications have become more compact

### Fixed
- Position of the open list of the "select" component
- Typo in the svg upload field placeholder
- Bug with color if change metric position in the Single Value component
- The problem with going beyond the boundaries of the "Tune" component after restarting the Data Source
- If you select the Option to select multiple values, the default value is added to the drop-down list
- The name of the token in the list of tokens disappears when navigating through the tabs
- When creating a token, it is not possible to select properties in the drop-down list if the component was just added

# [1.98.1]

### Fixed
- Fixed empty lists of users, groups, indexes in group editing mode

# [1.98.0]

### Added
- Added transitions to other dashboards when clicking on a tile in the "Tile" component
- Added event handling in the "Tile" component
- Updated the "yFiles" library to version 24.0.5
- Added the "schema constructor" component
- Added the ability to upload SVG to the server ¹

### Fixed
- Fixed error messages fo password un profile
- Fixed the tooltip display after switching the move mode in the "yGraph" component
- Fixed visualization height in data exploration 2.0
- After selecting the date, you cannot enter other data
- Frozen versions of third-party components
- Fixed the styles of the user menu
- Fixed text color on the Tile component
- When clicking on the text in the table cell, the token was not updated

#### ¹⁾ Added the ability to upload SVG to the server
- Minimum required ot-simple-rest version: v1.13.0

# [1.97.0]

### Added
- Password length is limited
- Added visualization circular dial

### Fixed
- When changing username, the old value remained on the panel
- Fixed the logic of displaying the signature of the nth item on the multiline
- Dash Table: when saving the settings, the checkboxes for the columns were removed
- fixed logout on reboot

# [1.96.0]

### Fixed
- Fixed user deletion in profile
- Fixed datepicker visualisation
- Fixed zooming of a multiline in the Data Research 2.0
- The order of rendering lines on the multiline has also been changed
- Fixed selection the default source data in dash settings
- Fixed piechart visualisation
- Problem with data increment on request

# [1.95.0]

### Added
- Added new picker button to dash picker
- Added general settings for panels
- Added the ability to hide the name of the panel
- Added the ability to update the source data by the panel icon
- Added the ability to hide the background color on panels
- Added the ability to add a download icon to the panel
- Added a setting for hiding/displaying a full-screen icon on panels
- Removed the limits on 1000 rows in the Data Research 2.0 ¹
- Added the ability to configure the source data for the default component value

### Fixed
- Fixed the datepicker visualisation
- Changed icons for menu, tune and accumulators visualisations
- Fixed dashboard save edit/drag/resize state
- Fixed text color in code editor in the Data Research 2.0 if selected custom color theme 
- Fixed resizing UI dashes without background
- When selecting an area on the multiline, a tooltip is displayed on the barplots
- Fixed spaces around text in tokens from table
- Fixed loading bar
- Fixed the save dashboard dialog has no frame
- Updated drawing of points on multi-line lines
- Fixed fullscreen multiline

#### ¹⁾ Removed the limits on 1000 rows in the Data Research 2.0
- Minimum required ot-simple-rest version: v1.12.0
- It is necessary to set the same limit on the number of events in ot-simple-rest and in Apache Spark dispatcher

# [1.94.0]

### Added
- Added the menu component
- Added icons to header actions
- Updated the settings design and added chart groups in the multiline component
- added legend highlight on the multiline component
- added ability to bind the Y axis in the multiline component
- Added input data validation in the textarea component
- Added font settings in the textarea component
- Added transition on click to map

### Fixed
- Fixed the use of tokens in the name of the single value component
- Fixed piechart legend in big size mode
- Fixed "missing _order" error if order exist in edited data source in the single value component
- Fixed sending the username during data exploration
- Fixed big size visualisation mode

# [1.93.0]

### Feature
- Added the data source setting for its autorun immediately after loading the dashboard
- Add pipeline parameters to the map component

### Fixed
- Fixed data source export
- Fixed modal windows behavior
- Fixed an error when selecting numeric data in the select component

# [1.92.0]

### Feature
- Added full-screen mode for visualization
- Added options mode tune and accumulators visualisations
- Added title actions in settings for visualizations
- Added layers to the map

### Fixed
- Fixed colors in the "accumulator" component
- Fixed the order of metrics in the "single value" component ¹
- Fixed an error in the "single value" component when changing the data source
- Fixed the title of the actions
- The old reports page has been deleted
- The papers page has been deleted
- Removed the title actions from the reports visualisations
- Fixed an error in the modal visualization console
- Fixed an error when pressing Esc in modal visualisation

#### ¹⁾ The "Single Value" component now requires an additional field

In the returned data, there should be a "_order" field in each data row.
System fields that are not output data (for example, "_title") should have empty order field.
The "_order" field must be a positive number and the values for different rows must not be repeated.
The values of "_order" should go in order without omissions:
- 1,4,3,2 - it is possible
- 1,4,2,5 - not allowed (3 is missing here)

# [1.91.0]

### Feature
- Added a code editor to Reports 2.0
- Added a new Accumulators visualization

### Fixed
- Fixed the text color of the active date picker
- Fixed tokens in csvg visualisation
- Fixed csvg popup
- Fixed color picker background


# [1.90.0]

### Feature
- Add donat mod to pieChart
- Optimization of visualization classes for gant, pie chart, graph.

### Fixed
- Multiline. Some chart line display settings do not work
- Fixed gantt infinite reloading
- Fixed dash button styles
- Fixed theme styles

# [1.89.0]

### Feature
- Optimization of visualization classes
- Data exploration 2.0: additional export in format xlsx

### Fixed
- Fixed the URL of the export link url in Export/Import popup window
- Fixed map modes
- Data exploration 2.0: fixed styles and added a horizontal scroll bar

# [1.88.0]

### Feature
- Added hotkey for query window in data research v2

### Fixed
- Data exploration 2.0 gantt: the date format setting for the Gantt chart does not apply
- Changing the osm server in the map settings
- Default osm server and default search in map settings
- Maps tooltip
- Displaying histograms with negative values on a multiline dash
- The width of the histogram is now only positive

# [1.87.0] Notifications, added prefix /eva

### Added
- Pop-up notifications
- Color picker for custom pie chart settings
- The prefix /eva has been added to the URL

### Fixed
- Error with token change in the "dashSelect" component,
- Drawing a list values in the "dashSelect" component
- Data exploration 2.0: visualization improvements
- Visual inaccuracies in the Piechart component

# [1.86.1]

### Fixed
- Fixed theme styles

# [1.86.0] - Data research 2.0, multiline fixes

### Added
- Visualisations in Data research 2.0 (ygraph, bush, map, heatmap, singleValue, tune)
- Visualization settings in Data research 2.0
- Logout form all browser tabs
- Added display of a message about the lack of data on the visualization "tile"

### Fixed
- Range selection on the multiline dash
- Redrawing the dash multiline when changing the main theme
- A metric styles bug in "united" option on the dash multiline
- The text color on the Y-axis of the dash multiline
- The problem of cropping the axis text in full-screen multiline mode
- The histograms have been moved beyond the lines on the dash multiline
- internal mechanisms of Data research 2.0
- Graphic design of Data research 2.0
- Old filters apply to new queries in Data research 2.0
- The timeline change column in Data research 2.0
- Data research 2.0: some visualizations are not displayed immediately after selection
- White areas in SingleValue
- Operation of modal windows for creating, confirming and working with the profile
- Data from the previous query was saved in a new selection in Multiselect
- Fixed removal of the display of the "Select data source" button immediately after creation
- Incorrect list in export dashboard list
- Reloading the bush dash when Data Source changes
- Resizing movable visualisation
- Tune resizing
- Updating and undoing filter parts changes
- Fixed the color of the number of lines per page.
- Fixed color and layout in the dropdown menu on the "statistics" tab.
- Fixed zoom buttons on the timeline.
- Fixed styles in form elements


# [1.85.0] - Token update when executing a go event, visualisations in data research, multiline

### New
- Added the ability to update tokens when executing a go event
- Visualisations in datа research 2.0.
- Added tab deletion confirmation

### Fixed
- The operation of the multiline component has been updated.
- Updated styles in the GIS component.
- Single value metadata and ranges if the boundaries coincide - incorrect processing
- SingleValue Color setting for indicators via the Ranges button
- Piechart color rgb and legend position
- Calendar in data source
- Problems with hiding columns in the table.
- Fixed problems with creating and editing dashboards and groups.
- Fixed a problem with renaming data sources.
- Fixed switching by event to tabs in the heat map.
- Fixed the theme of styles
- Fixed synchronization of selection of pie chart fragments


# [1.84.0] - Fixed dashboard filters, multiple tokens

### New
- Multiple tokens

### Fixed
- Dashboard filters. Name and content
- Visible zoom button
- Setting the title breaks the scrolling of the component
- Guntt full screen improvements
- Searching by bool type
- Fullscreen improvements tune

# [1.83.1] - RELEASENOTES fix

### Fixed

- Release name

# [1.83.0] - Zoom for all multiline charts

### New

- Ability to zoom all multiline graphs
- Ability to zoom out by double-clicking on a multiline
- Frame for the event window

### Fixed

- Selecting an object after changing dash setting
- Token with an empty name
- Name restriction for tokens
- Visualization. Time selection. Parts of a component are rendered outside of the component's bounds
- Component checkboxes have undefined status
- Dash single value title
- Setting theme
- Sizing a filter
- Dashboard component
- Button hints
- Switching between filter types
- Cell size in tile visualization
- Missing error signal in datasource exc request
- Tile visualization not showing after datasource restart
- Dash single value settings no closes

# [1.82.0] - Positioning elements on the dashboard, fixed dashboard filters

### New

- ghooks lib for running ESLint before commit

### Fixed

- Fixed dashboard filter
- Fixed ESLint errors and warnings
- Optimized pipeline information processing in dashMap
- Added a frame for the event window
- Fixed node label name in YGraph
- Fixed the initial position of dash
- Fixed dash z-index
- Fixed tooltip z-index
- Fixed tooltip width
- Fixed table events
- Fixed dash single value title
- Fixed rename dashboard
- Fixed save table settings on change fullscreen view

# [1.81.0] - Searching & reporting 2.0.

## New

- Searching & reporting 2.0.

# [1.80.0] - Closing single value modal on click outside and bugfixes.

### New

- Closing single value modal on click outside.

## Fixed

- Fixed render a lot of tooltips for dashMap component.
- Fixed a problem with displaying some multi-line bar graphs.

# [1.79.0] - Pop-ups and tooltips in graph component and bugfixes.

### New

- Tooltip with information when hovering over an edge in a ygraph component.
- Pop-up information about a node or edge in the graph component.

### Bugfix

- Multiline graphs are not rendered without resaving the settings.
- Fixed the data download button in the data source.
- Date is displayed with zeros on the multiline.
- Fixed merging of multiple multiline settings.
- Use the width of the bar chart only if there are bar charts.

# [1.78.0] - Default token "evaTknLogin" for username in searches and bugfixes.

### New

- Default token "evaTknLogin" that will be replaced by current username.

### Bugfix

- Fixed the management of custom colors of the pie component.
- Fixed focusing on the reset button of the filter part.
- Fixed the bug of dragging the graph component.

# [1.77.0] - Barplot display styles of multiline, sticky header and bugfixes.

### New

- Added barplot display styles of multiline.
- Updated sticky header and filter.

### Bugfix

- Fullscreen dash mode size.
- Position of the top menu, it was non-clickable.
- z-index on the boards.
- Zoom-out button in multiline dash.
- Reordered visualization settings.
- Corrected mistakes in texts.

# [1.76.0] - Filters for YGraph componet, selection property in events of select component and bugfixes.

### New

- Filters for YGraph with save settings in storage.
- Selection property in events of select component.

### Bugfix

- Slider component fixed syncing with fullscreen.
- Fixed multiline barplot id.

# [1.75.0] - Redirect to a specific dashboard tab from heatmap, ticks of several Y-axes are combined on multiline and bugfixes.

### New

- Redirect to a specific dashboard tab from heatmap.
- Combining ticks of several Y-axes.

### Bugfix

- Fixed default names for filters and tables.
- Fixed the ability to drag the slider component.
- Settings are always above visualisations.
- Fixed data column selection in slider component.
- Fixed scrolling in the components, data, markers menu.
- Fixed broken line charts.
- Fixed a problem with changing the settings of single value component.
- Zoom reset btn for all multilines.
- Zoom reset on fullscreen.
- Reduced reset zoom time.
- Fixed filter range for points and zoom multiline.

# [1.74.0] - New slider vizualization, tokens in filters and bugfixes.

### New

- Brand new slider vizualization.
- Ability to use a token in the name of filter part.
- Additional properties for hotkey ctrl+\ .
- Ability to select strings in X-axis label.
- Ability to use multiline select as filter for other datasourses.

### Bugfix

- Optimized graph component performance.
- One zoom for all graphs in seperate mode.
- Details menu for not email fields.
- Fixed the textarea in full screen mode, changed get current value.
- Fixed hiding columns in tables.
- Multiline full screen zoom.
- Fixed a bug with updating the values of a newly created sub filter.
- Fixed the display of the slider component after the update.
- Fixed fullscreen mode for slider component.
- Fixed a problem with selecting/unselecting all items in the multiselect component.

# [1.73.0] - Click token for heatmap component, multiline zoom refresh and bugfixes.

### New

- Click token for heatmap component.
- Multiline zoom refresh.
- Closing the settings popup by clicking outside the popup.

### Bugfix

- Fixed the datepicker in the dataset popup.
- Fixed filter range for points and zoom multiline.
- Theme in json primitives text area.
- Added check for length of array metrics in manual filter and fixed save filters and use in other components.

# [1.72.0] - Tokens in visualization titles, coordination choice in map component and bugfixes.

### New

- Choice of coordinates by clicking on the map.
- Tokens can be used in visualization titles.

### Bugfix

- Grid show checkbox on dashboard.
- Fixed open settings for Picker component, added default titles.
- Full screen textarea.
- Default token value.
- Ability to zoom barplot.
- Labels on OX axis.
- Fixed hiding graphics when loading data.
- Bug with update data search.
- Hide the progress bar on the heatmap if the value is empty.
- SingleValue render metrics when changed data for dashboards.

# [1.71.0] - Default token values. Search rows limitation, shortcut for line break. New font in SingeValue. A lot of bugfixes.

### New

- Ability to set a default token value for if its value isn't set.
- Ctrl+/ hot keys to automatically line break in dashboard data sources and "Searching and Reporting".
- Added switch to enable/disable opening dashboard in new window in HeatMap component.
- Maximum number of rows in response data is automatically limited to 1000 in "Searching and Reporting" and can be limited in dashboard searches too.
- DatePicker component has been translated into russian.
- Multiline barplot bars are now centered.
- Redesigned single value from design template.
- Added font weights 100, 200, 400, 500, 800 for SingeValues component.

### Bugfix

- Set default color for a new dashboard group.
- Problem with canceling changes in SingleValue component when we don't want to save them.
- Fullscreen mode of SingleValue component.
- Issue with movable elements in SingeValue settings, updated move for burger icon.
- Fixed colors for metric values in SingleValue component.
- Bug with template selection in SingleValue component settings.
- Active component on dashboard now has higher z-index.
- Increased the height of request text in data source modal windows.
- Multiline captions rotation on the x-axis.
- Multiline incorrect drawing charts height in fullscreen mode.
- Problem with tooltips not disappearing after clicking buttons.
- Problem with renaming dashboards and groups.
- Problem with position of the datepicker in the pop-up of the data source.
- Problem with scheduler id loss after refreshing page.
- Fullscreen mode of Map component.

# [1.70.0] - PieChart tooltips, new MultiLine settings including bar appearance for lines

### New

- Tooltips for PieChart visualization.
- Ability to select pies in PieChart by clicking legend.
- Ability to add additional yAxis for MultiLine component.
- Ability to bind metrics to the left or right yAxis for MultiLine component.
- Ability to change line appearance to BarPlot on MultiLine.
- Assigning a value to a PieChart token.

### Bugfix

- Unauthorized users weren't redirected to login page if they tried to open dashboard url.

# [1.69.0] - New multiline settings and tooltip changes, color picker for groups and bugfixes

### New

- Added new settings to multiLine component: 'isDataAlwaysShow', 'xAxisCaptionRotate' and 'barplotBarWidth'.
- Changed multiLine component data-tooltip visual style.
- Color picker for dashboard groups now contains preset colors from theme, and also you can create a custom one.

### Bugfix

- Plus and exim buttons are now displaying correctly while on groups/dashboards selection page.
- Resize handles are back visible while resizing components on dashboard.
- Rows in tables doesn't disappear anymore while clicking them.
- Added data source name to header of visualizations again.
- Infinite loading of created datasource in datasource panel.
- Bug with visual elements drops far to the bottom of the page.

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
- Heatmap updates properly when the value in the select (token) is changed.
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
