# Starting Application
The general guidelines to start and access the application are:
- At the root directory of the application, run: docker-compose build
- At the root directory of the application, run: docker-compose up
- client: http://localhost:3000/
- api: http://localhost:5000/api/time
- database: localhost:5432 (username: postgres; password: mysecurepassword). Accessible via any using universal or postgresql database tool. 

# Delivarables

## Demonstrate the usage of your application
Access via client url : http://localhost:3000/
## Walk us through the architecture of your application

### Current vs. Future ( and discuss Design Trade-offs)

| Component | Current | Future |
| -------|--------------------------|-----------------------------|
|ui/client|React (initialize state); <br>SPA; <br>Plotly (synonymous to d3.js)| PWA; <br>production compatible; <br>Security & dependency in docker;|
|Database|empty i.e. No input/output data| Persist data (init.sql (or) loaded image); <br>Save output data; <br>More run time scripts; <br>production compatible; <br>Security; <br>db management;|
|Api|Python Flask; <br>application interface to UI + analytics| convert to Go <br> Dedicated api container; <br>production compatible;|
|Dockers|Minor standardizations | More standardization; <br> More secure; <br>More automation for continuous deployment; <br> Reuse of generic containers in multiple algorithms (customize via docker-compose)|
|Analytics|Python Flask; <br>analytics/insights | standard tests; <br> production compatible;|

### App routing via React
Why use React:
- library instead of framework
- Tech stack independent design (unlike)
- Uses a Virtual DOM that only re-renders the individual Components after the state has changed, at blazingly fast speeds

### api via Python + Flask
Why Flask:
- Flask is light weight framework. Less dependent components

### database via postgresql
Why posgresql:
- open source
- more advanced json data type support 
- allows for future dedicated cloud database container with db management support (back-up, redundancy etc.)

### Analysis via Python + Flask (NOT done)
- Allows for algorithms

### Suggest how you would change or evolve things given more time
See Standardization.md for details

## Discuss deployment requirements
Software: All open source components (Dockers, NPM/node.js, Python, Database-posgresql)
resources: Disk space of ~5 GB; RAM: 2 GB (Estimate) etc 

### Development
For general development and troubleshooting of individual containers, suggest to use an IDE and set-up to test prior to porting to docker.
All individual docker containers run at root of directory. 

npx :
- set up in IDE
- docker container, at root: docker build -f Dockerfile.client .
  
api command: 
- Set up in IDE
- activate appropriate environment and then module run command in IDE (or) 
- command prompt: flask run 
- docker container, at root: docker build -f Dockerfile.api .

database : 
- use any universal or postgresql database tool
- docker container, at root: docker build -f Dockerfile.database .

### Production
- docker-compose build
- docker-compose up

## Key References
### Docker
1. https://docs.docker.com/

### React + node.js
1. https://yarnpkg.com/getting-started/install
1. https://stackoverflow.com/questions/49022731/keep-getting-something-is-already-running-on-port-3000-when-i-do-npm-start-o npx kill-port 3000 (windows)
1. https://www.jetbrains.com/help/pycharm/running-and-debugging-node-js.html 

### React + Flask
1. https://realpython.com/the-ultimate-flask-front-end/
1. https://realpython.com/the-ultimate-flask-front-end-part-2/
1. https://github.com/shoyo/react-flask-docker-boilerplate (Boiler plate solution)
1. https://github.com/martindavid/flask-react-docker-app (With more features such as authentication)
1. https://blog.miguelgrinberg.com/
1. https://github.com/miguelgrinberg/react-flask-app (Boiler plate)
1. https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project
1. https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-xvii-deployment-on-linux
1. https://www.fullstackpython.com/react.html

### Database
1. https://github.com/sameersbn/docker-postgresql/
1. https://stackoverflow.com/questions/46981073/how-to-run-postgres-in-a-docker-alpine-linux-container
1. https://github.com/docker-library/postgres
1. https://cadu.dev/creating-a-docker-image-with-database-preloaded/
1. https://stackoverflow.com/questions/60326148/how-to-create-table-postgresql-when-start-by-docker-compose
1. https://docs.docker.com/samples/postgresql_service/

### Linux
1. https://www.guru99.com/linux-commands-cheat-sheet.html

## Revision History
| Rev. | Date | Description |
| -------|--------------------------|-----------------------------|
|1 | 2021-08-06 | Starting TemplateReact (initialize state); <br>SPA; <br>Plotly (synonymous to d3.js)|
