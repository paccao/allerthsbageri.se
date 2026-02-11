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

### One-liners for debugging
```bash
# Open bash in container for debugging
docker run -dit latest bash

# Build with cache and run
docker build -t latest . && docker exec -it `docker run -dit latest bash` bash

# Build without cache and run
docker build --progress=plain --no-cache -t latest . && docker exec -it `docker run -dit latest bash` bash

# Run without building
docker exec -it `docker run -dit latest bash` bash
```

## Stop running containers

```bash
# Stop ALL running containers (careful)
docker container stop `docker ps | awk 'NR>1 {print $1}'`
```

## Free disk space
```bash
# Images
docker image prune
# Containers
docker container prune
```
