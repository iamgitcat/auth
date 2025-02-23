# Ente CLI

The Ente CLI is a Command Line Utility for exporting data from
[Ente](https://ente.io). It also does a few more things, for example, you can
use it to decrypting the export from Ente Auth.

## Install

The easiest way is to download a pre-built binary from the [GitHub
releases](https://github.com/ente-io/ente/releases?q=tag%3Acli-v0&expanded=true).

You can also build these binaries yourself

```shell
./release.sh
```

Or you can build from source

```shell
 go build -o "bin/ente" main.go
```

The generated binaries are standalone, static binaries with no dependencies. You
can run them directly, or put them somewhere in your PATH.

There is also an option to use [Docker](#docker).

## Usage

Run the help command to see all available commands.

```shell
ente --help
```

### Accounts

If you wish, you can add multiple accounts (your own and that of your family members) and export all data using this tool.

#### Add an account

```shell
ente account add
```

#### List accounts

```shell
ente account list
```

#### Change export directory

```shell
ente account update --email email@domain.com --dir ~/photos
```

### Export

#### Start export

```shell
ente export
```

### CLI Docs
You can view more cli documents at [docs](docs/generated/ente.md).
To update the docs, run the following command:

```shell
go run main.go docs
```


## Docker

If you fancy Docker, you can also run the CLI within a container.

### Configure

Modify the `docker-compose.yml` and add volume. ``cli-data`` volume is
mandatory, you can add more volumes for your export directory.

Build the docker image

```shell
docker build -t ente:latest .
```

Note that [BuildKit](https://docs.docker.com/go/buildkit/) is needed to build
this image. If you face this issue, a quick fix is to add `DOCKER_BUILDKIT=1` in
front of the build command.

Start the container in detached mode

```shell
docker-compose up -d
```

`exec` into the container
```shell
docker-compose exec ente /bin/sh
```

#### Directly executing commands

```shell
docker run -it --rm ente:latest ls
```
