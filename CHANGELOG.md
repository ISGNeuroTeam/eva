# __CHANGELOG__

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- piechart tooltips
- select pie of piechart by legend
- ability to add an additional yAxis for multiLine component
- ability to bind metrics to the left or right yAxis for multiLine component
- ability to add some barplots and linecharts for multiLine component

### Changed
- Assigning a value to a piechart token
- DEV: added beforeEach hook in router to redirect unauthorized users

### Fixed
- unauthorized users weren't redirected to login page if they tried to open dashboard from

## [1.69.0]
### Added
- multiLine component 'isDataAlwaysShow', 'xAxisCaptionRotate' and 'barplotBarWidth' settings
- DEV: _colors.sass file in main sass directory

### Changed
- multiLine component data-tooltip visual style
- color picker for dashboard groups

### Fixed
- changed position of plus and exim btns on visualizations
- add color to handlers for resizing
- bug with disappearing rows in tables after repeated click
- added data source name to visualizations again
- infinite loading of new datasource
- bug with visual elements drops far to the bottom of the page

## [1.68.2]
### Fixed
- bug with visual components get stuck at the top of dashboard

## [1.68.1]
### Fixed
- removed multiline changes from [CHANGELOG](CHANGELOG.md) and [RELEASENOTES](RELEASENOTES.md).

## [1.68.0]
### Added
- GIS. value mask for coordinates in map component

### Changed
- removed scroll ability with shift+wheel on tab panel
- token and operation selectors in filter part modal are disabled out of edit mode
- values in token type filter part are cleared only after switching tokens
- full screen mode for all visualizations has a persist height
- GIS. show all pipes on monitoring mode

### Fixed
- bug with infinite scroll on tab panel
- displaying all existing dashboard tokens in filter part modal
- problem with render gantt and opening in full screen mode
- correct render of several gantt diagrams in dashboard
- GIS. fix width of modes in map component
- bug with data for full screen single value

## [1.67.0]
### Added
- heatmap progress-bar for the full table cell width
- setting heatmap table cell color from 'background_color' metadata key
- heatmap progress-bar sizes set to 200 (min) x 50 px
- reverse icon status for filter parts
- go to dashboard event
- compare event for table to color rows, cells and columns

### Changed
- moved some controls of filter panel to dashboard 'edit' mode
- tabs on filter setting modal window are now hiding when only manual input is available
- max width of filter part title restricted to 250px

### Fixed
- when logged as regular user 'log out' options in dropdown menu was hidden on dashboard page
- clicking reset filter part item doesn't give any visual feedback
- 'add new filter' button are now displaying correctly
- redrawing pie chart after token changes

## [1.66.0]
### Added
- zoom in/out and fitContent control buttons in graph component
- control buttons on graph component disabled when data is loading
- overflow dots in tab panel from right and left sides of panel
- scroll without shift of tab panel
- can take token from fullscreen table
### Changed
- max width of tab is 200px

### Fixed
- bug with custom themes crushing application
- problem with data source reloading when switching tab on dashboard
- bug with gantt diagram colors and tooltips

## [1.65.0]

### Changed
- UI of filter row in filter panel
- 'token' type filter parts are sorting by the count of values in them click after "accept changes"

### Fixed
- log icon highlights after error in search
- heatmap is not updated when the value in the select is changed
- problem with disappearing graph while zooming
- problem with move elements to dashboard

## [1.64.0]

### Added
- filter panel to dashboard
- unit setting to multiline component
- submit button while editing tab name
- value styles for single value component
- theme support in map component settings

### Changed
- inability to do anything with other tabs while editing one
- log button moved back from dropdown list to header

### Fixed
- hover on first row in table
- time format on x-axis while zooming
- header height equal in main menu and dashboard
- double header after incorrect search
- dash filter styles and UI

## [1.63.0]

### Added
- tabs on dashboards
- ability to enable/disable tabs on dashboard in dash settings
- ability to pin certain visual component on all tabs
- global rbg CSS variables for theme colors (only HEX was before)
- SingleValue visualization
- data source for pipeline monitoring mode

### Fixed
- bug with dashboard without elements after tabs integrations
- bug with captions not moving while zooming on MultiLine

## [1.62.0]

### Added
- tokens for maps

### Fixed
- bugs with main header
- bugs with table component header

## [1.61.0]

### Added
- new mode for map monitoring

### Changed
- heatMapGeneral visualization component renamed to heatMap
- changed header for project and dashboards, fixed bug with header for tables

### Removed
- first heatMap visualization component and its styles

## [1.60.0]

### Added
- heatmapGeneral visualization
- heatmap visualization
- heatmap metrics aggregation
- heatmap custom x, y, data, metadata fields
- heatmap ssp aggregation in watch
- custom theme creation
- image background from theme
- custom theme editing and deleting
- theme support in graph component

### Changed
- modal for selecting current application theme

### Removed
- old color props from default themes

### Changed
- heatmapGeneral table cells border and table width
- heatmapLinear component styles and visible value

## [1.59.0]

### Added
- root component App.vue to define global css variables
- add user settings to map component (zoom step, initial zoom level)
- add legend to map component

### Changed
- new color schema for light and dark themes
- styles in all main gui components to support new color schema
- styles in all visualization components on dashboard and search&reporting

## [1.58.0]

### Added

- custom styles for layout objects on map (ex background color, text, html markup, highlighting)
- sort in table component
- add setting to show specific titles in table component

### Changed

- dashboard opens for viewing (not editable by default)
- turn off clustering in map component

## [1.57.1]

### Fixed

- version into package.json

## [1.57.0]

### Added

- component map v1

### Changed

- Jenkinsfile


## [1.56.0]

### Added

- choice visual or not visual search button for textAria component
- bush v1
- fastForward all search in dashboard (experimental)
- no visible arrow in look view mode in select component

### Fixed

- "суфикс" to "суффикс" in token dashboard

## [1.55.0]

### Added
- choice of null result: either past or zero for Table, Single, MultiLine
- btn download data in header component
- graph yfiles component


## [1.54.0]

### Added
- no visible arrow in look view mode in csv components
- custom scrollbar for Application (google Chrome)
- hide logs for not admin_all Permissions

### Deleted
- light theme

### Fixed
- fix color icons in dashboard header(color - white)
- font for application (proxima nova)

## [1.53.0]
### Removed
- graph yfiles component
## [1.52.0]
### Added
- add graph yfiles component
## [1.51.0]
### Fixed
- set asynchrony all create components. Then draw only one component per time. Then get data from rest throw web worker.

- use another array of color for annotation

- reused load file

- fix download throw event

- loose reactivity from multiline (settings don`t apply before)

- understand space in name of file in event

### Changed

- change work with component on grid table

### Added
- add cell grid for dashboards

- new plugin, whom create papers (reports) from template and give link on download and preview

- add set token in single

- new component pie chart

## [1.44.26] [newSetting]
### Adde

- put theme setting in back and check on front

## [1.43.26] [checkImpExp]
### Fixed

- add check which kind of file user want to import (groups or dashs)

## [1.43.25] [heightTabel]
### Fixed

- correct height table in reports and dashboards

## [1.43.24] [colorSelectExport]
### Fixed

- fix color of select in Export/Import component

## [1.43.23] [limitlessCheck]
### Changed

- delete limit iteration in getDataApi

## [1.42.23] [improveBarChart]
### Changed

- change bar chart component

## [1.41.23] [tooLargeLogs]
### Fixed

- cut logs until he don`t abowe 5 megabait

## [1.41.22] [oneSearchMultiSelect]
### Fixed

- set tocken function will be work only on blur event

## [1.41.21] [currentTime]
### Fixed

- fix time  amd set seconds, when we choose last some time

## [1.41.20] [statisticField]
### Fixed

- fix check open/close in statistic block

## [1.41.19] [improveYAxis]
### Changed

- change caption tick of Y axis

## [1.40.19] [underlineButton]
### Changed

- change underline of Button, use text-decoration

## [1.40.18] [underlineButton]
### Added

- add underline of text in Button

## [1.39.18] [styleLineMulti]
### Changed

- style of text ticks in multiline and add zero line

## [1.38.18] [negativeValueBar]
### Added

- add negative value to bar

- check zero value

## [1.37.18] [twoMulti]
### Fixed

- fixed brush fraw on time line

## [1.37.17] [brush]
### Fixed

- add custm brush instead d3.brush

## [1.37.16] [addQuis]
### Added

- add new squar in main page to open Quis

## [1.36.16] [SNMNGC-223]
### Added

- add new event on click open

## [1.35.16] [coupleBugs]
### Fixed

- color in dark theme

- color of chart same as color in legend

- zoom change also dot label and line vertical

- infinity loop - reason in call setMetricsMulti in computed getDataRest. made throw watcher

## [1.35.15] [linesOnChart]
### Added

- add vertical line on charts

## [1.34.15] [fontButton]
### Added

- add font-size button in settings

## [1.33.15] [labelDotChart]
### Added

- set dot of "_name_caption" and add caption

- lastdot set in settings

## [1.32.15] [selectTypeAndBorderMulti]
### Added

- select wich type of chart we need

- cut data of chart of Y axis

## [1.31.15] [invisibleSelect]
### Fixed

- fix color in light theme of Select component

## [1.31.14] [colorTheme]
### Changed

- change switch color theme

## [1.30.14] [notContainTable]
### Fixed

- fix height of table, when table don`t have footer

## [1.30.13] [addSomeColor]
### Added

- added another color to multiline

## [1.29.13] [addGridtoLinechart]
### Added

- added grid to line chart and multiline chart, but in multi in sepatated view don`t show horizon line of grid

## [1.28.13] [orderTooltip]
### Fixed

- order in tooltip should same? that in legends

## [1.28.12] [lastDot]
### Added

- last dot always visible

- caption of value for last dot

## [1.27.12] [zeroCsvg]
### Added

- add check for element, maybe it was, but later it`s desappear

## [1.27.11] [hideHeaderPanel]
### Changed

- left icon profule and save in view mode

## [1.26.11] [hideHeaderSvgTile]
### Changed

- hide header of csvg component and redraw svg

- hide header of tile component

## [1.25.11] [doesntWorkSaveDash]
### Fixed

- not send properties color to dash-profile component

## [1.25.10] [toLargeTable]
### Fixed

- removed margin of table in S&R

## [1.25.9] [brokenMultiline]
### Fixed

- fixed linechart. I`m use this.id, but should use that.id

## [1.25.8] [linechartCut]
### Changed

- border-color Table

- filed textarea equal search button

- loader of dash make fatter

## [1.24.8] [linechartCut]
### Fixed

- fix cut linechart, same error that multiline, same id of clip

## [1.24.7] [darkTheme]
### Changed

- change on dark theme

## [1.23.7] [workonSelect]
### Changed

- filtered item of list

### Added

- find row

- Select all row

## [1.22.7] [TextAreaRebranding]
### Changed

- autoheight of line textarea

- press enter to set token

## [1.21.7] [twoCsvgBug]
### Fixed

- problem with set captures to actions. They not situated in computed. They should set in watch. Example in Cavg and Tile.

- Also fix disable setting tooltip of second svg element on page. I check only " == 'csvg'", but i should use indexOf.

## [1.21.6] [cutMultiline]
### Fixed

- all about same id of clip-path in all page. I choose to add uniq id (of elements) to id. Like that - clip-multiline-3 (for example)

## [1.21.5] [styleLineChartTooltip]
### Changed

- change style of tooltip in LineChart component

## [1.20.5] [deleteSpaceInSelect]
### Changed

- change space between arrow and select in Select component

## [1.19.5] [connectionRow]
### Fixed

- use value from connection row? not from data row

## [1.19.4] [multiselectCut]
### Fixed

- cut when multiselect choise several row. Now with scroll

## [1.19.3] [zIndexUnvisibleElem]
### Fixed

- fix z-index parent when elem unvisible

## [1.19.2] [sparkSvg]
### Fixed

- fix spark svg and back sbg to default capture

## [1.19.1] [checkCsvg]
### Added

- add style to date picker element

## [1.18.1] [checkCsvg]
### Changed

- check and fix csvg that this element clear svg and update svg on new custom capture

## [1.17.1] [legendMulti]
### Changed

- change legend fro Multiline

## [1.16.1] [tooltipMultiLine]
### Fixed

- opacity extra Dot

### Added

- add check when tooltip over bottom

## [1.15.1] [scrollTable]
### Changed

- delete scroll table

- remove footer when data.length < 100

- set per-page [100,500,1000,-1]

- set xlsx to download search

## [1.14.1] [levelDatePicker]
### Changed

- change set z-index not form dash-layout, but vdr (moveable.vue)

## [1.13.1] [styleTooltipGantt]
### Changed

- change style tooltip without description

## [1.12.1] [setTickMultiLine]
### Changed

- add check size of elements and fix tick in Multiline

## [1.11.1] [addCaptureToSvg]
### Changed

- attributes form svg elements set not with token, but with capture of data

- change tile border, that tile can paint border in fidderent color

## [1.10.1] [borderTile]
### Added

- border in Tile

## [1.9.1] [svgTooltipClickToken]
### Added

- add click to button in tooltip

## [1.8.1] [improveTile]
### Changed

- add width and height to option in Tile

## [1.7.1] [backToPixel]
### Changed

- back to pixel when resize and remove

## [1.6.2] [doubleTile]
### Fix

- fix bug with double tile on dashboards

## [1.6.1] [cssChange]
### Changed

- all colors in project colors

## [1.5.1] [arrowCsvg]
### Fixed

- fix error with indefined options.tooltip, add check on options.tooltip is exist

## [1.5.0] [mouseOver]
### Added

- add tooltip on mouse over in csvg component

## [1.4.0] [imExp]
### Added

- add expor import dashboards/groups

- add export search to csv file

## [1.3.10] [fixAdaptiv]
### Changed

- change adaptiv (remove Math.floor, add toFixed(1))

## [1.3.9] [filter2.0]
### Added

- add filter to not value (!value)

## [1.3.8] [stringToken]
### Added

- add some field in token (prefix,sufix, delimetr)

- add view mode of token

### Changed

- multiselect instead a normal select

## [1.3.7] [multiline2.0]
### Added

- add second mode in multilineChart, that he can draw every line separeted

- change tootlip from united multiline mode, that he can show all metrics in current point

## [1.3.6] [filtrData]
### Added

- add new Event on filter data

## [1.3.5] [hideHead]
### Changed

- hide all elements exept name of component when switch look

- remove most margin and padding from most component

## [1.3.4] [stable]
### Changed

- change check options when open modalSetting

- disable loading from button

- fix color from table

## [1.3.3] [fomtSizeOption]
### Changed

- cut name of group/dash on main page

- font-option for single value

## [1.3.2] [modEvent]
### Added

- add change elements  value whom have a need token after move on dashboard after event

## [1.3.1] [dealWithSearch]
### Changed

- change look of modal of search and add adaprtiv in same time

## [1.3.0] [adaptiv]
### Added

- add adaptiv for elements and S&R

## [1.2.11] [fixMulti]
### Changed

- made space between line if value is 0

## [1.2.10] [fixGuntt]
### Changed

- no rotate for x axis

- text on block in the middle

- legend on the right

## [1.2.9] [workToImproveS&R]
### Changed

- fix scroll in search window

- change size of S&R

- add other vizualization (tile,csvg)

- fix multiline to draw one point

## [1.2.8] [Csvg]

### Changed

- add upload btn

- replace token in csvg

- add token and event

## [1.2.7] [modGraph]
### Changed

- fix bug with load dash from back (reactivity losing)

## [1.2.6] [modPlate]
### Changed

- fix bug with cut search sid

- rename Plate to Tile everywhere

- add event to Tile


## [1.2.5] [CSvg]
### Added

- add new component Svg image

## [1.2.4] [hotfix_nocache]
### Changed

- add check nocache status and count that response

## [1.2.3] [hotfix_schema_problem]
### Fixed

- start using SCHEMA for prepare data

## [1.2.2] [fixDateSearch]
### Fixed

- problem with select data for search in Search and Reporting

## [1.2.1]
### Changed

- change LineChart and MultiLineChart, that they can work with just numbers, not only wit timestamp

## [1.2.0]
### Added

- new component Plate

## [1.1.0]
### Added

- new component Guntt based on D3 (instead Guntt based on Google charts)

## [1.0.0]
### Added

- autorization page
- user panel
    - return to "main" page
    - return to page before
    - log
        - put log
        - clear log
        - restore log
    - edit user profile
        - role modal page with this items - users, roles, permissions, groups and indexes. Every item can create, edit, delete if you obtain right permission.
    - exit on autorization page (clear cookie and store)
- dashboarding constructor
    - page with all available groups and all available dashboards inside current group (create, edit, delete group/ dashboards)
        - dashboard page

            - top panel

                - switch display mode

                - color settings panel

                - event panel

                - token panel

                - search panel

                - tool panel (vaizualization itself)

                - user panel

                - save dashboards

            - dashboard

                - top panel dashboard

                    - icon

                    - name

                    - id

                    - search sid

                    - choose search

                    - resize dashboard

                    - change position dashboard

                    - edit name dashboard

                    - settings dashboard

                    - delete dashboard

                - vizualization block

- search and reporting
    - statistics block
    - search block
        - start search
        - setting search
    - vizualization block
