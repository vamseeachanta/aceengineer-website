# Standards and Guidelines

The standards and guidelines and their priority are to be balanced with the product stage and priorities. Reallocate priority in an agile manner as needed for product stage. 

## Product Timelines
| S.No | Product Stage | Summary | End Date | Status  
| ----|--------------|---------------------|-------|----
|01|POC| 1-2 users|2021-10-30|80%
|02|MVP1| 10-15 users, daily summary |2021-11-30|L

## Standards

| S.No | Description | Standard | Tools | Priority (H/M/L) | Status  
| ----|--------------|---------------------|-------|----|-------
|01|Style Guide| PEP8|autoformatters(yapf, isort)|L|?
|02|Configuration| ? |pipelines, yaml, json|L|?
|03|Docker| docker-compose, scripting |?|L|?
|04|Logging| service type vs. docker |?|M|?
|05|Security| encryption, packages |?|L|?

## Guidelines

| S.No | Description | Methods | Priority (H/M/L) | Status  
| ----|----------|---------------------------|----|-------
|01|Clean Code|function naming, refactor etc|L|?
|02|Refactor |if code unclear when revisiting, consider refactoring|L|?
|03|Health Monitoring |result availability, service health, failure tracking|H|?
|04|Notifications |website, daily summary emails|L|?

**High-level approach:** <br> 
-Unify common code routines in various areas:
- UI, API, database <br>
- CI/CDs

-Algorithm Run architectures
- Scheduled 
- run on demand 
- near-real-time 
- run time opt., etc.
- Scheduled vs. On-demand

-Result save
- Database
- format

-Result delivery 
- Web, 
- RESTful API
- alerts & notifications

-Cost optimization

-Phased algorithm implementation
- POC
- MVPs<br>
- **After implementing 2-3 algorithms, trends can be identified for further standardization. Phased approach with Incremental Improvement/Innovations**

## Revision History
| Rev. | Date | Description |
| -------|--------------------------|-----------------------------|
|1 | 2021-08-06 | Starting TemplateReact (initialize state); <br>SPA; <br>Plotly (synonymous to d3.js)|
