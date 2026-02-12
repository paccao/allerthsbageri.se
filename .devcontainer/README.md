## Build

```bash
docker build -t latest .
```

## Build with debugging

```bash
docker build --progress=plain --no-cache -t latest .
```

## Run node

```bash
docker run latest
```

## Build, run and enter container
```bash
# With cache
docker build -t latest . && docker exec -it `docker run -dit latest bash` bash

# Without cache
docker build --no-cache -t latest . && docker exec -it `docker run -dit latest bash` bash
```

## Stop all running containers
```bash
# Stop ALL running containers (careful)
docker container stop `docker ps | awk 'NR>1 {print $1}'`
```
