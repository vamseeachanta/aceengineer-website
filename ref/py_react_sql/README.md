# Software Engineering Exercise

Welcome and thank you for taking the time to join us today to continue the interview
process for a software engineering role in Quantum Energy Partners.

The purpose of this assignment is to allow you to demonstrate your proficiency
by completing an exercise within the typical technical duties of this role as well
as providing an opportunity to demonstrate your ability to process, synthesize,
and communicate key information to the team.

## Assignment

Your assignment is to create a simple application to browse, analyze, or edit
the provided dataset. The application functionality should be simple, and
appropriate to the provided time, but should demonstrate your ability to
organize an application into typical components, such as front-end, back-end,
database, etc. The actual functions of the application are entirely your
choice, and may or may not include editing of data, or any additional data
tables, maps or graphical displays, or dashboard like functionality.
It should also use relatively modern approaches (API, SPA, PWA, etc)
although these exact choices are up to you. It may be either a desktop or
mobile app, but it must be a web-based application.

You may use any languages and/or frameworks you wish for the developing the
application. You may use any open source components you wish, but you must
clearly indicate which has been authored by yourself as part of the
assignment. The application must run in docker on a windows desktop
installation. A skeleton docker compose file has been provided in the repo,
you modify this in any way required.

## Deliverables

The entire deliverable will be the contents of this git repository, including
the commit history. The application itself should be executable by running
`docker-compose build && docker-compose up` from the root directory of the
cloned repository. Any documentation of your code, architecture, etc.
should be committed to the repository as simple markdown files and/or
images.

You should be prepared to  present your work in a short session (up to one
hour) in which you should:

1. Demonstrate the usage of your application
2. Walk us through the architecture of your application
3. Discuss any design tradeoffs you made, based on time considerations
4. Suggest how you would change or evolve things given more time
5. Discuss deployment requirements

## Data Set

A sample data set can be found in the included file named “AnalysisData.csv”.
In this file, you will find data for 6098 wells from the Midland Basin,
with 1 row per well. The columns in the dataset are as follows:

| Column Name | Column Units | Description Column | Group |
| ------------|--------------|---------------------|-------|
|SurfaceHoleLongitude|Decimal Degrees| The Longitude of the surface hole location|Location|
|SurfaceHoleLatitude|Decimal Degrees| The Latitude of the surface hole location|Location|
|BottomHoleLongitude|Decimal Degrees| The Longitude of the bottom hole location|Location|
|BottomHoleLatitude|Decimal Degrees| The Latitude of the bottom hole location|Location|
| Operator | None (string) | Company that operates the well | Completion |
|CompletionDate | None (date) |Date in which the well was completed| Completion|
|Reservoir | None (string) | Geologic formation that the well is targeting |Geology|
|LateralLength_FT | Feet | Completed length of the horizontal well |Completion|
|ProppantIntensity_LBSPerFT | Pounds / Feet | Amount of proppant (frac sand) per lateral foot used to complete the well | Completion
|FluidIntensity_BBLPerFT | Barrels / Feet | Amount of fluid per lateral foot used to complete the well | Completion
|HzDistanceToNearestOffsetAtDrill | Feet | Horizontal distance to the nearest offset well - measured at the time the well was completed | Well spacing
|HzDistanceToNearestOffsetCurrent | Feet | Horizontal distance to the nearest offset well - measured at current time | Well spacing
|VtDistanceToNearestOffsetCurrent | Feet | Vertical distance to the nearest offset well - measured at the time the well was completed | Well spacing
|VtDistanceToNearestOffsetAtDrill | Feet | Vertical distance to the nearest offset well - measured at current time | Well spacing
|WellDepth                       | Feet | Depth of the horizontal well | Geology
|ReservoirThickness | Feet | Thickness of the targeted reservoir | Geology
|OilInPlace | Million barrels of oil / square mile | Amount of oil in place for the target reservoir | Geology
|Porosity | Percent | Porosity of the target reservoir | Geology
|ReservoirPressure | PSI |Pressure of the target reservoir | Geology
|WaterSaturation | Percent | % saturation of water in the target reservoir fluid | Geology
|StructureDerivative | Percent | % change in depth of the target formation - proxy for geologic faults | Geology
|TotalOrganicCarbon | Percent | % of total organic carbon of the target formation | Geology
|ClayVolume | Percent | % clay of the target reservoir | Geology
|CarbonateVolume | Percent | % carbonate of the target reservoir | Geology
|Maturity |Percent |Maturity of the target reservoir |Geology|
|TotalWellCost_USDMM |Millions of dollars |Total cost of the horizontal well |Completion|
|CumOil12Month |Barrels of oil| Amount of oil produced in the first 12 months of production |Production
|rowID |None (ID) |unique identifier for each well| ID
