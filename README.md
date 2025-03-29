<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Tesla Shop API


## Ejecutar en desarrollo:

1. Clonar repositorio
2. Ejecutar:
```
npm install
```
3. Tener Nest CLI instalado
```
npm install -g @nestjs/cli
```
4. Levantar Base de Datos
```
docker-compose up -d
```
5. Clonar archivo ```.env.template``` y renombrar a ```.env```

6. Llenar variables de entorno definidas en el ```.env```

7. Correr App
```
npm run start
```
8. Recargar/Recontruir Base de Datos con la semilla
```
http://localhost:3000/api/v1/seed
```



## Stack usado:

* PostgresSQL
* NestJs


